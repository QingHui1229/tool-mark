#!/usr/bin/env bash

set -e

export PATH=$NODEJS_18_3_0_BIN:$PATH

echo "node $(node -v)"
echo "npm $(npm -v)"

rm -rf output

cd example
npm i
npm run build

mv dist ../output