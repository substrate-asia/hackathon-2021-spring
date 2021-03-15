<template>
    <div class="candidates container">
        <div class="title">Candidates</div>
        <div class="content" v-loading="isLoading">
            <div class="thumbnail">
                <div class="no-data" v-if="list.length == 0">No artworks</div>
                <div class="item" v-for="(v, i) in list" :key="i">
                    <router-link :to="`/art/${v.id}`" class="img-container">
                        <AdaptiveImage
                            :url="v.img_main_file1.url"
                        ></AdaptiveImage>
                    </router-link>
                    <h5 class="title">{{ v.name }}</h5>
                    <div class="desc">{{ materialType(v.material_id) }}</div>
                    <div class="address-label">
                        Certificate Address:
                        <span class="address">{{ v.item_hash }}</span>
                    </div>
                    <div class="price">Starting at {{ v.price }} UART</div>
                    <div class="button-group">
                        <el-button
                            @click="approve(v)"
                            v-loading="v.isApproving"
                            element-loading-spinner="el-icon-loading"
                            element-loading-background="rgba(0, 0, 0, 0.8)"
                        >
                            APPROVE
                        </el-button>
                        <el-button
                            @click="refuse(v)"
                            v-loading="v.isFusing"
                            element-loading-spinner="el-icon-loading"
                            element-loading-background="rgba(0, 0, 0, 0.8)"
                        >
                            REFUSE
                        </el-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import AdaptiveImage from "@/components/AdaptiveImage";
import { Button } from "element-ui";
export default {
    name: "candidates",
    components: {
        AdaptiveImage,
        [Button.name]: Button,
    },
    data() {
        return {
            id: this.$route.params.id,
            list: [],
            total_count: 0,
            isLoading: false,
        };
    },
    created() {
        this.requestData();
    },
    methods: {
        requestData() {
            this.isLoading = true;
            this.$http
                .userGetAuctionApplyList({}, { id: this.id })
                .then((res) => {
                    this.list = res.list.map((v) => {
                        v.art.price = v.start_price;
                        v.art.isFusing = false;
                        v.art.isApproving = false;
                        return v.art;
                    });
                    this.total_count = res.total_count;
                    this.isLoading = false;
                })
                .catch((err) => {
                    console.log(err);
                    this.isLoading = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        approve(item) {
            if (item.isApproving) return;
            item.isApproving = true;
            this.$http
                .userPostAuctionApprove(
                    {
                        art_id: item.id,
                    },
                    { id: this.id }
                )
                .then(() => {
                    let index = this.list.findIndex((v) => v.id == item.id);
                    index >= 0 ? this.list.splice(index, 1) : "";
                    this.$notify.success("Approved");
                })
                .catch((err) => {
                    console.log(err);
                    item.isApproving = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        refuse(item) {
            if (item.isFusing) return;
            item.isFusing = true;
            this.$http
                .userPostAuctionRefuse(
                    {
                        art_id: item.id,
                    },
                    { id: this.id }
                )
                .then(() => {
                    let index = this.list.findIndex((v) => v.id == item.id);
                    index >= 0 ? this.list.splice(index, 1) : "";
                    this.$notify.success("Rejected");
                })
                .catch((err) => {
                    console.log(err);
                    item.isFusing = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        materialType(id) {
            let item = this.$store.state.art.materials.find(
                (v) => v.code == id + ""
            );
            return item ? item.title : "";
        },
    },
};
</script>
<style lang="scss" scoped>
.candidates > .title {
    margin-top: 70px;
    font-size: 48px;
    font-family: "Broadway";
    font-weight: 400;
    line-height: 40px;
    text-align: left;
    letter-spacing: 0px;
    margin-bottom: 103px;
}
.content {
    margin-bottom: 50px;

    .thumbnail {
        overflow: hidden;
    }
    .thumbnail.group {
        .item {
            margin-bottom: 115px;
        }
    }
    .item {
        float: left;
        width: 30%;
        margin-right: 5%;
        margin-bottom: 35px;
    }
    .item:nth-child(3n) {
        margin-right: 0;
    }

    .img-container {
        display: block;
        width: 100%;
        height: 270px;
        overflow: hidden;
        border-radius: 4px;
        margin-bottom: 35px;
        position: relative;
        .aution-view {
            width: 100%;
            line-height: 35px;
            position: absolute;
            bottom: 0;
            color: white;
            background-color: rgba(0, 0, 0, 0.7);
        }
        .aution-label {
            line-height: 35px;
            position: absolute;
            top: 0;
            border-bottom-left-radius: 4px;
            padding: 0 10px;
            right: 0;
            color: white;
            background-color: rgba(0, 0, 0, 0.7);
        }
    }

    .title {
        text-transform: uppercase;
        font-size: 22px;
        font-weight: 600;
        text-align: left;
        letter-spacing: 0px;
    }
    .desc,
    .address-label {
        font-size: 18px;
        font-weight: 400;
        text-align: left;
        line-height: 35px;
        letter-spacing: 0px;
    }

    .address-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-height: 35px;
    }

    .price {
        font-size: 22px;
        font-weight: 600;
        text-align: left;
        line-height: 30px;
        letter-spacing: 0px;
        margin-top: 8px;
    }

    .button-group {
        width: 100%;
        > button {
            width: 100%;
            border: 2px solid #020202;
            font-size: 16px;
            height: 47px;
            margin-top: 10px;
            display: block;
            cursor: pointer;
            font-weight: 400;
            text-align: center;
            background: transparent;
            color: #020202;
            letter-spacing: 0px;
            padding: 6px 10px;
            margin-left: 0;
            margin-right: 0;
            border-radius: 0;
            text-transform: capitalize;
        }
        ::v-deep .el-loading-mask .el-loading-spinner {
            margin-top: -10px;
        }
    }

    .no-data {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        color: #666;
    }
}
</style>
