# Nova — Assistant vocal personnel

> « Système Nova en ligne. »

Nova est un assistant IA personnel à la JARVIS : interface sombre HUD cyan, voix, mémoire synchronisée entre appareils, brief du matin complet (météo, actus, planning, Google Agenda).

## Fonctionnalités
- 💬 **Discussion** : parle à Nova au micro (ou au clavier), elle répond à voix haute
- ☀️ **Brief du matin** : météo Sully-sur-Loire, actus RSS, planning local, **Google Agenda**
- 🧠 **Mémoire synchronisée** : Nova retient des choses et s'en souvient sur **tous tes appareils** (stockage côté Google)
- ⚙️ **Réglages** : proxy, voix, flux RSS — préconfiguré, rien à faire

## Architecture
```
Navigateur (PC / téléphone)
   │  fetch
   ▼
Apps Script « Nova Proxy » (proxy-apps-script.gs)
   ├─ POST            → API Mistral (clé dans Script Properties, jamais exposée)
   ├─ ?action=mem     → mémoire synchronisée (Properties)
   └─ ?action=agenda  → Google Agenda du jour
```
- Zéro configuration : l'URL du proxy est intégrée dans `index.html` (`DEFAULT_PROXY`)
- Limite anti-abus : 300 appels/jour
- Météo : Open-Meteo · Actus : rss2json · Voix : Web Speech API

## Mise à jour du proxy
1. Colle [`proxy-apps-script.gs`](proxy-apps-script.gs) dans Code.gs
2. Exécute `autoriser()` une fois (autorise l'accès agenda)
3. Déployer ▸ Gérer les déploiements ▸ ✏️ ▸ Nouvelle version ▸ Déployer (URL inchangée)

## Confidentialité
La clé API vit dans les Script Properties du compte Google du propriétaire. Les souvenirs synchronisés aussi. Rien d'exploitable dans ce repo.
