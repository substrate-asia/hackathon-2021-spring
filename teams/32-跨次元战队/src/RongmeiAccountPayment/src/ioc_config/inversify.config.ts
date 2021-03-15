// file inversify.config.ts

import { Container } from "inversify";
import TYPES from "../constant/types";
import { BalanceService } from "../service/BalanceService";

const myContainer = new Container();
myContainer.bind<BalanceService>(TYPES.BalanceService).to(BalanceService);
export { myContainer };
