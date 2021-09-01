echo "Install"
npm install

echo "Compile tests"
npm run pretest

echo "Run tests"
xvfb-run -a npm cit
retVal=$?
echo "Finished running tests"
if [ $retVal -ne 0 ]; then
    echo "Error"
    exit $retVal
fi

exit 0