echo "Connecting to MuleSoft internal registry"
printf "@mulesoft:registry=https://nexus3.build.msap.io/repository/npm-internal/\n//nexus3.build.msap.io/repository/npm-internal/:_authToken=$NPM_TOKEN" > .npmrc
touch .npmrc
echo "npm --version"
npm --version
echo "node --version"
node --version
echo "npm ci"
npm ci
echo "ls -larth node_modules"
ls -larth node_modules
echo "npm run compile"
npm run compile