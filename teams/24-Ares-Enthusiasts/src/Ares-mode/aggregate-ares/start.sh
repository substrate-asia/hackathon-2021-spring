git pull
docker-compose down

cd   huobiaggregate/
mvn  install -Dmaven.test.skip=true
mv   target/huobiaggregate-0.0.1-SNAPSHOT.jar   docker/app.jar
cd   docker/
docker build -t  huobiaggregate:last  .

cd ../../

cd  okexaggregate/
mvn  install -Dmaven.test.skip=true
mv  target/okexaggregate-0.0.1-SNAPSHOT.jar    docker/app.jar
cd  docker/
docker build -t  okexaggregate:last  .

cd  ../../
docker-compose up -d 
