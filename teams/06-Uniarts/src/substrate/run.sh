echo Running node $NODE
echo P2P Port        : $P2PPORT
echo WebSocket Port  : $WSPORT
echo RPC Port        : $RPCPORT
echo Validator = $VALIDATOR

if [ "$VALIDATOR" = True ];
then
echo This is a Validator node;
/usr/local/bin/uart \
  --base-path /chain-data \
  --chain staging \
  --port $P2PPORT \
  --ws-port $WSPORT \
  --rpc-port $RPCPORT \
  --validator \
  --rpc-methods=Unsafe \
  --name $NODE \
  --ws-external \
  --rpc-external \
  --rpc-cors all;
else
echo This is a Gateway node;
/usr/local/bin/uart \
  --base-path /chain-data \
  --chain staging \
  --port $P2PPORT \
  --ws-port $WSPORT \
  --rpc-port $RPCPORT \
  --name $NODE \
  --ws-external \
  --rpc-external \
  --rpc-cors all;
fi
