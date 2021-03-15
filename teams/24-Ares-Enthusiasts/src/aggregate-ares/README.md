# ares_api

Aggregate description:

1. The aggregator adopts the WebSocket real-time connection method to obtain data. If the REST interface is adopted, the speed will be limited or even cut off in high-frequency access. Websocket, on the other hand, solves the problem of real-time and passive monitoring, which saves time and effort and is timely.
2. Ares Oracle gets data when aggregating, there will be a delay, because it needs to aggregate multiple data and listen for multiple results. After caching the data in real-time, the obtained data can be extracted directly, so that there will be no more multiple networks overhead and access efficiency can be improved.
3. Data aggregator adopts algorithm extraction based on discarding 1/3 maximum and 1/3 minimum data to remove unstable factors to the maximum extent and find the most stable data on a real-time basis. Of course, all of Ares' other safeguards are working again.

## install

1. build

   > mvn package -Dmaven.test.skip=true # you shuild install maven and java1.8

2. running

   > cd docker/
   > ./build.sh
   > ./start.sh

3. Access address

   > ip:8080//ares/api/getprice/btcusdt
