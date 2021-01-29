echo "Connecting to MuleSoft internal registry"
printf "@mulesoft:registry=https://nexus3.build.msap.io/repository/npm-internal/\n//nexus3.build.msap.io/repository/npm-internal/:_authToken=$NPM_TOKEN" > .npmrc
touch .npmrc

echo "npm --version"
npm --version
echo "node --version"
node --version

echo "sed -i 's/{VERSION}/'$VERSION'/' build.gradle"
sed -i 's/{VERSION}/'$VERSION'/' build.gradle

echo "sed -i 's/{VERSION}/'$VERSION'/' package.json"
sed -i 's/{VERSION}/'$VERSION'/' package.json

echo "sed -i 's/{VERSION}/'$VERSION'/' package-lock.json"
sed -i 's/{VERSION}/'$VERSION'/' package-lock.json

echo "sed -i 's/{ALS_VERSION}/'$ALS_VERSION'/' package.json"
sed -i 's/{ALS_VERSION}/'$ALS_VERSION'/' package.json

echo "sed -i 's/{ALS_VERSION}/'$ALS_VERSION'/' package-lock.json"
sed -i 's/{ALS_VERSION}/'$ALS_VERSION'/' package-lock.json

