# HANDOFF — Sito Centro Casa (aggiornato 12/10/2026, sessione 3 completata)

Cartella: `C:\Users\Luisl\Documents\claude\CENTRO CASA SITO`
Anteprima: `python -m http.server 5180 --bind 127.0.0.1` nella cartella, poi `http://localhost:5180/` nel browser pane (il pane non apre `file://`).

## COMPLETATO IN SESSIONE 3

### 1. Home: galleria "a cascata" (`#galleria`, `[data-cascade]`) con TUTTE le 73 foto, subito dopo `#categorie`
- Colonna infinita 3D (ispirata a HorizonX "Rotating Gallery") guidata dallo scroll con `pin` + `scrub`, rotazione `rotateY` (`spin`), torsione diagonale `rotateX`/`rotateZ` (`twist`), parallasse interna (`offsetY`), `drift` morbido, trascinamento (`drag`), messa a fuoco al tocco (`tap-to-focus`) e pulsanti `↑`/`↓`.
- Tutte le 73 foto (`assets/img/*.webp` tranne `logo.webp`) con `loading="lazy"`, `decoding="async"`, `alt` descrittivi e link esclusivo alla rispettiva pagina categoria (mai a WhatsApp).
- Griglia statica di fallback con `prefers-reduced-motion`; versione mobile leggera senza pin né scroll orizzontale.

### 2. Home: sezione FAQ (`#faq`) subito dopo `#recensioni`
- Inserite le 6 domande principali verificate (orari, dove siamo, appuntamento, misure e progetto, trasporto e montaggio, pagamento a rate) + link "Tutte le domande" → `faq.html` (JSON-LD `FAQPage` mantenuto solo in `faq.html`).
- Stili `.faq*` e `.cat-end*` spostati da `categorie.css` a `styles.css`.

### 3. Animazioni di scroll stile Dantora Edition (`component-library/dantora-edition`)
- **StackingBlock Curtains:** ogni macro-sezione sale sopra la precedente con angoli superiori arrotondati (`38px`), bordo luminoso superiore, ombra profonda e leggero arretramento 3D (`scale: 0.975`, `brightness(0.92)`) della sezione sottostante.
- **Word Blur-Scrub Reveal:** titoli `[data-split]`, `.lead` e `.quote` si mettono a fuoco parola per parola (`blur` → `0px`, `opacity` → `1`) in sincronia con lo scroll.
- **Services Rail & Blur-Rise Stagger:** parallasse orizzontale sulle foto del binario `[data-hscroll]` con barra di avanzamento e ingresso morbido sfocato-nitido su card, gallerie, servizi e FAQ.

## Stato attuale
Sito multipagina, HTML/CSS/JS statico, stile minimal della bozza `CENTRO CASA/dist` (va solo letta).
Menu: Cucine · Arredamento (sottomenu con i 6 reparti) · Bomboniere · Chi siamo e orari · FAQ + "Prenota una visita" (WhatsApp). Barra fissa su mobile: Chiama / WhatsApp / Indicazioni.
- `index.html`:
  1. barra aperto/chiuso e hero (titolo parola per parola, voto 4,9);
  2. foto showroom che da card si allarga a tutto schermo (pin + clip-path);
  3. `#categorie` (galleria orizzontale bloccata, ogni card apre la sua pagina);
  4. `#galleria` (galleria 3D a cascata con tutte le 73 foto collegate ai reparti);
  5. `#offerta` €6.290 (sfondo carta→verde, prezzo che conta);
  6. `#recensioni` (3 recensioni impilate);
  7. `#faq` (6 domande frequenti + link a `faq.html`);
  8. chiusura con link a orari e FAQ.
