import {Effect, Reducer} from "@@/plugin-dva/connect";
import {getTCC} from "@/services/tcc";
import {MenuDataItem} from "@ant-design/pro-layout";

export interface SubMenuDataItem {
  name: string;
  typeList: string[];
}

export interface MenuDataModelState {
  firstType: string[];
  menuData: MenuDataItem[];
  subMenuData: SubMenuDataItem[];
}

export interface MenuDataModelType {
  namespace: string;
  state: MenuDataModelState;
  effects: {
    getMenuData: Effect;
    getSubMenuData: Effect;
  };
  reducers: {
    changeMenuData: Reducer<MenuDataModelState>;
    changeSubMenuData: Reducer<MenuDataModelState>;
  };
}

const MenuDataModel: MenuDataModelType = {
  namespace: 'menuData',
  state: {
    firstType: [],
    menuData: [],
    subMenuData: []
  },
  effects: {
    // eslint-disable-next-line no-empty-pattern
    * getMenuData({}, {call, put}) {
      const response = yield call(getTCC, "rongmei.pic.firsttype");
      if (response.status === 500) {
        return;
      }
      yield put({
        type: 'changeMenuData',
        payload: response,
      });
    },

    * getSubMenuData({payload}, {call, put}) {
      const response = yield call(getTCC, "rongmei.pic.secondtype");
      if (response.status === 500) {
        return;
      }
      const allType = eval(response.tccTuple.value.replace(/\s*/g, ""));
      yield put({
        type: 'changeSubMenuData',
        payload: {
          allSubType: allType,
          firstType: payload.firstType
        },
      });
    },
  },

  reducers: {
    changeMenuData(state, {payload}) {
      let menuDataItems: MenuDataItem[] = [];
      const firstTypes = JSON.parse(payload.tccTuple.value);
      for (let i = 0; i < firstTypes.length; i++) {
        menuDataItems = menuDataItems.concat({
          name: firstTypes[i],
          path: `/playground/${firstTypes[i]}`,
          parentKeys: ["/"],
        })
      }
      return {
        ...state,
        firstType: firstTypes,
        menuData: menuDataItems
      };
    },
    changeSubMenuData(state, {payload}) {
      return {
        ...state,
        subMenuData: payload.allSubType[state.firstType.indexOf(payload.firstType)]
      };
    }
  },
}

export default MenuDataModel;
