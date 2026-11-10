WEB tomasrous.cz – HOTOVÁ STATICKÁ STRÁNKA K NASAZENÍ (verze 5.6, 10. 11. 2026)
=============================================================================
Nahrát CELÝ obsah této složky do kořene webu (u Český hosting složka „tomasrous.cz“), včetně skrytého souboru .htaccess:
  index.html, styles.css, main.js – celý web (jedna stránka, responzivní, bez knihoven)
  fonts/                       – písma Playfair Display a Plus Jakarta Sans (vlastní hosting – bez Google, bez cookies)
  img/                         – fotky (JPEG + WebP, více velikostí) a logo MONEY2U | SAB servis
  kontakt.php                  – odeslání formuláře e-mailem (PHP mail, obálkový odesílatel -f info@tomasrous.cz, skryté pole
                                 a časová ochrana proti robotům, limit 5/h z IP)
  ochrana-osobnich-udaju.html  – ochrana osobních údajů (odkaz z patičky)
  404.html, .htaccess          – chybová stránka; přesměrování http a www → https://tomasrous.cz, cache, hlavičky
  favicon.svg, favicon-32.png, apple-touch-icon.png, og-image.jpg, sitemap.xml, robots.txt
  sazba.php, config.example.php – automatická sazba z ČNB pro kalkulačku (viz níže); data/sazby.json = záloha

Kalkulačka hypotéky – odkud bere sazbu:
  a) Automaticky z ČNB (bez nastavení): sazba.php si jednou denně stáhne průměrnou sazbu nových hypoték
     z veřejného JSON databáze ČNB ARAD (ukazatel SMIRNOOBUVMIRS406CZK011111 „Úvěry na bydlení – hypoteční úvěry“;
     ČNB ji vydává měsíčně, zhruba s měsíčním zpožděním). Server musí mít povolené odchozí HTTPS (allow_url_fopen).
  b) Záloha s API klíčem: kdyby ČNB veřejný JSON změnila, přejmenovat config.example.php na config.php a doplnit
     klíč z ČNB ARAD (registrace zdarma na www.cnb.cz/arad → Správa API klíčů). Kód ukazatele je už vyplněný.
  c) Když se nic nestáhne: číslo v data/sazby.json ("hypoteka": 5.0 = 5 % p. a.) – přepsat a nahrát přes WebFTP.
  Kontrola: otevřít https://tomasrous.cz/sazba.php – musí vrátit {"hypoteka": …, "zdroj": "ČNB ARAD", "obdobi": …}
  (při výpadku "zdroj": "soubor"). Výnosy investiční kalkulačky (7 / 5 / 3 % podle délky) jsou v main.js.

E-mail (DNS, aby zprávy z formuláře nekončily ve spamu):
  kontakt.php odesílá z info@tomasrous.cz na info@tomasrous.cz, obálkový odesílatel (Return-Path) je také info@tomasrous.cz.
  SPF  – TXT záznam domény musí zahrnovat i server, ze kterého web poštu odesílá (u Český hosting jejich include), ~all
  DKIM – zapnout v Klientské sekci, pokud ho hosting pro doménu nabízí
  DMARC – TXT _dmarc.tomasrous.cz: v=DMARC1; p=quarantine; rua=mailto:info@tomasrous.cz
  Po nasazení poslat testovací zprávu formulářem na Gmail i Seznam a zkontrolovat, že SPF/DKIM = pass.

Nasazení (Český hosting): objednat Webhosting k doméně → založit schránky (info@, tomas@, gabca@, terka@) →
nahrát přes WebFTP → zapnout Let's Encrypt → odeslat testovací zprávu formulářem (musí dorazit na info@) →
projít kontrolní seznam v zadání. Pokud hosting přesměrovává http→https sám, řádky RewriteCond/RewriteRule v .htaccess odstranit.
Nic nepřidávat (analytika, cookie lišta, chat) bez domluvy se zadavatelem.

VERZE 5.6 – CO SE ZMĚNILO OPROTI 5.5 (nasazení: nahrát celý obsah složky přes původní soubory, včetně .htaccess)
  kontakt.php  – zpráva se už nezkracuje za znakem „<“ (odstraněno strip_tags); tělo e-mailu v kódování quoted-printable
                 (řádky do 76 znaků – Exim odmítá zprávy s řádkem nad 998 znaků, dlouhý odstavec by nedorazil); obálkový
                 odesílatel -f info@tomasrous.cz; hlavička Reply-To vždy platná (RFC 2047); MIME-Version; v těle už není
                 IP adresa; ochrana proti robotům nezávisí na hodinách návštěvníka a nevrací falešné „odesláno“.
  sazba.php    – při výpadku ČNB vrací poslední staženou sazbu (max. 45 dní starou) a další pokus dělá až za 30 minut;
                 dřív čekal každý požadavek 6 s. Adresu zdroje lze změnit v config.php (ARAD_JSON_URL).
  index.html, main.js, styles.css – zalomení řádků (e-mail, pomlčky, název SAB servis s.r.o., IČO), přesný atribut sizes
                 u obrázků (telefony stahují menší hlavní fotku), upozornění <noscript> u formuláře, časový limit 30 s
                 při odesílání formuláře; investiční kalkulačka počítá „R % ročně“ přesně (měsíční výnos (1+R)^(1/12)−1
                 místo R/12, výsledky jsou o 1–7 % nižší); lišta Zavolat/Napsat je na telefonu vidět hned po načtení.
  ochrana-osobnich-udaju.html, 404.html, sub.css – pevné mezery za předložkami; sub.css se načítá s ?v= (roční cache).
  .htaccess    – komprese i pro text/javascript, zákaz čtení .ht*, odstranění hlavičky X-Powered-By.
  og-image.jpg – obrázek pro sdílení ve značkových písmech webu.
  Beze změny: fonts/, img/, data/sazby.json, favicon.svg, favicon-32.png, apple-touch-icon.png, robots.txt.
  Po nahrání ověřit: zkušební zpráva formulářem (i s dlouhým odstavcem bez odřádkování a se znakem „<“) dorazí na info@
  celá; v hlavičkách doručené zprávy je Return-Path info@tomasrous.cz a SPF/DKIM = pass.
