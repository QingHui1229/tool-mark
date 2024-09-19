#!/bin/bash

version=`npm info tool-mark --registry=https://registry.npmmirror.com | grep "latest:"`

echo "tool-mark最新版本：${version}"

read -p  "请输入tool-mark版本: " version

sed -i '' -e 's/\"version\": \".*\"/\"version\": \"'${version}'\"/g' ./package.json
set -e

npm run build

npm publish