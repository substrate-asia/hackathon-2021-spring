import {history, Reducer, Effect} from 'umi';

import {setAuthority} from '@/utils/authority';
import {login, loginWithPassword, sendCaptcha, register} from "@/services/user";
import {message} from "antd";

export interface StateType {
  status?: 'ok' | 'error';
  loginType?: 'account' | "phone";
  isShowLogin: boolean;
}

export interface LoginModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    captcha: Effect;
    register: Effect;
    logout: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
    changeLoginShow: Reducer<StateType>;
  };
}

const Model: LoginModelType = {
  namespace: 'user',
  state: {
    status: undefined,
  },

  effects: {
    * login({payload}, {call, put}) {
      let response;
      if (payload.loginType === "account") {
        response = yield call(loginWithPassword, payload.phone, payload.password);
      } else {
        response = yield call(login, payload.phone, payload.captcha);
      }
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Login successfully
      if (response.token) {
        yield setAuthority(response.token);
        history.push('/');
      }
    },

    * captcha({payload}, {call, put}) {
      const response = yield call(sendCaptcha, payload.phone);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
    },

    * register({payload}, {call, put}) {
      let response = yield call(login, payload.phone, payload.captcha);
      response = yield call(register, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Register successfully
      if (response.token) {
        yield setAuthority(response.token);
        message.success('注册成功！');
        history.push('/');
      }
    },

    logout() {
      localStorage.clear();
    },
  },

  reducers: {
    changeLoginStatus(state, {payload}) {
      return {
        ...state,
        status: payload.status
      };
    },
    changeLoginShow(state, {payload}) {
      return {
        ...state,
        isShowLogin: payload.isShowLogin
      };
    },
  },
};

export default Model;
