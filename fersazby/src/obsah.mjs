// Obsah sekcí podstránek. Texty vycházejí z nejsazby.cz, z FAQ webu a z recenzí od Denisy (nic nového netvrdí).

// Sami v bance × s FérSazby (výchozí pro všechny kategorie, %RATE% = sazba kategorie).
export const CONTENT = {
  versus: [
    ['Srovnání', 'Jedna banka, jedna nabídka', 'Nabídky bank vedle sebe'],
    ['Sazba', 'Ceníková, bez vyjednávání', 'Vyjednaná, od %RATE%'],
    ['Papírování', 'Všechno na vás', 'Podklady i žádost připravím já'],
    ['Když banka řekne ne', 'Začínáte znovu jinde', 'Vím, kam žádost nasměrovat'],
    ['Po podpisu', 'Každý si jde po svém', 'Hlídám, jestli nepřijde lepší nabídka'],
  ],

  uver: {
    reviewsH: 'Co říkají ti, kdo si <span class="u">už půjčili</span>',
    // Úryvek z recenze Marka D. (doslova).
    heroQuote: { name: 'Marek D.', text: 'Přes web jsem poslal poptávku a do hodiny jsme řešili konkrétní nabídky.' },
    uses: {
      kicker: 'Na co to bude?',
      h: 'Půjčte si na to,<br>co zrovna řešíte',
      p: 'Úvěr na cokoliv znamená opravdu cokoliv. Když mi ale řeknete, na co peníze jsou, můžu sáhnout po účelovém úvěru. Ten bývá levnější.',
      items: [
        { name: 'Auto', icon: 'car', castka: 350000, mesice: 84,
          front: 'Nové i ojeté, z autosalonu i od souseda.',
          back: 'Nabídku financování z autosalonu si vezměte s sebou, porovnám ji s bankami.' },
        { name: 'Rekonstrukce', icon: 'tools', castka: 600000, mesice: 144,
          front: 'Koupelna, kuchyň, okna nebo střecha.',
          back: 'Bez ručení nemovitostí. Stačí rozpočet od řemeslníka a probereme, jak ho rozložit.' },
        { name: 'Vybavení', icon: 'sofa', castka: 150000, mesice: 48,
          front: 'Nábytek, spotřebiče, elektronika.',
          back: 'Místo několika splátek z obchodů jeden úvěr s fér sazbou.' },
        { name: 'Cokoliv dalšího', icon: 'spark', castka: 100000, mesice: 60,
          front: 'Svatba, studium, dovolená nebo nečekaný výdaj.',
          back: 'Řekněte částku a já najdu, kde vás vyjde nejlevněji.' },
      ],
    },
  },

  konsolidace: {
    reviewsH: 'Jedna splátka<br>a <span class="u">klidné spaní</span>',
    // Úryvek z recenze Tomáše K. (doslova).
    heroQuote: { name: 'Tomáš K.', text: 'Všechno jsme sloučili do jedné rozumné splátky, hrozně se nám ulevilo a konečně zase v klidu spíme.' },
    uses: {
      kicker: 'Co se dá sloučit?',
      h: 'Všechno, co vás<br>měsíčně tahá z účtu',
      p: 'Spotřebitelské úvěry, kreditní karty, kontokorenty i půjčky od nebankovních společností. Výsledkem je jedna splátka u jedné banky.',
      items: [
        { name: 'Kreditní karty', icon: 'card', castka: 80000, mesice: 60,
          front: 'Zůstatky, které se pořád nechtějí zmenšit.',
          back: 'Kartu splatíme z nového úvěru a vy ji pak můžete zrušit, nebo nechat bez dluhu.' },
        { name: 'Kontokorent', icon: 'minus', castka: 50000, mesice: 48,
          front: 'Věčné minus na běžném účtu.',
          back: 'Z minusu, který nikdy nekončí, se stane splátka s jasným koncem.' },
        { name: 'Úvěry u více bank', icon: 'layers', castka: 400000, mesice: 120,
          front: 'Několik splátek v různé dny měsíce.',
          back: 'Místo hlídání několika termínů jedna splátka, jeden den, jedna banka.' },
        { name: 'Nebankovní půjčky', icon: 'wallet', castka: 150000, mesice: 72,
          front: 'Půjčky od nebankovních společností.',
          back: 'I ty se dají převést k bance s fér sazbou. Probereme, co a kdy jde.' },
      ],
    },
  },

  hypoteka: {
    reviewsH: 'Bydlení s <span class="u">fér sazbou</span>',
    // Úryvek z recenze Lucie M. (doslova).
    heroQuote: { name: 'Lucie M.', text: 'Tady mi pomohli vyjednat lepší sazbu přímo u mojí stávající banky.' },
    uses: {
      kicker: 'Na co hypotéku?',
      h: 'Hypotéka na to,<br>co právě řešíte',
      p: 'Koupě, stavba, rekonstrukce nebo konec fixace. Řekněte mi, o co jde, a já vím, na které banky se zaměřit.',
      items: [
        { name: 'Koupě', icon: 'home', castka: 4000000, roky: 30,
          front: 'Byt nebo dům, nový i starší.',
          back: 'Banky obvykle půjčí do 80 % hodnoty nemovitosti, mladším 36 let do 90 %.' },
        { name: 'Stavba', icon: 'tools', castka: 6000000, roky: 30,
          front: 'Vlastní dům na vlastním pozemku.',
          back: 'Peníze banka uvolňuje postupně, jak stavba roste. Rozpočet projdeme spolu dopředu.' },
        { name: 'Rekonstrukce', icon: 'spark', castka: 1500000, roky: 20,
          front: 'Nová střecha, okna, topení nebo celý byt.',
          back: 'U větší rekonstrukce dává smysl i hypotéka. Porovnám ji se spotřebitelským úvěrem.' },
        { name: 'Konec fixace', icon: 'percent', castka: 3000000, roky: 25,
          front: 'Banka vám poslala novou sazbu?',
          back: 'Nemusíte ji brát. Vyjednám lepší u vaší banky, nebo vás převedu jinam.' },
      ],
    },
  },
};
