<?php
// Volitelné. Sazba se stahuje z veřejného JSON ČNB i bez klíče. Klíč je záloha pro případ, že ČNB veřejný JSON změní:
// registrace v ČNB ARAD (https://www.cnb.cz/arad/) → uživatelské menu → Správa API klíčů → Generovat klíč.
// Pak soubor přejmenovat na config.php a klíč doplnit. Kód ukazatele měnit jen po domluvě.
define('ARAD_API_KEY', '');
define('ARAD_INDICATOR', 'SMIRNOOBUVMIRS406CZK011111');   // Úvěry na bydlení – hypoteční úvěry (průměrná sazba nových hypoték)
