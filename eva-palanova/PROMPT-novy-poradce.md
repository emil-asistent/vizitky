# 🚀 PROMPT — nový web pro money2u poradce

> **Jak používat — vše v 1 složce, kterou ty vytvoříš:**  
> 1. Vytvoř novou složku, např. `~/Desktop/Petr Novák/` (Finder nebo terminál)  
> 2. Dej do ní tento `PROMPT-novy-poradce.md` (a vyplň URL starého webu níž)  
> 3. Otevři Claude Code v té složce (`cd ~/Desktop/Petr\ Novák && claude`) a pošli tento dokument  
> 4. Claude jako první spustí `~/Desktop/novy-poradce.sh` aby si do té samé složky doplnil šablonu  
> 5. Cca 15–30 minut → hotový web nasazený na Vercel  
> 6. Na konci smažeš jen `PROMPT-novy-poradce.md` — všechen web zůstává v jedné složce

---

## 1) JEDINÝ VSTUP

```
Starý web (URL):    https://www.evapalanova.cz/
```

> Vše ostatní (jméno, titul, telefon, e-mail, adresa, IČ, roky praxe, koníčky, slogan, služby, fotky) Claude vytáhne ze starého webu sám.

---

## 1A) REFERENČNÍ WEBY — vzhled a struktura

```
Dagmařin web (HLAVNÍ VZOR — finální podoba):
    https://dagmar-dobrovolna.vercel.app

Tomáš Vašíček (původní šablona od money2u):
    https://tomas-vasicek-v4.surge.sh/
```

**Lokální složka šablony:**

```
~/Desktop/Dagmar Dobrovolná web/
  ├── index.html      ← struktura sekcí, HTML kostra
  ├── styles.css      ← všechny styly (desktop + mobile odladěné)
  ├── script.js       ← interakce (nav scroll, flip karty, counter, gallery, swipe, mobile CTA)
  └── assets/
      ├── dagmar-portret.jpg, dagmar-uvod.jpg    ← Dagmařiny fotky (NAHRADIT)
      ├── gallery-1.jpg … gallery-5.webp        ← banner slidery (SDÍLENÉ — PONECHAT)
      └── logo-dark.png, logo-white.png          ← brand (ponechat)
```

⚠️ **KLÍČOVÉ:** Mobilní verze Dagmařina webu prošla mnoha iteracemi a je odladěná do detailu. **Stačí zkopírovat Dagmařinu složku a jen vyměnit obsah** — mobilní verze pro nového poradce bude automaticky 1:1 stejně dobrá jako u Dagmary.

---

## 2) ZADÁNÍ PRO CLAUDE

