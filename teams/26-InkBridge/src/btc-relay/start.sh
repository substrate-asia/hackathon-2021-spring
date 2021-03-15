#!/bin/bash

echo "===== kill && cleanup ====="
ps -ef | grep $(pwd)/btc-relay | grep -v grep | awk '{print $2}' | xargs kill
rm $(pwd)/relay.log

echo "===== start btc relay ====="
nohup $(pwd)/btc-relay -c config.json > relay.log 2>&1 &

echo "========== done. =========="

