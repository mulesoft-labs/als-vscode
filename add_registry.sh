echo "Connecting to MuleSoft internal registry"
printf "@mulesoft:registry=https://nexus3.build.msap.io/repository/npm-internal/\n//nexus3.build.msap.io/repository/npm-internal/:_authToken=$NPM_TOKEN" > .npmrc
touch .npmrc
echo "sed -i 's/{VERSION}/'$VERSION'/' package.json"
sed -i 's/{VERSION}/'$VERSION'/' package.json
echo "sed -i 's/{VERSION}/'$VERSION'/' package-lock.json"
sed -i 's/{VERSION}/'$VERSION'/' package-lock.json
echo "sed -i 's/{VERSION}/'$VERSION'/' build.gradle"
sed -i 's/{VERSION}/'$VERSION'/' build.gradle
npm --version
echo "npm --version"
npm --version
echo "node --version"
node --version
echo "npm ci"
npm ci

# when receiving specific {ALS-VERSION}
# npm i @mulesoft/als-node-client@{ALS-VERSION}

echo "node_modules/.bin/tsc -v"
node_modules/.bin/tsc -v
echo "tsc -v"
tsc -v
echo "ls -larth node_modules"
ls -larth node_modules
echo "ls -larth node_modules/.bin"
ls -larth node_modules/.bin
echo "npm run compile"
npm run compile