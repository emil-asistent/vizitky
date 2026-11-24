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

## 23. 11. 2026 večer: kritický průchod na počítači a plán (Vojta: „slabé, trochu AI, chci awwwards“)
Prošlo se všech 7 stránek na 1440 px (44 obrazovek). Hlavní slabiny:
- Všechny podstránky mají stejnou šablonu hera (tmavá fotka s přechodem, nadpis vlevo, bílá karta s kalkulačkou vpravo) a pod tím řadu sekcí se stejným rytmem: čárka, malý nadpis, velký nadpis, mřížka karet. Tohle dělá ten „AI“ dojem.
- Úvod: logo dvakrát nad sebou (hlavička a hero), malý nadpis, kalkulačka jako bílá lišta ze SaaS.
- Karty kategorií na úvodu mají nesourodé výšky a čísla (od 4,00 % vedle obřího od 3,99 %).
- Pruh s čísly (4,00 % / 9 / 15+ / 850+) se opakuje s O mně, čísla bez kontextu.
- „Na co to bude“: 4 stejné karty s ikonou a velkým číslem 01–04, prázdné místo uprostřed karty.
- Kroky: 5 stejných bílých krabic.
- Recenze: karty dobré, sekce bez vizuálního kotvení.
- Formulář poptávky dlouhý sloupec bez rytmu, vlevo prázdno.
Plán po sekcích: 1) hero úvodu: zkoušel jsem světlou i modrou verzi s kalkulačkou ve větě a fotkou s maskou, Vojta obě odmítl (rozmazané přechody, hrana fotky, „slabé“). Vráceno na PŮVODNÍ hero, to se mu líbí nejvíc. Hero úvodu dál neměnit bez jeho pokynu, 2) hero podstránek ve stejném jazyce, 3) srovnání bank, 4) kategorie na úvodu, 5) recenze, 6) kroky + O mně, 7) formulář poptávky, 8) FAQ a patička.
Patička: dole „© rok FérSazby.cz“ a „Web od Gomatela“ (drobně jako BASES).
Domény fersazby.cz a fersazba.cz Vojta koupil 23. 11. na Blueboardu (mail na info@gomatela.cz).

## 23. 11. 2026 pozdě večer: hero úvodu v2 (Vojta: „pracovat na původní verzi, kalkulačka se mi líbí, ale je tam spousta mezer“)
Původní verze je uložená: git značka `hero-puvodni-2026-11-23` a zmrazená kopie na náhledu `/puvodni` (soubory `public/puvodni.html` + `public/puvodni-soubory/`). Návrat: `git checkout hero-puvodni-2026-11-23 -- src/build.mjs public/app.js public/styles.css` a build.
Co bylo na původní slabé (měřeno na 1440×780, 1366×650, 1280×720, 1920×1080): logo dvakrát nad sebou, nadpis menší než logo, text přes obličej maminky a dcery, tlačítko kalkulačky na běžném notebooku pod okrajem obrazovky, tři čísla (3,99 % / 4,00 % / 10) dublovala kalkulačku, výsledek splátky v malé šedé krabičce, při přepnutí záložky karta skákala výškou.
Nová stavba (`heroV2` v build.mjs, styly `.hv-*` na konci styles.css):
- Jedno velké logo přímo v hlavičce (po odscrollování se zmenší do lišty), na mobilu zůstává značka přes fotku jako dřív.
- Výška, kde začíná kalkulačka (`--Y`), se počítá z výšky okna, takže celá kalkulačka i s tlačítkem je vidět na první obrazovce. Od `--Y` se odvozuje velikost fotky i nadpisu a šířka textu (`--tw`), aby text nikdy nelezl do obličejů.
- Fotka rodiny v plném rozlišení (1672 px), vlevo plynule přechází do modré jako v původní verzi, obličeje čisté. Žádné masky, žádné rozmazání.
- Úvodní věta je podepsaná Denisou (portrét v kolečku).
- Kalkulačka jako kartotéka: tři záložky se sazbou („od 4,00 %“), aktivní srůstá s kartou. Pole mají stejnou stavbu (částka i splatnost s − a +, posuvník, krajní hodnoty). Splatnost výchozí 240 měsíců, jde přepsat ručně (Denisa).
- Tmavý výsledek: velká splátka s přetáčením číslic, sazba, „o X Kč měsíčně méně než u nejdražší banky“ (u konsolidace „Ušetříte až“), tlačítko s Denisiným textem.
- Karta má ve všech třech záložkách stejnou výšku.
Ověřeno: Chrome 1280–2560 px, tablet 1024, mobil 390 a 360, jádro Safari (WebKit), všechny stránky bez chyb, odeslání kalkulačky přenese čísla na podstránku.
Zdroj fotky má jen 1672 px (AI, GPT), na retině je lehce měkká; zvětšení přes SeedVR2 by bylo placené (haléře), neděláno.

## 24. 11. 2026: fotka přes celou první obrazovku (Vojta: „hero v2 se mi líbí mnohem víc, jen fotku roztáhnout, ať je nahoře full page“)
- Vojta 24. 11. schválil hero v2 jako směr („na to bych klidně přešel“), výslovně chválil kalkulačku nahoře a Denisin citát s portrétem. Jediná připomínka: fotka má na počítači vyplnit celou první obrazovku.
- Hotovo jen na úvodu, počítače od 1200 px. Hero je vysoké jako okno, fotka ho vyplní odshora dolů, kalkulačka leží dole přímo na fotce. Tablet (861–1199 px) a mobil beze změny.
- Fotka má nahoře dopočítaných 180 px stěny a stropu (`public/assets/hero-rodina-vys-1672.webp`, 1672×1121; rodina a zbytek jsou původní pixely). Díky tomu může být rodina stejně velká jako dřív a nadpis zůstal velký. Generátor obrázků (`obrazek`) v tu chvíli neodpovídal, pás je spočítaný z horních řádků fotky.
- Výpočet rozložení je v `styles.css`, blok „ÚVOD — fotka přes celou první obrazovku“. Kalkulačka má tři výšky podle okna (294 / 262 / 238 px), z výšky kalkulačky se počítá nejmenší výška fotky, při které zůstane brada holčičky nad záložkami. Na vysokých monitorech kalkulačka vyjede výš za obličeji.
- Zkontrolováno skriptem na 28 velikostech od 1200×700 po 3440×1340 (obličeje nad kalkulačkou, text mimo obrys rodiny, tlačítko vidět) a v jádru Safari. Pod 650 px výšky okna je tlačítko kalkulačky pod okrajem, stejně jako dřív.
- Návrat k předchozí podobě: git tag `hero-v2-2026-11-24`.

## 24. 11. 2026 večer: první náhled odeslán Denise
- Vojta poslal Denise mail s odkazem na náhled. Je to první verze, chceme upřímný dojem jen k počítačové verzi (mobil zatím neřešený). Ptá se i na recenze Petry V. a Jana P. (pojištění auta). Zpětnou vazbu může poslat i hlasovkou.
- Hlasovku Vojta přepošle na emil.asistent@gomatela.cz. Přepis jen lokálně (Whisper na Studiu), nikdy do cloudu.
- Téhož dne ještě nasazeno: kompaktní patička s tenkým podpisem Gomatela, průhledná hlavička s velkým logem na podstránkách, jemné rolování kolečkem myši (Lenis).
