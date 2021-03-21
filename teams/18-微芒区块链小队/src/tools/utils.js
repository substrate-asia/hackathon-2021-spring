const fs = require('fs');
const yaml = require('js-yaml');

async function getNetworkConfig() {
  const networkConfigPath = process.env['NETWORK_CONFIG'] || 'develop.yaml';
  return yaml.load(fs.readFileSync(networkConfigPath, 'utf-8'));
}

async function execTx(registry, extrinsic, signer) {
  return new Promise((resolve) => {
    extrinsic.signAndSend(signer, (result) => {
      if (result.status.isFinalized || result.status.isInBlock) {
        result.events.filter(({ event: { section } }) => section === 'system')
          .forEach((event) => {
            const { event: { data, method } } = event;
            if (method === 'ExtrinsicFailed') {
              const [dispatchError] = data;
              let message = dispatchError.type;
              if (dispatchError.isModule) {
                try {
                  const mod = dispatchError.asModule;
                  const error = registry.findMetaError(
                    new Uint8Array([
                      mod.index.toNumber(),
                      mod.error.toNumber()
                    ])
                  );
                  message = `${error.section}.${error.name}`;
                } catch (error) {
                  message = error.message;
                }
              }
              resolve({
                status: false,
                data: null,
                message,
              });
            } else if (method === 'ExtrinsicSuccess') {
              resolve({
                status: true,
                data: result,
                message: null,
              });
            }
          });
      } else if (result.isError) {
        resolve({
          status: false,
          data: result,
          message: null,
        });
      }
    }).catch((error) => {
      resolve({
        status: false,
        data: null,
        message: error.message,
      })
    });
  });
}

module.exports = {
  execTx,
  getNetworkConfig,
};