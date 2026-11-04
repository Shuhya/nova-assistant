/**
 * Nova — Proxy Apps Script vers l'API Mistral
 * La clé API vit dans les Script Properties : jamais dans le code ni dans le repo.
 *
 * INSTALLATION (5 min) :
 * 1. script.google.com → Nouveau projet → "Nova Proxy"
 * 2. Colle tout ce fichier dans Code.gs
 * 3. Dans l'éditeur, exécute une fois la fonction setupCle() après avoir
 *    remplacé TA_CLE_ICI par ta clé Mistral (console.mistral.ai) :
 *      function setupCle() {
 *        PropertiesService.getScriptProperties().setProperty('MISTRAL_KEY', 'TA_CLE_ICI');
 *      }
 *    (Autorise le script quand Google le demande.)
 * 4. Déployer → Nouveau déploiement → type "Application Web" :
 *      - Exécuter en tant que : Moi
 *      - Accès : "Tous les utilisateurs disposant du lien" (même sans compte Google)
 * 5. Copie l'URL qui se termine par /exec → colle-la dans Nova ▸ Réglages ▸ "URL du proxy Apps Script"
 */

function doPost(e) {
  try {
    var key = PropertiesService.getScriptProperties().getProperty('MISTRAL_KEY');
    if (!key) throw new Error('Clé MISTRAL_KEY absente : exécute setupCle() une fois.');
    var payload = e.postData.contents; // JSON envoyé par Nova (messages, modèle…)

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

// Test rapide : ouvre l'URL /exec dans un navigateur → doit afficher "Nova proxy en ligne"
function doGet() {
  return ContentService
    .createTextOutput('Nova proxy en ligne')
    .setMimeType(ContentService.MimeType.TEXT);
}
