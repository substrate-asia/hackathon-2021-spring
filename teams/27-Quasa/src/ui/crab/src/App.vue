<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
body,
div,
a,
h1,
h2,
h3,
input,
form,
strong,
span,
select,
option,
textarea,
dl,
dt,
dd,
ul,
li,
p {
  margin: 0;
  padding: 0;
}
strong,
i,
em {
  font-style: normal;
}
li {
  list-style: none;
}
/* html::-webkit-scrollbar,
body::-webkit-scrollbar {
  width: 0;
  height: 0;
} */
html,
body {
  margin: 0;
  /*height: 100%;*/
  font-family: "PingFang-SC-Regular", "Microsoft YaHei", "微软雅黑", Arial;
  background-color: #d9dbe6;
}

a {
  text-decoration: none;
  color: #000000;
}
.flex-center {
  display: flex;
  align-items: center;
}
.flex-center-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.flex-center-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pd60 {
  padding-bottom: 60px;
}
.global-box {
  width: 359px;
  box-sizing: border-box;
  padding: 0 18px 0;
  margin: 0 auto 4px;
  background: #fff;
  border-radius: 4px;
  position: relative;
  box-shadow: 0px 1px 4px 2px rgba(0, 0, 0, 0.05);
}
.global-line {
  display: block;
  width: 6px;
  height: 20px;
  background: #00cdec;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 4px 0 0 0;
}
body .van-toast {
  background-color: rgba(50, 50, 51, 0.6);
}
</style>
