<?php
// Úroková sazba pro kalkulačku hypotéky (průměrná sazba nových hypoték podle ČNB, ukazatel ARAD SMIRNOOBUVMIRS406CZK011111).
// Pořadí zdrojů: 1) veřejný JSON „Hlavní ukazatele“ databáze ARAD (bez klíče), 2) REST API ARAD s klíčem z config.php,
// 3) poslední úspěšně stažená hodnota (nejvýše 45 dní stará), 4) záloha data/sazby.json.
// Stažená hodnota platí 24 hodin. Když se ČNB stáhnout nepodaří, další pokus se dělá nejdřív za 30 minut –
// návštěvníci mezitím nečekají a server se při výpadku ČNB nezahltí.
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-cache');
$INDIKATOR = 'SMIRNOOBUVMIRS406CZK011111';
$ZDROJ = 'https://www.cnb.cz/aradb/api/v20/main-indicators-cards';
$soubor = __DIR__ . '/data/sazby.json';
$zaloha = is_file($soubor) ? json_decode((string)file_get_contents($soubor), true) : null;
$out = ['hypoteka' => (float)($zaloha['hypoteka'] ?? 5.0), 'zdroj' => 'soubor'];

$cfg = __DIR__ . '/config.php';
if (is_file($cfg)) { require $cfg; }
if (defined('ARAD_INDICATOR') && ARAD_INDICATOR !== '') { $INDIKATOR = ARAD_INDICATOR; }
if (defined('ARAD_JSON_URL') && ARAD_JSON_URL !== '') { $ZDROJ = ARAD_JSON_URL; }

$platna = function ($v) { return is_numeric($v) && (float)$v >= 1 && (float)$v <= 12; };   // rozumný rozsah sazby v % p. a.
$cache = sys_get_temp_dir() . '/tr-sazba-cache.json';   // poslední úspěšně stažená hodnota
$pokus = sys_get_temp_dir() . '/tr-sazba-pokus';        // značka „právě se stahuje / naposledy se nepodařilo“
$c = is_file($cache) ? json_decode((string)file_get_contents($cache), true) : null;
$c = (is_array($c) && $platna($c['hypoteka'] ?? null)) ? $c : null;
$stari = $c !== null ? time() - (int)filemtime($cache) : PHP_INT_MAX;
if ($c !== null && $stari < 86400) { echo json_encode($c, JSON_UNESCAPED_UNICODE); exit; }
if ($c !== null && $stari < 45 * 86400) { $out = $c; }                                    // při výpadku ČNB raději poslední známá sazba než pevná záloha
if (is_file($pokus) && time() - (int)filemtime($pokus) < 1800) { echo json_encode($out, JSON_UNESCAPED_UNICODE); exit; }
@touch($pokus);

$ctx = stream_context_create(['http' => ['timeout' => 4, 'ignore_errors' => true, 'header' => "User-Agent: tomasrous.cz kalkulacka\r\nAccept: application/json, text/plain\r\n"]]);
$nalezeno = null;

// 1) veřejný JSON hlavních ukazatelů (totéž, co ukazuje úvodní stránka ARAD)
$txt = @file_get_contents($ZDROJ, false, $ctx);
if ($txt !== false) {
    $j = json_decode($txt, true);
    foreach ((array)($j['data'] ?? []) as $k) {
        if (($k['code'] ?? '') === $INDIKATOR) {
            $v = str_replace(',', '.', (string)($k['value_str']['en'] ?? $k['value_str']['cs'] ?? ''));
            if ($platna($v)) { $nalezeno = ['hypoteka' => round((float)$v, 2), 'zdroj' => 'ČNB ARAD', 'obdobi' => (string)($k['period']['cs'] ?? '')]; }
            break;
        }
    }
}

// 2) dokumentované REST API (vyžaduje klíč: config.php → ARAD_API_KEY)
if ($nalezeno === null && defined('ARAD_API_KEY') && ARAD_API_KEY !== '') {
    $url = 'https://www.cnb.cz/aradb/api/v1/data?indicator_id_list=' . rawurlencode($INDIKATOR)
         . '&months_before=6&period_sort=desc&delimiter=semicolon&decimal_separator=point&lang=cs&api_key=' . rawurlencode(ARAD_API_KEY);
    $txt = @file_get_contents($url, false, $ctx);
    if ($txt !== false) {
        $txt = @iconv('WINDOWS-1250', 'UTF-8//IGNORE', $txt) ?: $txt;
        foreach (array_slice(preg_split('/\r?\n/', trim($txt)), 1) as $radek) {   // datové řádky, nejnovější první
            $v = null; $obdobi = '';
            foreach (explode(';', $radek) as $pole) {
                $pole = trim($pole);
                if (preg_match('/^\d{8}$/', $pole)) { $obdobi = $pole; }
                elseif (preg_match('/^\d{1,2}[.,]\d{1,4}$/', $pole)) { $n = (float)str_replace(',', '.', $pole); if ($n >= 1 && $n <= 12) { $v = $n; } }
            }
            if ($v !== null) { $nalezeno = ['hypoteka' => round($v, 2), 'zdroj' => 'ČNB ARAD API', 'obdobi' => $obdobi]; break; }
        }
    }
}

if ($nalezeno !== null) { $out = $nalezeno; @file_put_contents($cache, json_encode($out, JSON_UNESCAPED_UNICODE), LOCK_EX); @unlink($pokus); }
echo json_encode($out, JSON_UNESCAPED_UNICODE);
