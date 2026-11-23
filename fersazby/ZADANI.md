# FérSazby (fersazby.cz)

Nový web pro Denisu Holazovou (finanční poradkyně; stávající web holazova.cz, repo ~/coolify-migrace/vizitky/denisa-holazova).
Projekt založen 20. 11. 2026 (Vojta). Předloha funkcí a textů: nejsazby.cz (Ergonomy Group, ProcessWire).

## Zadání od klientky (mail 19. 11. 2026 Vojtovi, doslovně podstatné)
- Doména www.fersazby.cz, mail info@fersazby.cz; koupí i fersazba.cz. Hlavní fersazby.cz. (20. 11. obě domény VOLNÉ.)
- Nahoře jako první kolonky: Úvěr na cokoliv „Chci nový úvěr s fér sazbou“; Konsolidace „Chci ušetřit na splátkách díky fér konsolidaci“; Spočítat hypotéku „Chci fér sazbu na hypotéku“; Pojištění vozidla „Chci fér pojistné pro své auto“.
- „fér sazby“ jako hezký brand nahoře, za tím spokojená rodinka nebo příjemné pozadí.
- Rychlý vstupní formulář hned nahoře: zadat kolik dluží / kolik potřebuje a aktuální splátku (viz nejsazby.cz), žádné dlouhé čtení.
- Posuvník splatnosti ponechat, výchozí 240 měsíců, plus políčko pro ruční zápis v měsících.
- Nabídky úroků zatím zachovat jak jsou (= tabulky bank na nejsazby.cz/*/nabidky/).
- Ověření SMS po zadání údajů (ať neklikají jen tak). Poptávky na info@fersazby.cz.
- Hlavně mobil (95 % lidí z telefonu).
- Ostatní texty zatím cca jako nejsazby.cz, upraví se společně.

## Jak funguje nejsazby.cz (stav 20. 11.)
- Kalkulačky: úvěr (výše, 12–120 měs.), konsolidace (výše 250 000–1 500 000, 12–240 měs.), hypotéka (cena nemovitosti, výše, 1–30 let, fixace 1–20 let, splátka).
- „Chci vidět nabídky“ → /…/nabidky/: „Naše sazba“ (úvěr/konsolidace 4,00 %, hypotéka 3,99 %) + seznam bank se sazbou a splátkou (KB 4,70, RB 4,80, ČS 4,97, mBank 4,99, Moneta 4,87/6,33, ČSOB 6,21/8,01, UniCredit 6,49, ESSOX 7, Cofidis 8,70; hypo RB 4,79 … ČSOB 5,99).
- Pak formulář: jméno, příjmení, e-mail, telefon, čistý příjem, zdroj příjmů, otázky exekuce/registr/prodlení, bydlení (hypotéka navíc typ nemovitosti a účel).
- Screeny mobil v podklady/nejsazby-screeny.
- Pojištění vozidla na nejsazby.cz NENÍ, je nové.

## Feedback Vojty
Zatím nic.

## Stav 20. 11. 2026 (postaveno)
- Kód: ~/coolify-migrace/vizitky/fersazby (repo emil-asistent/vizitky). Stránky se generují `node src/build.mjs` z src/data.mjs (sazby, texty kategorií) → public/.
- Náhled: https://fersazby.gomatela.cz (Coolify vh8jqkhd5qochfooifqjvkin, port 8257, tunel home-server-vizitky, noindex).
- Design: barvy a písma money2u (holazova.cz), vlastní kompozice. Fotky AI přes `obrazek` (zdroje foto-src/, mimo git).
- Poptávka: formulář → SMS kód (4 číslice, 15 min, 5 pokusů, 3× znovu) → mail. Náhled: SMS_PROVIDER=log (kód se ukáže na webu), maily s [NÁHLED] na PREVIEW_MAIL_TO.
- Zbývá: SMS brána (BulkGate, účet + kredit), domény fersazby.cz + fersazba.cz (Vojta přes Blueboard) → CF zóna, tunel, schránka info@fersazby.cz v mailcow (po přidání domény restart SOGo + flush memcached), MAIL_TO, přesměrování fersazba.cz. Potvrdit text patičky (vázaná zástupkyně money2u s.r.o., registr ČNB). Meta/Google měření až nakonec.

## 20. 11. 2026 odpoledne
- Tři návrhy loga (procento s fajfkou, monogram fs, bublina fér), zdroje src/logo/navrhy.py, stránka public/navrhy-loga.html.
- Pro klientku zvlášť na https://navrhy-loga-fersazby.vercel.app (bez odkazu na web). Vojta jí poslal mail, čeká se na výběr loga. Pak logo do webu + favicon.

## 22.–23. 11. 2026 noc (Vojta: „zamakej přes noc“, Denisa vybrala A1)
Rozhodnutí Denisy (mail 22. 11., podklady/denisa-2026-11-22/): logo A1, v hlavičce Kontakt → krátký formulář, pojištění vozidla ZATÍM NE, recenze jen z jejího souboru (26 ks).
Hotovo na náhledu fersazby.gomatela.cz (commity 1d3514c, 0369a43):
- Logo A1 všude: `src/logo/web_a1.py` → `logo-a1.json` → jeden `<symbol>` na stránku, barvy přes CSS proměnné (--l-t/r/f/s/c). Favicony, apple-touch, manifest a og.jpg ze znaku / s A1.
- Hlavička: Úvěr, Konsolidace, Hypotéka, Recenze + tlačítko Kontakt (vedle Kontaktu i telefon, na tabletu jen ikona). Na mobilu Kontakt + menu.
- /kontakt: jméno, e-mail, telefon, téma (4 dlaždice, ?tema= předvybere), nepovinná zpráva, Odeslat. Bez SMS (Denisa chtěla jedno tlačítko). `/api/kontakt`: honeypot + min. 2,5 s + 5/h z IP; na náhledu jde na PREVIEW_MAIL_TO (vojta@gomatela.cz). MAIL_DRY=1 = jen log (testy).
- Pojištění: kategorie `active: false` v data.mjs (návrat = smazat), /pojisteni-auta a /navrhy-loga → 301 na /.
- Recenze `src/recenze.mjs` (doslova, jen bez uvozovek, oprava „nenabidla“), na úvodu všech 26 s filtrem, na podstránkách jen jejich kategorie (úvěr 10, konsolidace 11, hypotéka 5).
- Podstránky (všechny tři, nejvíc dotažený Úvěr): citace z recenze v úvodu, tyrkysový pruh s čísly, srovnání bank s pruhy „kolik navíc“ (mobil 5 bank + tlačítko), recenze, formulář, otočné karty „na co“ (zadní strana = příklad splátky + předvyplní kalkulačku), Sami v bance × S FérSazby, kroky jako money2u průběh, FAQ, pruh „Napsat přes Kontakt“. Texty sekcí v `src/obsah.mjs`.
- Lighthouse Úvěr (lokál, mobil): výkon 96, přístupnost 100, best practices 100.
Vojta 23. 11.: recenze Petra V. a Jan P. (zmiňují pojištění auta) zatím nechat, ZEPTAT SE DENISY, až jí půjde nástřel. Telefon všude, kde dává smysl (hlavička, mobilní menu, Kontakt, pruh na konci stránek, patička). Kontakt bez SMS ok. Oprava překlepu nenabídla ok.
