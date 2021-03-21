import {Reducer, Effect} from 'umi';
import {CommodityItem, getCommodities} from "@/services/commodity";

export interface CommodityModalState {
  key: string;
  commodities: CommodityItem[];
  total: number;
}

export interface CommodityModalType {
  namespace: string;
  state: CommodityModalState;
  effects: {
    searchCommodities: Effect;
  };
  reducers: {
    saveKey: Reducer<CommodityModalState>;
    saveCommodities: Reducer<CommodityModalState>;
  };
}

const CommodityModal: CommodityModalType = {
  namespace: 'commodity',

  state: {
    key: '',
    commodities: [],
    total: 0
  },

  effects: {
    * searchCommodities({payload}, {call, put}) {
      yield put({
        type: 'saveKey',
        payload: payload.key,
      });
      const response = yield call(getCommodities, payload);
      yield put({
        type: 'saveCommodities',
        payload: response,
      });
    },
  },

  reducers: {
    saveCommodities(state, {payload}) {
      return {
        ...state,
        commodities: payload.commodities,
        total: payload.total
      };
    },
    saveKey(state, {payload}) {
      return {
        ...state,
        key: payload.key,
      };
    },
  },
};

export default CommodityModal;
