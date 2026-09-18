# Gestione Trasferte

Progressive Web App mobile-first che replica il file Excel `Dashboard_Gestione_Trasferte_v3.xlsx`.

## Sezioni replicate

- **Riepilogo**: totale trasferte, richieste scadute, richieste entro 7 giorni, trasferte da chiudere, legenda alert e tabella delle prime 25 trasferte.
- **Calendario visuale**: selezione di mese e anno, giorni numerici, trasferte evidenziate con gli stessi cinque stati colore del foglio.
- **Trasferte**: tutti i campi pre-partenza e post-trasferta del workbook, ricerca, filtri, modifica ed eliminazione.
- **Liste**: valori ammessi per i menu, backup JSON, importazione e riepilogo CSV.

## Calcoli automatici

- Scadenza richiesta: 14 giorni prima della partenza.
- Alert: `SCADUTA`, `ENTRO 7 GG`, `DA PROGRAMMARE` oppure `OK`.
- Percentuale di chiusura: sette controlli documentali, come nel foglio Excel.
- Stato complessivo: `PROGRAMMATA`, `RICHIESTA DA COMPLETARE`, `IN CORSO`, `DA CHIUDERE`, `CHIUSA` oppure `ANNULLATA`.

## Dati e installazione

I dati sono salvati nel `localStorage` del browser: ogni dispositivo conserva un archivio indipendente. La sezione Liste permette di esportare e importare un backup JSON.

Al primo avvio vengono mostrati cinque record dimostrativi anonimi, sostituibili o eliminabili direttamente dall'app.

L'app è installabile da Chrome su Android tramite **Aggiungi a schermata Home** e funziona offline dopo il primo caricamento.

## Pubblicazione

Il workflow in `.github/workflows/deploy-pages.yml` pubblica automaticamente il branch `main` su GitHub Pages.
