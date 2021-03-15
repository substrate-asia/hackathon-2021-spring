import 'reflect-metadata';
import { InversifyExpressServer } from "inversify-express-utils";
import * as bodyParser from 'body-parser';
import { container } from './ioc/ioc';

// load all injectable entities.
// the @provide() annotation will then automatically register them.
import './ioc/loader';
import {logger} from "ethers";
// start the server

let server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  //todo : 上传服务器时要加入安全配置
  // app.use(helmet({
  //     frameguard: {
  //         action: 'allow'
  //     }
  // }));


  app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "*");
    next();
  });
  // let jwt = require('jsonwebtoken');
  // app.use(function (req, res, next) {
  //   //api which do not want token
  //   if ((req.originalUrl.indexOf('/account') >= 0 && req.originalUrl.indexOf('/inviteCode') < 0) || req.originalUrl.indexOf('/message') >= 0 || req.originalUrl.indexOf('/upload') >= 0 || req.method === 'OPTIONS') {
  //     return next();
  //   }
  //   //api which want token
  //   let token = req.body.token || req.query.token || req.headers[CONFIG.JWT.HEADER];
  //   if (token) {
  //     token = token.substring(7);
  //     jwt.verify(token, CONFIG.JWT.SECRET, async (err, decoded) => {
  //       if (err) {
  //         res.statusCode = 401;
  //         res.send("Invalid token. Access Denied");
  //         return;
  //       } else {
  //         if (req.originalUrl.indexOf('/admin') >= 0) {
  //           if (!await new AdminService().isAdmin(DataUtil.getPhoneNumberFromJwt(token))) {
  //             res.statusCode = 401;
  //             res.send("Invalid role. Access Denied");
  //             return;
  //           }
  //           else {
  //             return next();
  //           }
  //         }
  //         return next();
  //       }
  //     });
  //   } else {
  //     res.statusCode = 403;
  //     res.send("No token. Access Denied");
  //     return;
  //   }
  // });
});

let app = server.build();

const isProduction = true;
if (isProduction) {
//   const https = require('https');
//
// //根据项目的路径导入生成的证书文件
//   const privateKey = fs.readFileSync('./certificate/cert-1540985536112_www.ds-xq.com.key');
//   const certificate = fs.readFileSync('./certificate/cert-1540985536112_www.ds-xq.com.crt');
//   const credentials = {key: privateKey, cert: certificate};
//
//   const httpsServer = https.createServer(credentials, app);
//
//   httpsServer.listen(443);
  app.listen(6789);
} else {
  app.listen(6789);
}

exports = module.exports = app;
