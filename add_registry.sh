echo "Connecting to MuleSoft internal registry"
printf "@mulesoft:registry=https://nexus3.build.msap.io/repository/npm-internal/\n//nexus3.build.msap.io/repository/npm-internal/:_authToken=$NPM_TOKEN" > .npmrc
touch .npmrc
echo "npm --version"
npm --version
echo "node --version"
node --version
echo "node_modules/.bin/tsc -v"
node_modules/.bin/tsc -v
echo "tsc -v"
tsc -v
echo "npm install"
npm ci
echo "npm install @types/node --save-dev"
npm install @types/node --save-dev
echo "npm run compile"
npm run compile