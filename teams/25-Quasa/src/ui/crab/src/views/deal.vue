<template>
  <div>
    <top />
    <price />
    <div style="width: 100%; height: 580px; min-width: 1200px">
      <div style="width: 50%; height: 100%; float: left">
        <k_line />
      </div>
      <div style="width: 25%; height: 100%; float: left">
        <location_status />
        <loation_dynamic />
      </div>
      <div style="width: 25%; height: 100%; float: left">
        <transaction />
        <my_account />
      </div>
    </div>
    <my_location />
  </div>
</template>
<script>
import top from "../components/top.vue";
import price from "../components/price_list.vue";
import location_status from "../components/location_status.vue";
import k_line from "../components/k_line.vue";
import loation_dynamic from "../components/loation_dynamic.vue";
import transaction from "../components/transaction.vue";
import my_account from "../components/my_account.vue";
import my_location from "../components/my_location.vue";
export default {
  name: "deal",
  components: {
    top,
    price,
    location_status,
    k_line,
    loation_dynamic,
    transaction,
    my_account,
    my_location,
  },
  created() {
    this.$store.commit("setState", {
      menu: "1",
    });
  },
  methods: {},
};
</script>
<style scoped>
</style>