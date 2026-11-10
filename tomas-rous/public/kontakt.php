<?php
// Odeslání kontaktního formuláře z webu tomasrous.cz e-mailem.
// Před spuštěním ověřit doručení; odesílatel musí být schránka na hostingu (SPF).
date_default_timezone_set('Europe/Prague');
if (function_exists('mb_internal_encoding')) { mb_internal_encoding('UTF-8'); }
$prijemce   = 'info@tomasrous.cz';
$odesilatel = 'info@tomasrous.cz';
$zpet       = '/';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Location: ' . $zpet); exit; }

// Odpověď: skript na stránce (fetch) dostane JSON, klasické odeslání formuláře přesměrování zpět na formulář.
$fetch = (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'fetch');
$odpoved = function ($ok) use ($fetch, $zpet) {
    if ($fetch) { header('Content-Type: application/json; charset=UTF-8'); header('Cache-Control: no-store'); echo json_encode(['ok' => (bool)$ok]); }
    else { header('Location: ' . $zpet . ($ok ? '?odeslano=1' : '?chyba=1') . '#kontakt'); }
    exit;
};

// Ochrana proti robotům: skryté pole „web“ musí zůstat prázdné a stránka musí být před odesláním otevřená aspoň 3 s.
// Údaj „t“ = počet sekund od načtení stránky; doplňuje ho skript při odeslání, takže nezávisí na hodinách zařízení.
// Odpověď je vždy „nepodařilo se odeslat“: koho by ochrana zachytila omylem, uvidí náhradní kontakt (e-mail, telefon)
// a nikdy nedostane falešné potvrzení, že zpráva dorazila.
if (!empty($_POST['web']) || (int)(is_string($_POST['t'] ?? null) ? $_POST['t'] : 0) < 3) { $odpoved(false); }

// Zpráva odchází jako prostý text, HTML se v ní nevykonává – proto se z textu NIC neodstraňuje (žádné strip_tags:
// to by smazalo vše za znakem „<“, např. „splátka <25 tisíc“). Odstraňují se jen řídicí znaky; jednořádková pole nesmí
// obsahovat konec řádku (ochrana hlaviček e-mailu).
$text = function ($k, $max, $viceradku = false) {
    $v = $_POST[$k] ?? ''; if (!is_string($v)) { $v = ''; }
    if (function_exists('mb_check_encoding') && !mb_check_encoding($v, 'UTF-8')) { $v = mb_convert_encoding($v, 'UTF-8', 'UTF-8'); }
    $v = str_replace(["\r\n", "\r"], "\n", $v);
    $v = $viceradku ? preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $v) : preg_replace('/[\x00-\x1F\x7F]+/', ' ', $v);
    return trim(mb_substr((string)$v, 0, $max));
};
$jmeno = $text('jmeno', 120); $email = $text('email', 200); $telefon = $text('telefon', 40); $tema = $text('tema', 80);
$zprava = $text('zprava', 4000, true);

$telefon_ok = strlen(preg_replace('/[^0-9]/', '', $telefon)) >= 9;
$email_ok   = $email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) !== false;             // adresa použitelná v hlavičce Reply-To
$email_tvar = $email !== '' && preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/u', $email) === 1;      // stejné pravidlo jako kontrola v prohlížeči
if ($jmeno === '' || $zprava === '' || (!$email_tvar && !$telefon_ok)) { $odpoved(false); }

// jednoduchý limit: max. 5 odeslání za hodinu z jedné IP (soubor v /tmp)
$ip = $_SERVER['REMOTE_ADDR'] ?? '0'; $f = sys_get_temp_dir() . '/tr-form-' . md5($ip); $n = 0;
if (is_file($f) && time() - filemtime($f) < 3600) { $n = (int)file_get_contents($f); }
if ($n >= 5) { $odpoved(false); }

// RFC 2047: text hlavičky vždy zakódovaný – diakritika i znaky jako čárka, závorky a uvozovky jsou tak bezpečné
$kod = function ($s) { return '=?UTF-8?B?' . base64_encode($s) . '?='; };
$kratke = mb_substr($jmeno, 0, 60);
$predmet = $kod('Web tomasrous.cz – ' . ($tema !== '' ? $tema : 'nová zpráva') . ' – ' . $kratke);
$telo = "Nová zpráva z webu tomasrous.cz\n\n"
      . "Jméno: $jmeno\nE-mail: " . ($email !== '' ? $email : '–') . "\nTelefon: " . ($telefon !== '' ? $telefon : '–') . "\nTéma: " . ($tema !== '' ? $tema : '–') . "\n\n"
      . "Zpráva:\n$zprava\n\n--\nOdesláno " . date('j. n. Y H:i') . " formulářem na webu tomasrous.cz";
// Tělo v kódování quoted-printable = řádky nejvýše 76 znaků. Poštovní servery (např. Exim) odmítají zprávu s řádkem
// delším než 998 znaků – dlouhý odstavec napsaný bez odřádkování by jinak nedorazil, přestože web ohlásí „odesláno“.
$telo = quoted_printable_encode(str_replace("\n", "\r\n", $telo));
$hlavicky = "From: \"Web tomasrous.cz\" <$odesilatel>\r\n"
          . ($email_ok ? "Reply-To: " . $kod($kratke) . " <$email>\r\n" : "")
          . "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: quoted-printable\r\nX-Mailer: tomasrous.cz";

// obálkový odesílatel (-f) = schránka na doméně, aby prošla kontrola SPF/DMARC; kde ho hosting nepovolí, odešle se bez něj
$ok = @mail($prijemce, $predmet, $telo, $hlavicky, '-f' . $odesilatel);
if (!$ok) { $ok = @mail($prijemce, $predmet, $telo, $hlavicky); }
if ($ok) { @file_put_contents($f, (string)($n + 1)); }   // limit počítá jen skutečně odeslané zprávy
$odpoved($ok);
