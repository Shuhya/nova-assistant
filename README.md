# Nova — Assistant vocal personnel

> « Système Nova en ligne. »

Nova est un assistant IA personnel à la JARVIS : interface sombre HUD cyan, voix, mémoire qui apprend, brief du matin complet.

## Fonctionnalités
- 💬 **Discussion** : parle à Nova au micro (ou au clavier), elle répond à voix haute
- ☀️ **Brief du matin** : météo Sully-sur-Loire, actus de tes flux RSS, planning du jour
- 🧠 **Mémoire** : Nova retient ce que tu lui dis et se souvient de toi
- ⚙️ **Réglages** : proxy Apps Script (recommandé) ou clé API locale, voix, flux RSS

## Installation
1. Ouvre le site dans **Chrome, Edge ou un navigateur Android**
2. **Cerveau (2 options)** :
   - **Option A — Proxy Apps Script (recommandé)** : déploie [`proxy-apps-script.gs`](proxy-apps-script.gs) (instructions dedans), puis colle l'URL `/exec` dans Nova → Réglages. Ta clé reste côté Google, tous les appareils partagent le même cerveau, rien à re-rentrer.
   - **Option B — clé locale** : colle ta clé Mistral ([console.mistral.ai](https://console.mistral.ai)) dans Réglages. Stockée uniquement dans ce navigateur.
3. Autorise le micro, appuie sur 🎤 et parle à Nova !

## Stack
HTML/JS autonome · Web Speech API · API Mistral (`mistral-small-latest`) via proxy Google Apps Script · Open-Meteo · rss2json · localStorage

## Confidentialité
Avec le proxy : la clé API n'apparaît ni dans le code ni dans le repo, elle vit dans les Script Properties de ton compte Google. Tes souvenirs et préférences restent dans le localStorage de chaque navigateur.
