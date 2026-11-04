/**
 * Nova — Proxy Apps Script vers l'API Mistral (v2)
 * La clé API vit dans les Script Properties : jamais dans le code ni dans le repo.
 * Nouveauté v2 : limite anti-abus — 300 appels par jour maximum (protection du quota).
 *
 * INSTALLATION :
 * 1. script.google.com → projet "Nova Proxy" → colle tout ce fichier dans Code.gs
 * 2. En bas du fichier, décommente setupCle(), mets ta clé à la place de TA_CLE_ICI,
 *    exécute setupCle une fois, puis recommente/supprime la fonction.
 * 3. Déployer → Gérer les déploiements → ✏️ → "Nouvelle version" → Déployer
 *    (l'URL reste la même). Nouveau déploiement : nouvelle URL → mettre à jour
 *    DEFAULT_PROXY dans index.html ou l'URL dans Nova ▸ Réglages.
 */

var MAX_APPELS_PAR_JOUR = 300;

function doPost(e) {
  try {
    // --- Limite anti-abus : 300 appels/jour ---
    var props = PropertiesService.getScriptProperties();
    var today = Utilities.formatDate(new Date(), 'Europe/Paris', 'yyyy-MM-dd');
    var cache = CacheService.getScriptCache();
    var compte = cache.get('compte_' + today);
    var n = compte ? parseInt(compte, 10) : 0;
    if (n >= MAX_APPELS_PAR_JOUR) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Limite de ' + MAX_APPELS_PAR_JOUR + ' appels/jour atteinte sur ce proxy.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    cache.put('compte_' + today, String(n + 1), 86400);

    // --- Appel Mistral ---
    var key = props.getProperty('MISTRAL_KEY');
    if (!key) throw new Error('Clé MISTRAL_KEY absente : exécute setupCle() une fois.');
    var payload = e.postData.contents;

    var resp = UrlFetchApp.fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + key },
      payload: payload,
      muteHttpExceptions: true
    });

    return ContentService
      .createTextOutput(resp.getContentText())
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test navigateur : doit afficher "Nova proxy en ligne"
function doGet() {
  return ContentService
    .createTextOutput('Nova proxy en ligne (v2, limite ' + MAX_APPELS_PAR_JOUR + ' appels/jour)')
    .setMimeType(ContentService.MimeType.TEXT);
}

// À décommenter, remplir et exécuter UNE FOIS, puis re-supprimer :
// function setupCle() {
//   PropertiesService.getScriptProperties().setProperty('MISTRAL_KEY', 'TA_CLE_ICI');
// }
