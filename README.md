# SSG Admin

React admin dashboard per la gestione del API Gateway SSG.

## Descrizione

SSG Admin è un'applicazione React che permette di monitorare lo stato del gateway API. Include autenticazione tramite Firebase Auth e visualizzazione in tempo reale dello stato dei servizi.

## Prerequisiti

- Node.js 18+
- npm o yarn
- Account Firebase configurato
- Gateway API in esecuzione

## Installazione

```bash
# Clona il repository
git clone <repository-url>
cd ssg-admin

# Installa le dipendenze
npm install

# Configura le variabili ambiente
cp .env.example .env
# Modifica .env con le tue credenziali Firebase
```

## Configurazione

Crea un file `.env` con le seguenti variabili:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GATEWAY_URL=http://localhost:8080
```

## Utilizzo

```bash
# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build

# Anteprima build produzione
npm run preview
```

## Stack Tecnologico

- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **Auth**: Firebase Auth
- **Routing**: React Router v6

## Struttura Progetto

```
src/
├── components/ui/    # Componenti UI (Button, Card, Input, Label)
├── contexts/         # Context React (AuthContext)
├── lib/              # Configurazioni (Firebase, utils)
├── pages/            # Pagine (Login, Home)
├── App.tsx           # Routing principale
└── main.tsx          # Entry point
```

## License

MIT License - vedi file [LICENSE](LICENSE)
