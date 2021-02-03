#!/bin/bash

# Clean previous
EXITCODE=0
echo "Clean previous"
echo "rm aml-vscode-*.vsix"
rm aml-vscode-*.vsix
echo "rm build/distributions/*.zipix"
rm build/distributions/*.zip

echo "Install & Compile"
echo "npm ci"
npm ci

EXITCODE=$($EXITCODE+$?)

echo "npm i @mulesoft/als-node-client@$ALS_VERSION"
npm i @mulesoft/als-node-client@$ALS_VERSION
EXITCODE=$($EXITCODE+$?)
echo "node_modules/.bin/tsc -v"
node_modules/.bin/tsc -v

echo "npm run compile"
npm run compile
EXITCODE=$($EXITCODE+$?)

echo "exit code $EXITCODE"
exit $EXITCODE