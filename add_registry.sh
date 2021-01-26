echo "Connecting to MuleSoft internal registry"
printf "@mulesoft:registry=https://nexus3.build.msap.io/repository/npm-internal/\n//nexus3.build.msap.io/repository/npm-internal/:_authToken=$NPM_TOKEN" > .npmrc
touch .npmrc
npm --version
node --version
npm install