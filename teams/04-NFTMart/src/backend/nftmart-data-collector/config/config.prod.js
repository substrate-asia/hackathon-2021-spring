'use strict';
const path = require('path')

module.exports = appInfo => {

    return {
        // 插件路径
        admin_root_path: '/static',
        // 数据库连接
        sqlPath: {
            bin: '',
            backup: '/home/DoraProjectDb/doracms-sql/'
        },
        sequelize: {
            dialect: 'mysql',
            host: '47.110.236.215',
            port: 26987,
            database: 'doracms', //mysql database dir
            username: "root",
            password: "mysql_nozdormu",
            delegate: 'model'
        },
        // 静态目录
        static: {
            prefix: '/static',
            dir: [path.join(appInfo.baseDir, 'app/public'), path.join(appInfo.baseDir, 'backstage/dist'), '/home/doraData/uploadFiles/static'],
            maxAge: 31536000,
        },
        // 日志路径
        logger: {
            dir: '/home/doraData/logsdir/doracms-sql',
        },
        // 服务地址配置
        // server_path: 'https://sql.html-js.cn',
        // server_api: 'https://sql.html-js.cn/api',
        server_path: 'http://127.0.0.1:10003',
        server_api: 'http://127.0.0.1:10003/api',

    }
};