#!/bin/bash

# Load environment variables from .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

forge verify-contract  \
    --verifier blockscout  \
    --verifier-url https://blockscout.taurus.autonomys.xyz/api -e ""  \
    --evm-version london --chain 490000 --compiler-version 0.8.28  \
    --watch  \
    $CONTRACT_ADDRESS  \
    MarkStreamScript