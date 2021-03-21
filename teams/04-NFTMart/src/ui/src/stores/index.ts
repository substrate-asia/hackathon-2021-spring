import Rekv from 'rekv';

Rekv.delegate = {
  beforeUpdate: ({ state }) => {
    console.log('beforeUpdate', state);
    // 可在这里拦截 setState 的值，并进行修改
    return state;
  },
  afterUpdate: ({ state }) => {
    // afterUpdate 的 state 只包含了需要更新的状态
    console.log('afterUpdate', state);
  },
};

const store = new Rekv({
  address: '',
});

export default store;
