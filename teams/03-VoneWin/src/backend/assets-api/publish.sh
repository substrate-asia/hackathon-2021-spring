#!/bin/bash
echo "start publishing..."

echo "start pulling git..."
git checkout dev
git pull origin dev

echo "start building..."
rm -f ./assets-api
set GO111MODULE=auto
go mod vendor
go build -a
if [ $? -ne 0 ]; then
    echo "build assets-api fail"
    exit
fi
chmod 755 ./assets-api

echo "restart assets-api..."
PID=$(ps -e|grep assets-api|grep -v grep|awk '{printf $1}')
if [ $? -eq 0 ]; then
    echo "process id:$PID"
    kill -9 ${PID}
    echo "stop assets-api success"
fi

nohup ./assets-api &
echo "start assets-api success"
echo -e "complete!\n\n"

tail -f -n 100 nohup.out
