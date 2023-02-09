#!/bin/sh -e
#

# TODO test run the build
#

cd ../../
yarn add lerna
yarn build
cd packages/open-lens
yarn build:app  --linux Appimage --x64

