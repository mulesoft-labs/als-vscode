#!/bin/bash

info=$(vsce show MuleSoftInc.aml-vscode)
regex="(Version:)(.*)"
if [[ $info =~ Version:[[:blank:]]+([[:digit:]]+.[[:digit:]]+.[[:digit:]]+) ]]
then
    version="${BASH_REMATCH[1]}"
    echo "${version}"    # concatenate strings
    npm --no-git-tag-version --allow-same-version version $version
else
    echo "$info doesn't match" >&2 # this could get noisy if there are a lot of non-matching files
fi