```
Postav nový web pro money2u poradce/poradkyni přesně podle Dagmařiny šablony.
Veškerý obsah vytáhni ze starého webu, jehož URL je v sekci 1) výš.

### Krok 0: Příprava aktuální složky (UDĚLEJ JAKO PRVNÍ!)

Pracuješ v jedné složce, kterou si uživatel vytvořil (např. ~/Desktop/Petr Novák/).
Do téhle složky budeš dělat všechno — HTML/CSS/JS, fotky, Vercel deploy.

⚠️ DAGMAŘINA SLOŽKA (~/Desktop/Dagmar Dobrovolná web/) je ČTECÍ-JEN šablona.
NIKDY do ní nezapisuj, NIKDY z ní nemaž soubory, NIKDY ji neuprav.
Pouze se z ní zkopíruje obsah přes přiložený skript.

První akce: spusť `~/Desktop/novy-poradce.sh` z aktuální složky.
Skript:
- Zkopíruje obsah Dagmařiny složky DO aktuální složky (ne do podsložky!)
- Smaže .vercel/ (aby nedeploylo do Dagmařina projektu)
- Smaže dagmar-*.jpg z assets/
- Zachová tvůj PROMPT-novy-poradce.md, který je už v složce

Po skriptu by aktuální složka měla obsahovat:
  index.html, styles.css, script.js, assets/ (s gallery a logy, bez dagmar-*.jpg),
  PROMPT-novy-poradce.md

Pokud skript hlásí "Template už ve složce existuje", znamená to že kopie už 
proběhla — pokračuj rovnou krokem 1.

### Krok 1: Sběr dat ze starého webu (Playwright MCP)
Otevři URL ze vstupu a projdi všechny stránky (úvod, o-mně, sluzby, kontakt).
Vytáhni KOMPLETNĚ:

   Identita:
   - Plné jméno + tituly (Mgr., DiS., Bc., PFP…)
   - Slogan / hero text
   - Plný text "O mně" (zachovat všechny odstavce — NEZKRACOVAT!)
   - Pohlaví (z titulu nebo bio textu — pro "poradce" vs "poradkyně")

   Kontakt:
   - Telefon (přesně jak je na webu, vč. mezer)
   - E-mail
   - Fakturační adresa (ulice, PSČ, město)
   - Kancelář / město kde sídlí
   - IČ
   - Plátce DPH? (běžně "Nejsem plátce DPH")

   Profesní fakta:
   - Roky v oboru (číslo z věty typu "více než 12 let")
   - Spokojení klienti (pokud uvedeno, jinak odhad 200–300)
   - Řeší reality? (pokud výpis služeb obsahuje "realitní", "nemovitosti", 
     "Reality2u" → ano)

   Osobní:
   - Koníčky / mimo práci (3–5 klíčových slov z bio textu)

   Fotky:
   - dagmar-uvod.jpg ekvivalent: ležatá / široká fotka kde je vidět celé tělo 
     nebo většina těla (od pasu nahoru, neutrální pozadí). Tato fotka se 
     používá v hero NA OBOU PLATFORMÁCH (desktop i mobile).
   - Pokud má jen 1 fotku → použij ji pro vše. Ulož jako 
     {jmeno-bez-hacku}-uvod.jpg
   - WordPress weby (typicky elementor) mají fotky ve /wp-content/uploads/ 
     → stáhni v plné velikosti

### Krok 2: Příprava nové složky
⚠️ DŮLEŽITÉ: Pracovní složka už je připravena uživatelem skrz `novy-poradce.sh` 
skript. NEKOPÍRUJ nic z ~/Desktop/Dagmar Dobrovolná web/ — k té složce nemáš 
přístup a nemáš s ní pracovat. Vše už máš v aktuální složce.

V aktuální složce (cd jsi v ní):
1. Ověř že existují: index.html, styles.css, script.js, assets/
2. Ověř že assets/ obsahuje: gallery-1..5.{jpg,webp}, logo-dark.png, 
   logo-white.png (ŽÁDNÉ dagmar-*.jpg už by tam nemělo být — skript je smazal)
3. Ulož staženou fotku poradce jako assets/{jmeno}-uvod.jpg
   (jméno bez diakritiky, lowercase, pomlčky — např. petr-novak-uvod.jpg)
4. Slidery gallery-1.* až gallery-5.* PONECH (sdílené pro všechny money2u)
5. Loga logo-dark.png a logo-white.png ponech (pro případ)

### Krok 3: Replace v index.html
   Texty (case-sensitive):
   - "Dagmar Dobrovolná" → "{Jméno Příjmení}" (všude)
   - "Mgr." → správné tituly poradce
   - "dagmar-portret.jpg" → "{jmeno}-uvod.jpg" (POZOR: nahrazujeme oba 
      odkazy stejnou fotkou — desktop i mobile sdílí jednu fotku)
   - "dagmar-uvod.jpg" → "{jmeno}-uvod.jpg"
   - "dasa.dobrovolna@gmail.com" → "{e-mail}"
   - "+420 602 762 681" → "{telefon}"
   - "+420602762681" → "{telefon bez mezer}"
   - "Chleborádova 53/10" → "{ulice}"
   - "619 00 Brno – Dolní Heršpice" → "{PSČ město}"
   - "Brno – Dolní Heršpice" → "{město}" (v kontaktu pod "Kancelář")
   - "67580998" → "{IČ}"
   - "Mgr. — Finanční poradkyně · money2u" → upravit dle pohlaví:
     • žena: "{tituly} — Finanční poradkyně · money2u"
     • muž:  "{tituly} — Finanční poradce · money2u"

   Hero:
   - h1 (slogan): nahradit sloganem ze starého webu (pokud nemá, ponech 
     "Rozhodnutí, kterým můžete věřit.")
   - .hero-meta: zachovat strukturu s rolí

   About:
   - h2: zachovat "Spolehlivý partner pro vaše finance" (univerzální)
   - .about-text 3 odstavce: nahradit textem ze starého webu — zachovat 
     VŠECHNY informace, jen rozdělit do 3 odstavců:
       1) Roky praxe + co dělám (investice, hypotéky, pojištění, plánování)
       2) Lokalita kanceláře + online/osobně + reality (pokud řeší)
       3) Money2U tým + neobvyklá řešení
   - .about-quote p: nech původní citát "Mojí prioritou je…" POKUD nový 
     web nemá vlastní silnou větu. Pokud má, použij ji.
   - .about-quote footer: "— {Tituly} {Jméno}"
   - .pillars:
     - 1. pillar-num: roky praxe + "+"
     - 2. pillar-num: "{Město} <span>+ ČR</span>"
     - 3. pillar-num: "Money<span>2U</span>" (s <span>2U</span> okolo "2U")
     - Texty pillars přizpůsobit
   - .about-personal p: text o koníčcích — buď ze starého webu, nebo 
     zachovat strukturu "Když zrovna nepracuji, odpočívám u…"
   - .ap-tags span × 4: 4 koníčky vytažené z textu
   - .about-links:
     • money2u.cz vždy ponech
     • reality2u.cz: pokud poradce nedělá reality, ODEBRAT odkaz

   Stats:
   - "12" → roky praxe
   - "250" → klienti (odhad pokud nezná)
   - "100" → nech, "100% Nezávislé poradenství"

   Services 4 karty:
   - 1, 2, 3 (Kompletní péče, My Plann, Služby spojené) — zachovat
   - 4 (Realitní služby) — ODEBRAT pokud poradce nedělá reality

   Process 4 kroky: ZACHOVAT bez úprav (univerzální flow)

   Contact:
   - h2 "Pojďme si popovídat": zachovat
   - Vyměnit telefon, e-mail, kancelář, fakturační údaje

   Footer:
   - .footer-name → "{Jméno Příjmení}"
   - Pod tím: "{Tituly} — Finanční poradce/poradkyně · money2u"
   - © rok + jméno + IČ + DPH

   <head> meta:
   - <title>: "{Jméno Příjmení} — Finanční poradce/poradkyně money2u"
   - <meta name="description">
   - <link rel="canonical">: "https://{nazev-projektu}.vercel.app/"
   - Open Graph (og:title, og:description, og:url, og:image)
   - Twitter Card
   - JSON-LD structured data: jméno, telefon, e-mail, adresa
   - Favicon SVG: změnit písmeno "D" na první písmeno křestního jména 
     poradce v inline SVG

### Krok 4: Pokud poradce NEdělá reality
1. V index.html smaž 4. service kartu (Realitní služby) + odpovídající 
   dot v .svc-dots div
2. V About text odeber větu o Reality2u
3. V .about-links smaž odkaz reality2u.cz
4. V 3. pillar text "Money2U + Reality2u" → jen "Money2U"
   (Desktop layout se nemusí ladit — .svc-grid grid-template-columns 
   repeat(2, 1fr) zvládá 3 karty: 2 v první řadě + 1 v druhé.)

### Krok 5: Test
1. Spusť `python3 -m http.server 8765` v nové složce
2. Otevři Playwright na localhost:8765
3. Test DESKTOP (1440×900):
   - Projdi celý web shora dolů
   - Hover na services karty → flip funguje
   - Stats counter animace
   - Gallery autorotace
4. Test MOBILE (375×812):
   - Hero: centrovaný, jen 1 CTA "Domluvit konzultaci", žádný eyebrow
   - Stats: 3 čísla vedle sebe
   - Why: NAVY tmavé karty s mátovými čísly
   - Services: horizontální SWIPE karty s dots indikátorem, ikona vedle 
     nadpisu (ne nad), kompaktní
   - About: foto bez offset rámečku
   - Process: 2x2 grid s mátovými outline kruhy, BEZ karet
   - Contact: centrovaný h2, Odeslat zprávu button centrovaný
   - Gallery: banner bez letterbox pruhů (matchuje aspect-ratio)
   - Sticky CTA "Konzultace zdarma" se objeví po opuštění hera
5. Zoom na všechny h2 nadpisy (mcp__playwright__browser_take_screenshot 
   s target="#about h2", "#process h2" atd.) — ověř, že se descendery 
   (y, g, p, ř) NEKRYJÍ s dalším řádkem

### Krok 6: Deploy na Vercel
1. Zkopíruj obsah do /tmp/{nazev-projektu}/ (kvůli českým znakům v cestě)
   Příklad názvu: petr-novak, jana-novakova (lowercase, pomlčky)
2. cd /tmp/{nazev} && vercel deploy --prod -y --no-wait --scope emilasistent-7377s-projects
3. Po deploy zkopíruj vzniklé .vercel/ zpět do ~/Desktop/{Jméno Příjmení}/
4. Pošli uživateli URL formátu https://{nazev-projektu}.vercel.app

═══════════════════════════════════════════════════════════════════════
### PRAVIDLA — DODRŽUJ STRIKTNĚ
═══════════════════════════════════════════════════════════════════════

⚠️ NIKDY nezkracovat text — když je dlouhý, jen ho lépe strukturovat
⚠️ NIKDY si nic nevymýšlet (reference, certifikáty, ocenění, 
   testimonials) — pokud to není na starém webu, NEPŘIDÁVAT
⚠️ Slidery v gallery NEMĚNIT (sdílené pro všechny money2u)
⚠️ Barvy NEMĚNIT — #99C6C3 / #0D1F3A / #F7F5F0 jsou firemní
⚠️ Fonty NEMĚNIT — Plus Jakarta Sans (h1, h2, text) + Poppins 900 
   (stats, footer-name)
⚠️ Strukturu sekcí NEMĚNIT — pořadí, layout, animace
⚠️ Mobilní CSS NEMĚNIT — je odladěné. Nepřidávej "vylepšení" do 
   @media (max-width: 760px) ani @media (max-width: 520px)
⚠️ Pohlaví — pohlídej rod (poradkyně vs poradce, Mgr. Jana vs Mgr. Pavel)

═══════════════════════════════════════════════════════════════════════
### FINÁLNÍ STAV MOBILE — co MUSÍ být zachováno (otestováno u Dagmary)
═══════════════════════════════════════════════════════════════════════

HERO:
- ✅ Centrovaný layout (text a CTA uprostřed)
- ✅ Pouze 1 tlačítko "Domluvit konzultaci" (mátové)
- ✅ Tlačítko "O mně" SKRYTÉ na mobile (display: none)
- ✅ Eyebrow "MGR. ... DOBROVOLNÁ" SKRYTÝ na mobile (display: none) 
   — jméno je v navu
- ✅ Žádný scroll-arrow (display: none na mobile)
- ✅ Stejná fotka pro mobile jako desktop (object-position: 50% 30%)

STATS:
- ✅ 3 čísla VEDLE SEBE (grid 3 sloupce, ne pod sebou)
- ✅ Centrované text-align

WHY karty:
- ✅ NAVY tmavé karty (background: var(--navy))
- ✅ Bílý nadpis, semi-transparent bílý popisek
- ✅ Velká mátová čísla 01-03 (žádné ikony)
- ✅ Centrovaný section header

SERVICES (KLÍČOVÉ — proběhlo hodně iterací):
- ✅ Horizontální SWIPE karusel (flex + overflow-x: auto + scroll-snap-type: x mandatory)
- ✅ touch-action: pan-x na .svc-grid (vertikální scroll page funguje normálně)
- ✅ Karta width: calc(100% - 56px) — vidět peek další karty
- ✅ Ikona VEDLE nadpisu (display: flex; flex-direction: row) — ne nad ním
- ✅ Ikona 40px, nadpis 16px
- ✅ Kompaktní seznam (font 13px, gap 5px)
- ✅ CTA jako text link "Nezávazná konzultace →" (transparent bg) — 
   NE plná mátová pilulka
- ✅ Dots indikátor pod kartami (4 dots, klikatelné, JS tracking)
- ✅ #services .container { padding: 0 } na mobile — full-bleed scroll
- ✅ Žádný gradient header karty, žádná border-bottom čára

ABOUT:
- ✅ Foto BEZ offset mátového rámečku (.about-photo::before { display: none })
- ✅ Centrovaný header (eyebrow + h2)
- ✅ Bio text levé zarovnání
- ✅ Pillars stack pod sebou
- ✅ Mimo práci box stack
- ✅ CTA centrované

PROCESS:
- ✅ 2x2 GRID (ne 4 pod sebou)
- ✅ Mátové OUTLINE kruhy (border 2px solid teal-dark, transparent bg)
- ✅ Mátová čísla uvnitř
- ✅ Žádné karty kolem — jen kruh + nadpis + text centrované
- ✅ Žádná horizontální linka (skrytá: ::before a ::after display: none)

CONTACT:
- ✅ Centrovaný header
- ✅ Submit button centrovaný text (justify-content: center, align-self: stretch)
- ✅ Mátové pozadí

GALLERY:
- ✅ aspect-ratio 1920/632 (matchuje banner přesně, žádné letterbox 
   pruhy)
- ✅ object-fit: cover
- ✅ Žádné navy stripy nad ani pod fotkou

FOOTER:
- ✅ Centrované
- ✅ "{Jméno Příjmení}" v Poppins 900, 28px
- ✅ Velký, čistý text (žádné rozmazané logo PNG)

NAV:
- ✅ "{Jméno Příjmení}" jako text (Plus Jakarta Sans 800, 18px)
- ✅ Hamburger menu na mobile

SECTIONS rytmus:
- ✅ Padding 56px 0 (ne 80px jako na desktop)
- ✅ Hero, About, Why centrované headers (Tomáš styl)

STICKY MOBILE CTA:
- ✅ Floating button "Konzultace zdarma" dole
- ✅ Visible po opuštění hera, skryté nad #contact

═══════════════════════════════════════════════════════════════════════
### Co poslat uživateli na konci
═══════════════════════════════════════════════════════════════════════
1. Live URL z Vercelu
2. Krátký souhrn (max 5 řádek) co bylo specifické:
   - Reality ano/ne?
   - Kolik fotek bylo dostupných?
   - Roky v oboru + klienti
3. Cokoliv co user musí doplnit (např. "Fotka ze starého webu je 
   nízká kvalita — pošli mi prosím lepší")
```

---

## 3) PŘÍKLAD POUŽITÍ

```
Starý web (URL):    https://www.petrnovak-poradce.cz
```

Pošleš celý tenhle dokument do Claude Code, on si ho přečte, otevře URL, 
vytáhne vše, postaví web, deploy a pošle ti link.

---

## 4) POZNÁMKY

**Vyhrané iterace, které musí zůstat:**
- Mobile services: horizontal swipe + dots + touch-action pan-x
- Mobile hero: centered + jen 1 CTA + bez eyebrow
- Mobile why: navy karty
- Mobile process: 2x2 grid bez karet
- Mobile padding sekcí: 56px (kompaktní)
- Hero photo aspect: 50% 30% object-position

**Když to vázne:**
- Pokud Claude nevidí konkrétní info, jednoduše ti řekne 
  "Chybí mi toto, dej mi prosím:..."
- Doplníš v konverzaci 1 zprávou

**Po nasazení:**
- Pošli URL poradci k revizi
- Pokud chce drobné úpravy, sděl Clauďovi konkrétní change requesty
- Vyžádej si od poradce lepší fotku pokud je ze starého webu malá

**Tvůj Vercel účet:** `emilasistent-7377` (team: `emilasistent-7377s-projects`)
