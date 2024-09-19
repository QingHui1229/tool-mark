#!/usr/bin/env bash

set -e

echo "node $(node -v)"
echo "npm $(npm -v)"

rm -rf output

# cd example
npm i
npm run build

mv dist ../output