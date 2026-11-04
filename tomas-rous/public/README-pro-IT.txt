WEB tomasrous.cz – HOTOVÁ STATICKÁ STRÁNKA K NASAZENÍ (verze 5.5, 26. 10. 2026)
=============================================================================
Nahrát CELÝ obsah této složky do kořene webu (u Český hosting složka „tomasrous.cz“), včetně skrytého souboru .htaccess:
  index.html, styles.css, main.js – celý web (jedna stránka, responzivní, bez knihoven)
  fonts/                       – písma Playfair Display a Plus Jakarta Sans (vlastní hosting – bez Google, bez cookies)
  img/                         – fotky (JPEG + WebP, více velikostí) a logo MONEY2U | SAB servis
  kontakt.php                  – odeslání formuláře e-mailem (PHP mail, honeypot, limit 5/h z IP)
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

E-mail (DNS u Český hosting, aby zprávy z formuláře nekončily ve spamu):
  SPF  – TXT záznam domény podle nápovědy Český hosting (jejich include), ~all
  DKIM – zapnout v Klientské sekci, pokud ho hosting pro doménu nabízí
  DMARC – TXT _dmarc.tomasrous.cz: v=DMARC1; p=quarantine; rua=mailto:info@tomasrous.cz
  Po nasazení poslat testovací zprávu formulářem na Gmail i Seznam a zkontrolovat, že SPF/DKIM = pass.

Nasazení (Český hosting): objednat Webhosting k doméně → založit schránky (info@, tomas@, gabca@, terka@) →
nahrát přes WebFTP → zapnout Let's Encrypt → odeslat testovací zprávu formulářem (musí dorazit na info@) →
projít kontrolní seznam v zadání. Pokud hosting přesměrovává http→https sám, řádky RewriteCond/RewriteRule v .htaccess odstranit.
Nic nepřidávat (analytika, cookie lišta, chat) bez domluvy se zadavatelem.
