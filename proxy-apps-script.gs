/**
 * Nova — Proxy Apps Script (v4)
 * Rôles : relais vers l'API Mistral + mémoire synchronisée + Google Agenda + RECHERCHE WEB.
 * La clé API vit dans les Script Properties : jamais dans le code ni dans le repo.
 *
 * MISE À JOUR depuis la v3 (recherche web) :
 * 1. Remplace tout Code.gs par ce fichier.
 * 2. Déployer ▸ Gérer les déploiements ▸ ✏️ ▸ Nouvelle version ▸ Déployer (URL inchangée).
 *    (Pas de nouvelle autorisation nécessaire si l'agenda marchait déjà.)
 *
 * Endpoints (appelés par Nova) :
 *   GET  ?action=mem        → renvoie la mémoire synchronisée (JSON)
 *   POST ?action=mem        → { memories: [...], mode: "replace" } → enregistre, renvoie la liste
 *   GET  ?action=agenda     → événements Google Agenda du jour (JSON)
 *   GET  ?action=search&q=X → recherche web DuckDuckGo (JSON : [{title, url, snippet}])
 *   GET  (sans action)      → test : "Nova proxy en ligne (v4)"
 *   POST (sans action)      → relais chat vers l'API Mistral (limite 300 appels/jour)
 */

var MAX_APPELS_PAR_JOUR = 300;
var MAX_MEMOIRES = 200;

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function textOut(txt) {
  return ContentService.createTextOutput(txt).setMimeType(ContentService.MimeType.TEXT);
}

/* ============ MÉMOIRE SYNCHRONISÉE ============ */
function getMemory() {
  var raw = PropertiesService.getScriptProperties().getProperty('NOVA_MEMOIRE');
  var mems = [];
  if (raw) { try { mems = JSON.parse(raw); } catch (e) { mems = []; } }
  if (!Array.isArray(mems)) mems = [];
  return mems.filter(function (m) { return typeof m === 'string' && m.trim(); });
}
function setMemory(list) {
  if (!Array.isArray(list)) list = [];
  list = list.filter(function (m) { return typeof m === 'string' && m.trim(); })
             .slice(-MAX_MEMOIRES);
  PropertiesService.getScriptProperties().setProperty('NOVA_MEMOIRE', JSON.stringify(list));
  return list;
}
function mergeMemory(list) {
  if (!Array.isArray(list)) return getMemory();
  var mems = getMemory();
  list.forEach(function (m) {
    if (typeof m === 'string' && m.trim() &&
        !mems.some(function (x) { return x.toLowerCase() === m.trim().toLowerCase(); })) {
      mems.push(m.trim());
    }
  });
  return setMemory(mems);
}

/* ============ GOOGLE AGENDA ============ */
function getAgenda() {
  var cal = CalendarApp.getDefaultCalendar();
  var evts = cal.getEventsForDay(new Date());
  return evts.map(function (e) {
    return {
      title: e.getTitle() || '(sans titre)',
      start: Utilities.formatDate(e.getStartTime(), 'Europe/Paris', 'HH:mm'),
      end: Utilities.formatDate(e.getEndTime(), 'Europe/Paris', 'HH:mm'),
      location: e.getLocation() || ''
    };
  });
}

/* À exécuter UNE FOIS dans l'éditeur pour autoriser l'accès agenda : */
function autoriser() {
  CalendarApp.getDefaultCalendar().getEventsForDay(new Date());
}

/* ============ RECHERCHE WEB (DuckDuckGo lite) ============ */
function htmlDecode(s) {
  return s.replace(/<[^>]*>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;|&#39;|&apos;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\s+/g, ' ')
          .trim();
}
function webSearch(q) {
  q = String(q || '').trim();
  if (!q) return [];
  var res = UrlFetchApp.fetch('https://lite.duckduckgo.com/lite/?q=' + encodeURIComponent(q),
    { muteHttpExceptions: true, followRedirects: true });
  var html = res.getContentText();
  var out = [];
  // liens de résultats
  var re = /<a[^>]*class="result-link"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
  var m;
  while ((m = re.exec(html)) !== null && out.length < 6) {
    var url = m[1];
    var dm = url.match(/[?&]uddg=([^&]+)/);
    if (dm) url = decodeURIComponent(dm[1]);
    var title = htmlDecode(m[2]);
    if (url.indexOf('http') === 0 && title) out.push({ title: title, url: url, snippet: '' });
  }
  // extraits associés (même ordre dans la page)
  var reS = /class="result-snippet"[^>]*>([\s\S]*?)<\/td>/g;
  var i = 0, ms;
  while ((ms = reS.exec(html)) !== null && i < out.length) {
    out[i].snippet = htmlDecode(ms[1]).slice(0, 300);
    i++;
  }
  return out;
}

/* ============ LIMITE QUOTIDIENNE ============ */
function compterEtVerifier() {
  var today = Utilities.formatDate(new Date(), 'Europe/Paris', 'yyyy-MM-dd');
  var cache = CacheService.getScriptCache();
  var compte = cache.get('compte_' + today);
  var n = compte ? parseInt(compte, 10) : 0;
  if (n >= MAX_APPELS_PAR_JOUR) throw new Error('Limite de ' + MAX_APPELS_PAR_JOUR + ' appels/jour atteinte sur ce proxy.');
  cache.put('compte_' + today, String(n + 1), 86400);
}

/* ============ ROUTAGE ============ */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || '';
  try {
    if (action === 'mem') return jsonOut(getMemory());
    if (action === 'agenda') return jsonOut(getAgenda());
    if (action === 'search') {
      compterEtVerifier();
      return jsonOut(webSearch(e.parameter.q || ''));
    }
  } catch (err) {
    return jsonOut({ error: String(err) });
  }
  return textOut('Nova proxy en ligne (v4, limite ' + MAX_APPELS_PAR_JOUR + ' appels/jour)');
}

function doPost(e) {
  var action = (e && e.parameter && e.parameter.action) || '';
  try {
    /* --- Mémoire --- */
    if (action === 'mem') {
      var body = {};
      try { body = JSON.parse(e.postData.contents); } catch (err) { body = {}; }
      if (body.mode === 'replace') return jsonOut(setMemory(body.memories || []));
      return jsonOut(mergeMemory(body.memories || []));
    }

    /* --- Chat Mistral (limite anti-abus) --- */
    compterEtVerifier();

    var key = PropertiesService.getScriptProperties().getProperty('MISTRAL_KEY');
    if (!key) throw new Error('Clé MISTRAL_KEY absente : exécute setupCle() une fois.');
    var resp = UrlFetchApp.fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + key },
      payload: e.postData.contents,
      muteHttpExceptions: true
    });
    return ContentService.createTextOutput(resp.getContentText()).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return jsonOut({ error: String(err) });
  }
}

/* À décommenter, remplir et exécuter UNE FOI si la clé n'est pas encore enregistrée :
function setupCle() {
  PropertiesService.getScriptProperties().setProperty('MISTRAL_KEY', 'TA_CLE_ICI');
}
*/
