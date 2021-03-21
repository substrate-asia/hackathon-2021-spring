<template>
  <div class="card">
    <div class="left-bar"></div>
    <slot />
  </div>
</template>

<script>
export default {
  name: "Card",
};
</script>

<style lang="less" scoped>
.card {
  display: block;
  z-index: 1;
  box-sizing: border-box;
  padding: 24px 24px;

  background: white;
  box-shadow: 0px 2px 20px 0px rgba(0, 0, 0, 0.02);
  border-radius: 28px;
  border: 1px solid rgba(227, 229, 232, 0.5);
  box-sizing: border-box;
}
.left-bar { 
  position: relative;
  float: left;
  width:4px;
  height:20px;
  background:var(--primary);
  left:0;
  top:18px;
  margin-left: -24px;
}
.card:hover {
    padding: 23px 23px;
  border: 2px solid #ffdb1b;
  box-shadow: 0px 2px 20px 0px #ffe973;
  box-sizing: border-box;
}
</style>
