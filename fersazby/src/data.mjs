// Jediný zdroj obsahu webu: sazby, kategorie, kontakty.
// Sazby převzaté z nejsazby.cz 20. 11. 2026 („nabídky úroků zatím zachovat jak jsou“).

export const SITE = {
  name: 'FérSazby',
  domain: 'fersazby.cz',
  url: 'https://fersazby.cz',
  email: 'info@fersazby.cz',
  phone: '+420 737 202 797',
  phoneHref: 'tel:+420737202797',
  person: 'Denisa Holazová',
  personRole: 'finanční poradkyně',
  ico: '02207257',
  // TODO potvrdit s klientkou: koho zastupuje + odkaz do registru ČNB
  represented: 'money2u s.r.o.',
  representedIco: '29357365',
  // Denisa 27. 11. 2026: web za tým, ne za ni; čísla celé sítě.
  clients: '1000+',
  volume: '1 mld.+',
};

// Sazby od Denisy (WhatsApp 27. 11. 2026): jen banky, které uvedla, ostatní pryč z výpočtů.
const SPOTREBITELSKE = [
      ['mBank', 4.49], ['Raiffeisenbank', 4.90], ['Trinity Bank', 4.97], ['Zonky', 4.99],
      ['Komerční banka', 5.19], ['Česká spořitelna', 5.29], ['UniCredit Bank', 5.49], ['ČSOB', 5.90],
      ['Cofidis', 8.99],
    ];
// Hypotéka: sazby podle fixace (3, 5, 7, 10 let). Výchozí je 3letá fixace, ta má nejnižší naši sazbu.
const HYPO_FIX = {
  3: { our: 5.19, banks: [['UniCredit Bank', 5.39], ['Česká spořitelna', 5.69], ['Raiffeisenbank', 5.69], ['ČSOB', 5.74], ['mBank', 5.89], ['Komerční banka', 6.14]] },
  5: { our: 5.39, banks: [['Česká spořitelna', 5.59], ['UniCredit Bank', 5.79], ['Raiffeisenbank', 5.89], ['mBank', 5.99], ['ČSOB', 6.14], ['Komerční banka', 6.49]] },
  7: { our: 5.49, banks: [['Česká spořitelna', 5.69], ['UniCredit Bank', 5.79], ['Raiffeisenbank', 5.89], ['mBank', 5.99], ['ČSOB', 6.14], ['Komerční banka', 6.49]] },
  10: { our: 5.59, banks: [['Česká spořitelna', 5.79], ['UniCredit Bank', 5.89], ['Raiffeisenbank', 5.99], ['mBank', 6.09], ['ČSOB', 6.24], ['Komerční banka', 6.59]] },
};
export const HYPO_FIX_DEFAULT = 3;

export const RATES = {
  uver: { our: 3.97, banks: SPOTREBITELSKE },
  konsolidace: { our: 3.97, banks: SPOTREBITELSKE },
  hypoteka: { ...HYPO_FIX[HYPO_FIX_DEFAULT], fix: HYPO_FIX },
};

// Pořadí a texty CTA podle zadání klientky (mail 19. 11. 2026).
export const CATS = [
  {
    key: 'uver', slug: 'uver-na-cokoliv', short: 'Úvěr', name: 'Úvěr na cokoliv',
    cta: 'Chci nový úvěr s fér sazbou', icon: 'wallet',
    tagline: 'Spotřebitelský úvěr na míru vám',
    title: 'Úvěr na cokoliv | FérSazby',
    desc: 'Spočítejte si úvěr na auto, rekonstrukci nebo cokoliv dalšího. Srovnáme nabídky bank a vyjednáme pro vás fér sazbu od 3,97 %.',
    h1: 'Úvěr na cokoliv,<br><em>s fér sazbou</em>',
    lead: 'Hledáte výhodný spotřebitelský úvěr? Nemusíte sami srovnávat banky. Řekněte, kolik potřebujete, a my vám ukážeme, kde je sazba opravdu fér.',
    photo: 'uver', anchor: 'uver',
  },
  {
    key: 'konsolidace', slug: 'konsolidace', short: 'Konsolidace', name: 'Konsolidace',
    cta: 'Chci ušetřit na splátkách díky fér konsolidaci', icon: 'layers',
    tagline: 'Ušetřete na splátkách svých úvěrů',
    title: 'Konsolidace úvěrů | FérSazby',
    desc: 'Spojte půjčky, karty a kontokorenty do jedné nižší splátky. Spočítejte si, kolik měsíčně ušetříte.',
    h1: 'Všechny půjčky<br>v jedné <em>nižší splátce</em>',
    lead: 'Přeplácíte zbytečně na úrocích? Sloučíme vaše půjčky, kreditní karty i kontokorenty do jedné splátky s fér sazbou.',
    photo: 'konso', anchor: 'konsolidace',
  },
  {
    key: 'hypoteka', slug: 'hypoteka', short: 'Hypotéka', name: 'Hypotéka',
    cta: 'Chci fér sazbu na hypotéku', icon: 'home',
    tagline: 'Dosáhněte na své vysněné bydlení',
    title: 'Hypoteční kalkulačka | FérSazby',
    desc: 'Spočítejte si hypotéku na koupi, stavbu, rekonstrukci i refinancování. Srovnáme banky a vyjednáme sazbu od 5,19 %.',
    h1: 'Hypotéka<br><em>s fér sazbou</em>',
    lead: 'Koupě, stavba, rekonstrukce nebo refinancování. Srovnáme nabídky všech bank a vyjednáme sazbu, kterou sami na pobočce nedostanete.',
    photo: 'hypo', anchor: 'hypoteka',
  },
  {
    // Pojištění vozidla zatím NE (Denisa 22. 11. 2026: „nechala bych to zatím na nové úvěry, konsolidace, hypotéky“).
    key: 'auto', active: false, slug: 'pojisteni-auta', short: 'Pojištění auta', name: 'Pojištění vozidla',
    cta: 'Chci fér pojistné pro své auto', icon: 'car',
    tagline: 'Povinné ručení i havarijní pojištění',
    title: 'Pojištění auta | FérSazby',
    desc: 'Povinné ručení a havarijní pojištění za fér cenu. Porovnáme pojišťovny a pošleme vám nejvýhodnější nabídku.',
    h1: 'Pojištění auta <em>za fér cenu</em>',
    lead: 'Povinné ručení i havarijní pojištění. Porovnáme pojišťovny, ohlídáme limity krytí i asistenci a pošleme vám nabídku, která dává smysl.',
    photo: 'auto',
  },
];

// Kategorie, které jsou na webu vidět.
export const ACTIVE = CATS.filter((c) => c.active !== false);
