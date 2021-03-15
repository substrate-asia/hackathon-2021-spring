<template>
    <div class="thumbnail" :class="{ group: isGroup }">
        <div class="no-data" v-if="list.length == 0">No artworks</div>
        <div class="item" v-for="(v, i) in list" :key="i">
            <router-link :to="`/art/${v.id}`" class="img-container">
                <AdaptiveImage :url="v.img_main_file1.url"></AdaptiveImage>
                <div class="aution-view" v-if="v.aasm_state == 'auctioning'">
                    {{
                        computeBlockTimestamp(v.auction_start_time) | dateFormat
                    }}
                    ~
                    {{ computeBlockTimestamp(v.auction_end_time) | dateFormat }}
                </div>
                <div class="aution-label" v-if="v.aasm_state == 'auctioning'">
                    IN AUCTION
                </div>
            </router-link>
            <h5 class="title">{{ v.name }}</h5>
            <div class="desc">{{ materialType(v.material_id) }}</div>
            <div class="address-label">
                Certificate Address:
                <span class="address">{{ v.item_hash }}</span>
            </div>
            <div class="price" v-if="!isAuction">{{ v.price }} UART</div>
            <div class="price" v-else>Starting at {{ v.price }} UART</div>
        </div>
    </div>
</template>
<script>
import AdaptiveImage from "./AdaptiveImage";
import { ComputeBlockTimestamp } from "@/utils";
export default {
    name: "thumbnail",
    components: {
        AdaptiveImage,
    },
    props: {
        list: {
            type: Array,
            default: () => [],
        },
        isGroup: {
            type: Boolean,
            default: false,
        },
        isAuction: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {};
    },
    methods: {
        materialType(id) {
            let item = this.$store.state.art.materials.find(
                (v) => v.code == id + ""
            );
            return item ? item.title : "";
        },
        computeBlockTimestamp(blockNumber) {
            return ComputeBlockTimestamp(
                blockNumber,
                this.$store.state.global.chain.timestamp,
                this.$store.state.global.chain.blockHeight
            );
        },
    },
};
</script>
<style lang="scss" scoped>
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
        text-align: center;
        background-color: rgba(134, 29, 57, 0.8);
    }
    .aution-label {
        line-height: 35px;
        position: absolute;
        top: 15px;
        left: 0;
        padding: 0px 16px;
        background-color: #f9b43b;
        font-size: 16px;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        font-weight: 600;
        text-align: center;
        color: #ffffff;
        letter-spacing: 0px;
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
        margin-right: 10px;
        text-transform: capitalize;
    }
}

.no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: #666;
}
</style>
