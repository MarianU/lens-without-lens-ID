#!/bin/bash

podman run --rm -ti \
    --userns keep-id \
    --name lens_ui \
    -v $(pwd)/../../:/app \
    -w /app/packages/open-lens/ \
    docker.io/node:16 \
    bash build.sh

