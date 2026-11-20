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
