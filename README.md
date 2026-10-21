# Manager in 15

Web app installabile su iPhone (PWA), ispirata a 4books: riassunti in formato audiolibro di circa 15 minuti dei principali libri di crescita personale e management, per imparare a diventare manager.

## Cosa contiene

- **50 riassunti in italiano** da circa 15 minuti, ognuno con capitoli, idee chiave, una storia o un caso concreto, una sezione su come applicarlo da Scrum Master e team leader in un contesto lean e agile, esercizi pratici e i punti cardine finali.
- **9 percorsi guidati**: Da collaboratore a manager · Scrum Master al massimo livello · Guidare team tecnici · Lean e flusso del valore · Software, DevOps e organizzazione · Guidare le persone · Conversazioni difficili · Pensare in termini di prodotto · La crescita personale del leader.
- **Ricerca** per titolo, autore o tema e filtri per categoria.
- **Player audio** con velocità (0,8×–2×), salti di 15/30 secondi, capitoli, timer di spegnimento, controlli dalla schermata di blocco e riproduzione in background.
- **Modalità lettura** con dimensione del testo regolabile.
- **Libreria**: progressi salvati, libri salvati, completati, minuti ascoltati.
- **Offline**: l'app e i testi funzionano senza rete; gli audio si possono scaricare sul dispositivo.
- **Copertine delle edizioni italiane**, scaricate durante il deploy da Open Library e Google Books. Se un libro non ha un'edizione italiana con copertina si usa quella originale, e se manca anche quella l'app mostra una copertina grafica. Per forzare un'edizione precisa aggiungi `"coverIsbn"` al libro in `data/books.json`; `covers/sources.json` indica da dove arriva ogni copertina.

## Come viene generato l'audio

Gli MP3 vengono creati automaticamente da GitHub Actions a ogni push su `main` con [Piper](https://github.com/OHF-Voice/piper1-gpl), una sintesi vocale neurale che gira offline, usando la voce italiana `it_IT-paola-medium`. Lo script è `scripts/generate_audio.py`; gli audio già generati vengono messi in cache e rigenerati solo se il testo cambia.

Se gli MP3 non sono disponibili, l'app legge il testo con la voce italiana del dispositivo (in questo caso serve tenere lo schermo acceso).

## Pubblicazione (una volta sola)

1. Su GitHub apri **Settings → Pages** e in **Source** scegli **GitHub Actions**.
2. Fai il merge su `main` (oppure avvia a mano il workflow **Genera audio e pubblica** da **Actions**).
3. Al termine (la prima generazione degli audio richiede qualche decina di minuti) l'app è online su `https://<utente>.github.io/4books/`.

### Copertine italiane più complete (facoltativo)

Senza chiave, Google Books condivide un limite giornaliero di richieste che spesso è già esaurito, e molte copertine italiane non si trovano. Per usare una chiave gratuita:

1. Su [Google Cloud Console](https://console.cloud.google.com/) crea un progetto, abilita **Books API** e crea una **chiave API**.
2. Nel repository GitHub apri **Settings → Secrets and variables → Actions → New repository secret**, nome `GOOGLE_BOOKS_API_KEY`, valore la chiave.
3. Rilancia il workflow da **Actions → Genera audio e pubblica → Run workflow**.

## Installazione su iPhone

1. Apri l'indirizzo dell'app con **Safari**.
2. Tocca il pulsante **Condividi** (il quadrato con la freccia).
3. Scegli **Aggiungi alla schermata Home**.

L'app si apre a schermo intero come un'app nativa. Per ascoltare senza rete, apri un riassunto nel player e tocca **Scarica**, oppure da **Libreria → Scarica tutti gli audio**.

## Sviluppo in locale

```bash
# server statico con supporto alle richieste Range (necessarie per l'audio)
npx http-server -p 8080 -c-1

# generare gli audio in locale (richiede ffmpeg)
pip install piper-tts==1.8.0
mkdir -p voices && cd voices
curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/it/it_IT/paola/medium/it_IT-paola-medium.onnx
curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/it/it_IT/paola/medium/it_IT-paola-medium.onnx.json
cd .. && python scripts/generate_audio.py --model voices/it_IT-paola-medium.onnx
```

Per aggiungere un libro: crea `data/summaries/<id>.md` (capitoli con `## `) e aggiungi la scheda in `data/books.json`.

I riassunti sono sintesi originali scritte per scopo di studio personale e non sostituiscono la lettura dei libri.
