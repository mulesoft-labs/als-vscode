#!/bin/bash

# Clean previous
echo "Clean previous"
echo "rm aml-vscode-*.vsix"
rm aml-vscode-*.vsix
echo "rm build/distributions/*.zipix"
rm build/distributions/*.zip

echo "Install & Compile"
echo "npm ci"
npm ci

echo "npm i --save-dev typescript"
npm i --save-dev typescript

retVal=$?
if [ $retVal -ne 0 ]; then
    echo "Error"
    exit $retVal
fi


echo "npm i @aml-org/als-node-client@$ALS_VERSION"
npm i @aml-org/als-node-client@$ALS_VERSION

retVal=$?
if [ $retVal -ne 0 ]; then
    echo "Error"
    exit $retVal
fi

echo "node_modules/.bin/tsc -v"
node_modules/.bin/tsc -v

echo "npm run compile"
npm run compile

retVal=$?
if [ $retVal -ne 0 ]; then
    echo "Error"
    exit $retVal
fi

exit 0