
import {httpCommon} from '../HttpService';

export class UserServiceImpl {
  async getUserInfoEntity(username) {
    return httpCommon.get(`account/info/entity?username=${username}`);
  }
}

