<?php

error_reporting(0);

if (strstr($_SERVER['SERVER_NAME'], "headstonesdesigner")) {
  $dir = "./";
} else {
  $dir = "./";
}

$ml = array();

if (is_dir($dir)) {
    if ($dh = opendir($dir)) {
      while (($file = readdir($dh)) !== false) {
        if (strstr($file, "json")) {
            //$f = file_get_contents($file, true);

            $fh = fopen($file, "r");
            $f = json_decode(fread($fh, filesize($file)));
            fclose($fh);

            array_push($ml, $f);
        }
      }
      closedir($dh);
    }
}

$fh = fopen("ml.json", "w");
fwrite($fh, json_encode($ml, JSON_PRETTY_PRINT));
fclose($fh);

echo "@done<br>";
if (strstr($_SERVER['SERVER_NAME'], "headstonesdesigner")) {
  echo "<a target='_blank' href='https://headstonesdesigner.com/design/saved-designs/json/ml/ml.json'>open</a>";
} else {
  echo "<a target='_blank' href='https://forevershining.com.au/design/saved-designs/json/ml/ml.json'>open</a>";
}  


?>