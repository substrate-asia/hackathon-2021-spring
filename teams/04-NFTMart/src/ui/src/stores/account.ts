import Rekv from 'rekv';

const store = new Rekv({
  balance: null,
  nonce: -1,
});

export default store;
