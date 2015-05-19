#!/bin/bash

php versionUp.php

cd src
zip -q -r ../build/youtrack-chrome-extension.zip *
cd ..