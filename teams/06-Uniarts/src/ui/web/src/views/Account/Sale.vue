<template>
    <div class="sale" v-loading="isLoading">
        <Order type="sale" :list="list"></Order>
        <div class="pagenation" v-if="hasPrev || hasNext">
            <div
                class="prev"
                @click="prev"
                :class="{ 'no-prev': !hasPrev }"
            ></div>
            <div
                class="next"
                @click="next"
                :class="{ 'no-next': !hasNext }"
            ></div>
        </div>
    </div>
</template>
<script>
import Order from "./Order";
export default {
    name: "sale",
    components: {
        Order,
    },
    data() {
        return {
            list: [],
            isLoading: false,
            page: 1,
            per_page: 18,
            total_pages: 0,
            total_count: 0,
        };
    },
    mounted() {
        this.requestData();
    },
    computed: {
        hasPrev() {
            return this.page > 1;
        },
        hasNext() {
            return this.page < this.total_pages;
        },
    },
    methods: {
        requestData() {
            this.isLoading = true;
            this.$http
                .userOwnArts({
                    aasm_state: "bidding",
                    page: this.page,
                    per_page: this.per_page,
                })
                .then((res) => {
                    this.isLoading = false;
                    this.list = res.list;
                    this.total_count = res.total_count;
                    this.total_pages = Math.ceil(
                        res.total_count / this.per_page
                    );
                })
                .catch((err) => {
                    console.log(err);
                    this.isLoading = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        next() {
            if (this.hasNext) {
                this.page++;
                this.requestData();
            }
        },
        prev() {
            if (this.hasPrev) {
                this.page--;
                this.requestData();
            }
        },
    },
};
</script>
<style lang="scss" scoped>
.sale {
    padding-left: 10%;
    padding-top: 40px;
}
</style>
