# Clean previous
echo "Clean previous"
echo "rm aml-vscode-*.vsix"
rm aml-vscode-*.vsix
echo "rm build/distributions/*.zipix"
rm build/distributions/*.zip

echo "Install & Compile"
echo "npm ci"
npm ci

echo "npm i @mulesoft/als-node-client@$ALS_VERSION"
npm i @mulesoft/als-node-client@$ALS_VERSION

echo "node_modules/.bin/tsc -v"
node_modules/.bin/tsc -v
echo "tsc -v"
tsc -v

echo "npm run compile"
npm run compile