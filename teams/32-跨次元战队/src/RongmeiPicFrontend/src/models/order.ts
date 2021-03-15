import {Reducer, Effect} from 'umi';
import {getMineOrders, Order} from "@/services/order";

export interface OrderModalState {
  orders: Order[];
}

export interface OrderModalType {
  namespace: string;
  state: OrderModalState;
  effects: {
    getMineOrders: Effect;
  };
  reducers: {
    saveOrders: Reducer<OrderModalState>;
  };
}

const OrderModal: OrderModalType = {
  namespace: 'order',

  state: {
    orders: []
  },

  effects: {
    * getMineOrders({payload}, {call, put}) {
      const response = yield call(getMineOrders, payload);
      yield put({
        type: 'saveOrders',
        payload: response,
      });
    },
  },

  reducers: {
    saveOrders(state, {payload}) {
      return {
        ...state,
        orders: payload.orderItems,
      };
    },
  },
};

export default OrderModal;
