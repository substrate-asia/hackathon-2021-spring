## 游戏 Server 示例代码 ( TypeScript 版 )

### 说明

- 自定义游戏 Server 必要文件是 index.js，上传代码时需要打包为 zip 文件，并且 zip 文件根目录包含 mgobexs 文件夹，index.js 位于 mgobexs 文件夹下。

- 该示例代码使用 TypeScript 开发，需要编译为 JavaScript 后才能使用。

- 开发者可以在此基础上修改 index.ts 文件进行开发。

### 使用

- 安装 TypeScript、gulp

```
npm install -g typescript
npm install -g gulp
```

- 命令行进入 mgobexs 后执行 

```
npm install
```

- 根据自己的业务逻辑修改 index.ts

- 将 TypeScript 编译为 JavaScript，在 mgobexs 目录执行

```
npm run gulp
```

- 该命令会将代码编译，并生成 zip 文件，开发者将该 zip 文件上传即可

### npm 命令

- npm run gulp ：编译 TypeScript 并打包为 zip

- npm run gulp-watch ：监听 .ts 发生变化时编译 TypeScript， 并打包为 zip

