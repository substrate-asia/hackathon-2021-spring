import axios from "axios";
import Storage from "./storage";
import CryptoJS from "crypto-js";

const HOST = "http://localhost:88/";
const AUTH_KEY = "authentication";
const STATUS = {
  SUCCESS: "000000",
  TOKEN_INVALID: "200000",
  TOKEN_EXPIRED: "200001",
};
const storage = new Storage(window.sessionStorage);

export default (url, data, secure) => {
  let auth = null;
  let signature = "";

  if (url === "user/signout") {
    storage.Remove(AUTH_KEY);
    return Promise.resolve();
  }
  if (secure) {
    auth = storage.Get(AUTH_KEY);
    if (!auth) {
      // window.location.href = "/login";
      return Promise.reject("unauthorized.");
    }
  }
  const config = {
    headers: secure
      ? {
          Authorization: `Bearer ${auth.token}`,
        }
      : {},
  };
  const wordArray = CryptoJS.enc.Utf8.parse(JSON.stringify(data || {}));
  const d = CryptoJS.enc.Base64.stringify(wordArray);
  const timestamp = +new Date();
  if (secure) {
    signature = CryptoJS.HmacSHA256(
      d + timestamp + timestamp,
      auth.secret
    ).toString();
  }
  return axios
    .post(
      HOST + url,
      {
        d,
        n: timestamp,
        t: timestamp,
        s: signature,
      },
      config
    )
    .then((resp) => {
      if (resp.status !== 200) {
        return Promise.reject(`[${resp.status}]${resp.statusText}`);
      }

      if (
        resp.data.c === STATUS.TOKEN_INVALID ||
        resp.data.c === STATUS.TOKEN_EXPIRED
      ) {
        // TODO: prompt error message.
        window.location.href = "/login";
        return;
      } else if (resp.data.c === STATUS.SUCCESS) {
        if (resp.data.d) {
          try {
            if (secure) {
              const s = CryptoJS.HmacSHA256(
                resp.data.d + resp.data.t,
                auth.secret
              ).toString();
              if (s !== resp.data.s)
                return Promise.reject(`valid signature fail`);
            }
            const parsedStr = CryptoJS.enc.Base64.parse(resp.data.d);
            const json = parsedStr.toString(CryptoJS.enc.Utf8);
            const data = JSON.parse(json);

            if (url === "user/login") {
              if (data && data.token) {
                storage.Set(AUTH_KEY, data);
              }
            }

            return Promise.resolve(data);
          } catch (err) {
            return Promise.reject(`parse data error: \n ${err}`);
          }
        } else {
          return Promise.reject("response data is empty.");
        }
      } else {
        return Promise.reject(`[${resp.data.c}]${resp.data.m}`);
      }
    });
};
