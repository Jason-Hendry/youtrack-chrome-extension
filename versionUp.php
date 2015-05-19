<?php

$data = json_decode(file_get_contents('src/manifest.json'),true);

$version = explode('.',$data['version']);
$version[count($version)-1]++;
$data['version'] = implode('.',$version);

echo "Version: {$data['version']}\n";

file_put_contents('src/manifest.json', json_encode($data, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));