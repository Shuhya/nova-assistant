# Nova — Assistant vocal personnel

> « Système Nova en ligne. »

Nova est un assistant IA personnel à la JARVIS : interface sombre HUD cyan, voix, mémoire qui apprend, brief du matin complet.

## Fonctionnalités
- 💬 **Discussion** : parle à Nova au micro (ou au clavier), elle répond à voix haute
- ☀️ **Brief du matin** : météo Sully-sur-Loire, actus de tes flux RSS, planning du jour
- 🧠 **Mémoire** : Nova retient ce que tu lui dis et se souvient de toi
- ⚙️ **Réglages** : clé API Mistral (stockée uniquement dans ton navigateur), voix, flux RSS

## Installation
1. Ouvre le site dans **Chrome, Edge ou un navigateur Android**
2. **Réglages** → colle ta clé API Mistral (gratuite sur [console.mistral.ai](https://console.mistral.ai))
3. Autorise le micro, appuie sur 🎤 et parle à Nova !

## Stack
HTML/JS autonome · Web Speech API · API Mistral (`mistral-small-latest`) · Open-Meteo · rss2json · localStorage

## Confidentialité
Ta clé API et tes données restent dans le `localStorage` de ton navigateur. Aucune donnée envoyée ailleurs que vers l'API Mistral, Open-Meteo et rss2json.
