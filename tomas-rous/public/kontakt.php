<?php
// Odeslání kontaktního formuláře z webu tomasrous.cz e-mailem.
// Před spuštěním ověřit doručení; odesílatel musí být schránka na hostingu (SPF).
date_default_timezone_set('Europe/Prague');
$prijemce   = 'info@tomasrous.cz';
$odesilatel = 'info@tomasrous.cz';
$zpet       = '/';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Location: ' . $zpet); exit; }
if (!empty($_POST['web'])) { header('Location: ' . $zpet . '?odeslano=1#kontakt'); exit; }          // honeypot – robot
$cas = (int)($_POST['t'] ?? 0);
if ($cas <= 0 || time() - $cas < 3) { header('Location: ' . $zpet . '?odeslano=1#kontakt'); exit; }  // bez tokenu nebo vyplněno pod 3 s – robot

$cisti = function ($k, $max) { $v = (string)($_POST[$k] ?? ''); $v = str_replace(["\r", "\n"], ' ', strip_tags($v)); return trim(mb_substr($v, 0, $max)); };
$jmeno = $cisti('jmeno', 120); $email = $cisti('email', 200); $telefon = $cisti('telefon', 40); $tema = $cisti('tema', 80);
$zprava = trim(mb_substr(strip_tags((string)($_POST['zprava'] ?? '')), 0, 4000));

$fetch = (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'fetch');
$chyba = function () use ($fetch, $zpet) { if ($fetch) { header('Content-Type: application/json; charset=UTF-8'); echo json_encode(['ok' => false]); } else { header('Location: ' . $zpet . '?chyba=1#kontakt'); } exit; };
$telefon_ok = strlen(preg_replace('/[^0-9]/', '', $telefon)) >= 9;
$email_ok = $email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL);
if ($jmeno === '' || $zprava === '' || (!$email_ok && !$telefon_ok)) { $chyba(); }

// jednoduchý limit: max. 5 odeslání za hodinu z jedné IP (soubor v /tmp)
$ip = $_SERVER['REMOTE_ADDR'] ?? '0'; $f = sys_get_temp_dir() . '/tr-form-' . md5($ip); $n = 0;
if (is_file($f) && time() - filemtime($f) < 3600) { $n = (int)file_get_contents($f); }
if ($n >= 5) { $chyba(); }

$predmet = '=?UTF-8?B?' . base64_encode('Web tomasrous.cz – ' . ($tema !== '' ? $tema : 'nová zpráva') . ' – ' . $jmeno) . '?=';
$telo = "Nová zpráva z webu tomasrous.cz\n\n"
      . "Jméno: $jmeno\nE-mail: $email\nTelefon: " . ($telefon !== '' ? $telefon : '–') . "\nTéma: " . ($tema !== '' ? $tema : '–') . "\n\n"
      . "Zpráva:\n$zprava\n\n--\nOdesláno " . date('j. n. Y H:i') . " z IP $ip";
$jmeno_hl = preg_match('/[^\x20-\x7E]/', $jmeno) ? '=?UTF-8?B?' . base64_encode($jmeno) . '?=' : $jmeno;   // jméno s diakritikou v hlavičce (RFC 2047)
$hlavicky = "From: Web tomasrous.cz <$odesilatel>\r\n" . ($email_ok ? "Reply-To: $jmeno_hl <$email>\r\n" : "") . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\nX-Mailer: tomasrous.cz";

$ok = @mail($prijemce, $predmet, $telo, $hlavicky);
if ($ok) { @file_put_contents($f, (string)($n + 1)); }   // limit počítá jen skutečně odeslané zprávy
if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'fetch') { header('Content-Type: application/json; charset=UTF-8'); echo json_encode(['ok' => (bool)$ok]); exit; }
header('Location: ' . $zpet . ($ok ? '?odeslano=1' : '?chyba=1') . '#kontakt');
exit;
