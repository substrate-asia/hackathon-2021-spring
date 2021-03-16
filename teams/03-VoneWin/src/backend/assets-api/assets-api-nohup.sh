#!/bin/bash

ps -ef | grep assets-api | grep -v grep
if [ $? -eq 0 ]
then
echo "--------Startup process--------"
nohup  /data/polkadot-hackathon/code/backend/assets-api &
else
echo "--------The process is running-------"
fi
