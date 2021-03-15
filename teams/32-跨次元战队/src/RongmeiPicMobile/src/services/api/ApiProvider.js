import {AccountServiceImpl} from './account/AccountService'
import {AccountServiceMock} from './account/AccountServiceMock'
import {UploadServiceImpl} from "./upload/UploadService";
import {TCCServiceImpl} from "./tcc/TCCService";
import {MoneyServiceImpl} from "./money/MoneyService";
import {UserServiceImpl} from './user/User';
import {AuctionServiceImpl} from './auction/AuctionService';
import {ExamServiceImpl} from "./exam/ExamService";
import {BalanceServiceImpl} from "./balance/BalanceService";

class ApiProvider {
  isMock = false;

  accountService = undefined;
  uploadService = undefined;
  tccService = undefined;
  moneyService = undefined;
  auctionService = undefined;
  userService = undefined;
  examService = undefined;
  balanceService = undefined;

  constructor() {
    if (this.isMock) {
      this.accountService = new AccountServiceMock();
      this.uploadService = new UploadServiceImpl();
      this.tccService = new TCCServiceImpl();
      this.moneyService = new MoneyServiceImpl();
      this.auctionService = new AuctionServiceImpl();
      this.userService = new UserServiceImpl();
      this.examService = new ExamServiceImpl();
      this.balanceService = new BalanceServiceImpl();
    } else {
      this.accountService = new AccountServiceImpl();
      this.uploadService = new UploadServiceImpl();
      this.tccService = new TCCServiceImpl();
      this.moneyService = new MoneyServiceImpl();
      this.auctionService = new AuctionServiceImpl();
      this.userService = new UserServiceImpl();
      this.examService = new ExamServiceImpl();
      this.balanceService = new BalanceServiceImpl();
    }
  }
}

export const api = new ApiProvider();
