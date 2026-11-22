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
  },

  hypoteka: {
    reviewsH: 'Bydlení s <span class="u">fér sazbou</span>',
  },
};
