<template>
    <div class="index">
        <div class="container">
            <h2 class="title">market</h2>
            <div class="search">
                <Input
                    v-model="searchContent"
                    @enter="search()"
                    class="input"
                    placeholder="Please enter keywords to search works"
                />
                <img @click="search" src="@/assets/images/search@2x.png" />
            </div>
            <div class="filter">
                <div class="name">
                    <div
                        class="name-item"
                        :class="{ active: active_cate == 'materials' }"
                        @click="active_cate = 'materials'"
                    >
                        Classification
                    </div>
                    <div
                        class="name-item"
                        @click="active_cate = 'themes'"
                        :class="{ active: active_cate == 'themes' }"
                    >
                        Theme
                    </div>
                    <div
                        class="name-item"
                        @click="active_cate = 'categories'"
                        :class="{ active: active_cate == 'categories' }"
                    >
                        Category
                    </div>
                    <div
                        class="name-item"
                        @click="active_cate = 'price'"
                        :class="{ active: active_cate == 'price' }"
                    >
                        Price
                    </div>
                </div>
                <div class="catetory">
                    <div
                        class="catetory-item"
                        @click="requestFilterData(v)"
                        v-for="(v, i) in categoryList"
                        :key="i"
                        :class="{
                            active:
                                active_subcate == v.id &&
                                current_cate == v.cate_label,
                        }"
                    >
                        <div v-if="active_cate == 'price'">
                            {{ v.gte ? v.gte : "低于" }}
                            {{ v.gte && v.lt ? " - " : "" }}
                            {{ v.lt ? v.lt : "以上" }}
                        </div>
                        <div v-else>
                            {{ v.title || "unknown" }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="content" v-loading="isLoading">
                <Thumbnail :list="list" :isGroup="true"></Thumbnail>
            </div>
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
    </div>
</template>

<script>
import Input from "@/components/Input";
import Thumbnail from "@/components/Thumbnail";
export default {
    name: "index",
    components: { Thumbnail, Input },
    data() {
        return {
            list: [],
            page: 1,
            priceInterval: [],
            per_page: 18,
            total_pages: 0,
            total_count: 0,
            category_id: "",
            theme_id: "",
            material_id: "",
            price_gte: "",
            price_lt: "",
            active_cate: "",
            active_subcate: "",
            current_cate: "",
            isLoading: true,

            searchContent: "",
        };
    },
    created() {
        // if (this.materials.length > 0) {
        //     this.material_id = this.materials[0].id;
        //     this.active_subcate = this.materials[0].id;
        // }
        this.requsetPriceLimit();
    },
    computed: {
        categoryList() {
            if (this.active_cate == "price") {
                return this.priceInterval;
            } else if (this.active_cate == "themes") {
                return this.$store.state.art.themes;
            } else if (this.active_cate == "categories") {
                return this.$store.state.art.categories;
            } else {
                return this.$store.state.art.materials;
            }
        },
        materials() {
            return this.$store.state.art.materials;
        },
        hasPrev() {
            return this.page > 1;
        },
        hasNext() {
            return this.page < this.total_pages;
        },
    },
    watch: {
        materials(value) {
            if (value.length > 0) {
                this.material_id = value[0].id;
                this.active_subcate = value[0].id;
                this.requestData();
            }
        },
    },
    methods: {
        // need to fix
        requestData() {
            this.isLoading = true;
            this.list = [];
            let obj = {
                page: this.page,
                per_page: this.per_page,
            };
            if (this.category_id) {
                obj.category_id = this.category_id;
            } else if (this.theme_id) {
                obj.theme_id = this.theme_id;
            } else if (this.material_id) {
                obj.material_id = this.material_id;
            }
            if (this.price_gte) {
                obj.price_gte = this.price_gte;
            }
            if (this.price_lt) {
                obj.price_lt = this.price_lt;
            }
            this.$http
                .globalGetSellingArt(obj)
                .then((res) => {
                    this.isLoading = false;
                    this.current_cate = this.active_cate;
                    this.list = res.list;
                    this.total_count = res.total_count;
                    this.total_pages = Math.ceil(
                        this.total_count / this.per_page
                    );
                })
                .catch((err) => {
                    this.isLoading = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        search() {
            if (this.isLoading) return;
            this.active_cate = "";
            this.active_subcate = "";
            this.page = 1;
            this.list = [];
            this.isLoading = true;
            this.$http
                .globalGetSearchMarket({
                    q: this.searchContent,
                    page: this.page,
                })
                .then((res) => {
                    this.isLoading = false;
                    this.current_cate = this.active_cate;
                    this.list = res.list ? res.list : res;
                    this.total_count = res.total_count;
                    this.total_pages = Math.ceil(
                        this.total_count / this.per_page
                    );
                })
                .catch((err) => {
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
        requestFilterData(item) {
            this.page = 1;
            this.searchContent = "";
            if (
                this.active_cate != item.cate_label ||
                this.active_subcate != item.id
            ) {
                this.active_cate = item.cate_label;
                this.active_subcate = item.id;
            } else {
                this.active_cate = "";
                this.active_subcate = "";
            }
            this.resetActive_cate(item);
            this.requestData();
        },
        requsetPriceLimit() {
            this.$http
                .globalGetPriceInterval({})
                .then((res) => {
                    this.priceInterval = res.map((v, i) => {
                        v.id = i + 1;
                        v.cate_label = "price";
                        return v;
                    });
                    this.requestData();
                })
                .catch((err) => {
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        resetForm() {
            this.category_id = "";
            this.material_id = "";
            this.price_gte = "";
            this.price_lt = "";
            this.theme_id = "";
        },
        resetActive_cate(item) {
            this.resetForm();
            switch (this.active_cate) {
                case "materials":
                    this.material_id = item.id;
                    break;
                case "themes":
                    this.theme_id = item.id;
                    break;
                case "categories":
                    this.category_id = item.id;
                    break;
                case "price":
                    this.price_gte = item.gte || "";
                    this.price_lt = item.lt || "";
                    break;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.index {
    padding-top: 60px;
}
.container {
    min-height: 100px;
}
h2.title {
    font-family: "Broadway";
    font-size: 44px;
    font-weight: 400;
    text-transform: uppercase;
    margin-bottom: 60px;
}
.search {
    width: 100%;
    position: relative;
    text-align: left;
    margin-bottom: 60px;
    > img {
        cursor: pointer;
        width: 34px;
        height: 34px;
        position: absolute;
        left: 840px;
        top: 50%;
        transform: translateY(-50%);
    }
    .input {
        width: 900px;
        height: 69px;
        font-size: 22px;
        ::v-deep input {
            padding-right: 70px;
        }
    }
}
.filter {
    display: flex;
    flex-direction: column;
    .name {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-bottom: 40px;
    }
    .name-item {
        font-size: 24px;
        font-weight: 600;
        letter-spacing: 0px;
        margin-right: 82px;
        color: #606060;
        cursor: pointer;
    }
    .name-item.active {
        color: black;
    }
    .name-item:hover {
        color: black;
    }
    .catetory {
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 71px;
    }
    .catetory-item {
        border: 2px solid #606060;
        padding: 7px 15px;
        margin-right: 50px;
        margin-bottom: 20px;
        font-size: 18px;
        font-weight: 400;
        text-align: center;
        letter-spacing: 0px;
        min-width: 150px;
        color: #606060;
        cursor: pointer;
    }
    .catetory-item.active {
        color: black;
        border-color: black;
    }
    .catetory-item:hover {
        color: black;
        border-color: black;
    }
}

.content {
    margin-bottom: 100px;
    min-height: 100px;
}

.pagenation {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 133px;
    .prev {
        width: 110px;
        height: 70px;
        background: url("~@/assets/images/zuo@2x.png") no-repeat;
        background-size: 100% auto;
        margin: 0 91px;
        cursor: pointer;
    }
    .next {
        width: 110px;
        height: 70px;
        background: url("~@/assets/images/you@2x.png") no-repeat;
        background-size: 100% auto;
        margin: 0 91px;
        cursor: pointer;
    }
    .prev.no-prev,
    .next.no-next {
        opacity: 0.3;
        cursor: not-allowed;
    }
}
</style>
