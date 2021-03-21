import {Reducer, Effect} from 'umi';
import {getUserInfo, saveUserInfo} from "@/services/user";
import {upload} from '@/services/upload';
import {message} from "antd";

export interface UserInfo {
  id: number;
  avatarUrl: string;
  username: string;
  nickname: string;
  email: string;
  address: string;
  description: string;
  personWebsite: string;
}

export interface UserInfoModelState {
  userInfo: UserInfo;
}

export interface UserInfoModelType {
  namespace: string;
  state: UserInfoModelState;
  effects: {
    getUserInfo: Effect
    saveUserInfo: Effect
    uploadAvatar: Effect
    logout: Effect;
  };
  reducers: {
    changeUserInfo: Reducer<UserInfoModelState>;
    changeAvatar: Reducer<UserInfoModelState>;
    clear: Reducer<UserInfoModelState>;
  };
}

const UserInfoModel: UserInfoModelType = {
  namespace: 'userInfo',
  state: {
    userInfo: {
      id: 0,
      avatarUrl: "",
      nickname: ""
    }
  },
  effects: {
    // eslint-disable-next-line no-empty-pattern
    * getUserInfo({}, {call, put}) {
      const response = yield call(getUserInfo);
      if (response.status === 500) {
        return;
      }
      yield put({
        type: 'changeUserInfo',
        payload: response,
      });
    },

    * saveUserInfo({payload}, {call, put}) {
      yield call(saveUserInfo, payload);
      const response = yield call(getUserInfo);
      yield put({
        type: 'changeUserInfo',
        payload: response,
      });
      message.success("基本信息修改成功")
    },

    * uploadAvatar({payload}, {call, put}) {
      const avatarResponse = yield call(upload, payload);
      const infoResponse = yield call(getUserInfo);
      infoResponse.avatarUrl = avatarResponse.url;
      const response = yield call(saveUserInfo, infoResponse);
      yield put({
        type: 'changeUserInfo',
        payload: response,
      });
      yield put({
        type: 'changeAvatar',
        payload: avatarResponse,
      });
    },
  },

  reducers: {
    changeUserInfo(state, {payload}) {
      return {
        ...state,
        userInfo: payload
      };
    },
    changeAvatar(state, {payload}) {
      const userInfo: any = {
        id: state ? state.userInfo.id : 0,
        avatarUrl: payload.url,
        nickname: state ? state.userInfo.nickname : ""
      };
      return {
        ...state, userInfo
      };
    },
    clear(state, {payload}) {
      const userInfo: any = {
        id: 0,
        avatarUrl: "",
        nickname: ""
      };
      return {
        ...state, userInfo
      };
    }
  },
};

export default UserInfoModel;
