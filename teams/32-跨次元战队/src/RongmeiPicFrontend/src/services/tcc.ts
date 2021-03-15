import request from "@/utils/request";
import {TCC_SERVICE} from "@/services/config";

export async function getTCC(key: string) {
  return request(TCC_SERVICE, `tcc/key?key=${key}`);
}
