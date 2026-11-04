<?php
// Úroková sazba pro kalkulačku hypotéky (průměrná sazba nových hypoték podle ČNB, ukazatel ARAD SMIRNOOBUVMIRS406CZK011111).
// Pořadí zdrojů: 1) veřejný JSON „Hlavní ukazatele“ databáze ARAD (bez klíče), 2) REST API ARAD s klíčem z config.php,
// 3) záloha data/sazby.json. Výsledek se ukládá na 24 hodin do mezipaměti.
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-cache');
$INDIKATOR = 'SMIRNOOBUVMIRS406CZK011111';
$soubor = __DIR__ . '/data/sazby.json';
$zaloha = is_file($soubor) ? json_decode((string)file_get_contents($soubor), true) : null;
$out = ['hypoteka' => (float)($zaloha['hypoteka'] ?? 5.0), 'zdroj' => 'soubor'];

$cfg = __DIR__ . '/config.php';
if (is_file($cfg)) { require $cfg; }
if (defined('ARAD_INDICATOR') && ARAD_INDICATOR !== '') { $INDIKATOR = ARAD_INDICATOR; }

$cache = sys_get_temp_dir() . '/tr-sazba-cache.json';
$c = (is_file($cache) && time() - filemtime($cache) < 86400) ? json_decode((string)file_get_contents($cache), true) : null;
if (is_array($c) && isset($c['hypoteka'])) { echo json_encode($c, JSON_UNESCAPED_UNICODE); exit; }

$ctx = stream_context_create(['http' => ['timeout' => 6, 'ignore_errors' => true, 'header' => "User-Agent: tomasrous.cz kalkulacka\r\nAccept: application/json, text/plain\r\n"]]);
$nalezeno = null;

// 1) veřejný JSON hlavních ukazatelů (totéž, co ukazuje úvodní stránka ARAD)
$txt = @file_get_contents('https://www.cnb.cz/aradb/api/v20/main-indicators-cards', false, $ctx);
if ($txt !== false) {
    $j = json_decode($txt, true);
    foreach ((array)($j['data'] ?? []) as $k) {
        if (($k['code'] ?? '') === $INDIKATOR) {
            $v = (float)str_replace(',', '.', (string)($k['value_str']['en'] ?? $k['value_str']['cs'] ?? ''));
            if ($v >= 1 && $v <= 12) { $nalezeno = ['hypoteka' => round($v, 2), 'zdroj' => 'ČNB ARAD', 'obdobi' => (string)($k['period']['cs'] ?? '')]; }
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

if ($nalezeno !== null) { $out = $nalezeno; @file_put_contents($cache, json_encode($out, JSON_UNESCAPED_UNICODE), LOCK_EX); }
echo json_encode($out, JSON_UNESCAPED_UNICODE);
