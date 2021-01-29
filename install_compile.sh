echo "Install & Compile"
echo "npm ci"
npm ci

# when receiving specific {ALS-VERSION}
# npm i @mulesoft/als-node-client@{ALS-VERSION}

echo "node_modules/.bin/tsc -v"
node_modules/.bin/tsc -v
echo "tsc -v"
tsc -v

echo "npm run compile"
npm run compile