- `cucine.html`: 6 foto impilate in sezione bloccata + servizi + galleria.
- `arredamento.html`: indice con 6 card. Pagine reparto `camere`, `divani`, `materassi`, `tavoli`, `elettrodomestici`, `complementi` (.html). Ognuna ha barra di link tra reparti, testo, foto clip-reveal + parallax, galleria con lightbox, CTA WhatsApp dedicata.
- `bomboniere.html`: galleria orizzontale bloccata + vantaggi + tutte le bomboniere.
- `chi-siamo.html`: chi siamo (Danilo e Maria, servizi) → showroom in parallax → foto → `#orari` (orari, mappa, contatti, cataloghi PDF).
- `faq.html`: 12 domande `<details>` + JSON-LD FAQPage.
- `categorie.html`: solo redirect dei vecchi indirizzi.
- File condivisi:
  - `styles.css`: token, header con sottomenu, componenti, home, galleria 3D a cascata, FAQ, blocchi a tendina Dantora;
  - `categorie.css`: pagine interne e indice;
  - `main.js`: menu, stato aperto/chiuso, lightbox, Lenis + GSAP ScrollTrigger da CDN (`gsap@3.12.5`, `lenis@1.1.13`), galleria 3D a cascata e animazioni di scroll Dantora.
- Header e footer sono **duplicati nei 12 file HTML**. Gli script Python che li hanno generati erano nello scratchpad della sessione 2 e non ci sono più. Una modifica al menu va fatta in tutti i file.

## Regole dell'utente (vincolanti)
- Stile minimal:
  - colori: carta `#f4f0e9` e `#ebe5da`, inchiostro `#26241f`, accento `#9b735b`, verde `#2f3b31`, linee `#d8d2c8`;
  - Manrope, titoli peso 500 con `letter-spacing:-.075em`, `<em>` color accento non corsivo, etichette 10px maiuscole.
- La versione con titoli rossi in Anton e anello 3D è stata **rifiutata**.
- Scroll interattivo: pin, gallerie orizzontali, clip-path, card impilate, testi per parole, parallax.
- Home **diretta**, ogni cosa nella sua pagina con descrizione e collegamenti dalla home.
- Solo foto vere dell'attività, niente video. **Ogni foto porta alla sua categoria, MAI a WhatsApp**: WhatsApp solo sui bottoni CTA.
- Agire senza chiedere conferme, tranne pagamenti, invii, pubblicazioni e cancellazioni.
- Prima di lavori UI invocare la skill `ui-ux-pro-max`.

## Dati verificati (fonti in SOURCES.md)
- Tel 0825 967114 · cellulare/WhatsApp 388 153 5764 (`wa.me/393881535764`) · info@centrocasaitalia.it · P.IVA 02555250642 · Via Roma 18, 83039 Pratola Serra (AV).
- Orari: Lun 16–20 · Mar–Sab 9–12:30 e 16–20 · Domenica su appuntamento.
- Google 4,9 su 25 recensioni. Titolare Danilo, Maria segue le bomboniere. Da oltre 50 anni.
- Promo €6.290 (cucina, tavolo, camera, divano, parete TV, trasporto e montaggio, anche a rate): sempre con la nota "condizioni da verificare in showroom".
- Claraluna rivenditori; 50 partecipazioni in omaggio con almeno 50 bomboniere.
- Da confermare col negozio: promo €6.290 ancora valida, pagamento a rate in generale, condizioni di trasporto e montaggio, logo ufficiale, foto showroom ad alta risoluzione.
- Non inventare marchi o materiali.

## Insidie note
- **Pin GSAP:** vanno creati nell'ordine di pagina, con `refreshPriority: 1` e `ScrollTrigger.sort()` dentro `gsap.matchMedia`. Altrimenti i pin più in basso partono nel punto sbagliato (successo in sessione 2: 2.900px di errore).
- **Classi:** `.rev` = card recensione, `.flip` = stanza con foto a destra. Non riusare `.rev` per altro.
- **Ancore e hash:** con Lenis, gli hash da un'altra pagina li gestisce `goTo()` in `main.js` dopo `load`.
- **Viewport nel browser pane:** l'emulazione si azzera quando il pane cambia larghezza; reimposta `resize_window` all'inizio di ogni batch di screenshot.
- **Browser dell'utente:** è Brave (download automatici bloccati, permesso "rete locale" per localhost).
