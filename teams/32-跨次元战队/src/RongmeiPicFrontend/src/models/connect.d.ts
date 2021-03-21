import {MenuDataItem} from '@ant-design/pro-layout';
import {StateType} from "@/models/user";
import {UserInfoModelState} from "@/models/userInfo";
import {OrderModalState, ScriptsModalState} from "@/models/order";
import {NoticeModalState} from "@/models/notice";
import {MenuDataModelState} from "@/models/menuData";
import {GlobalModelState} from './global';
import {DefaultSettings as SettingModelState} from '../../config/defaultSettings';
import {CommodityModalState} from "@/models/commodity";
import {SearchModelState} from "@/models/search";

export {GlobalModelState, SettingModelState};

export interface Loading {
  global: boolean;
  effects: { [key: string]: boolean | undefined };
  models: {
    global?: boolean;
    menu?: boolean;
    setting?: boolean;
    user?: boolean;
    login?: boolean;
    userInfo?: boolean;
    menuData?: boolean;
    commodity?: boolean;
    order?: boolean;
  };
}

export interface ConnectState {
  global: GlobalModelState;
  loading: Loading;
  settings: SettingModelState;
  user: StateType;
  userInfo: UserInfoModelState;
  menuData: MenuDataModelState;
  commodity: CommodityModalState;
  order: OrderModalState;
}

export interface Route extends MenuDataItem {
  routes?: Route[];
}
