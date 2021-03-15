<template>
    <div class="index container">
        <div class="sign-head">
            <div class="title">Sign your works</div>
            <router-link to="#" class="apply-link">
                APPLY NOW
                <div class="icon"></div>
            </router-link>
        </div>
        <div class="sign-item">
            <div class="title">SIGNED WORKS</div>
            <div class="item-body">
                <div class="thumbnail">
                    <div class="no-data" v-if="list.length == 0">
                        No artworks
                    </div>
                    <div class="item" v-for="(v, i) in list" :key="i">
                        <router-link :to="`/art/${v.id}`" class="img-container">
                            <AdaptiveImage
                                :url="v.img_main_file1.url"
                            ></AdaptiveImage>
                        </router-link>
                        <h5 class="title">{{ v.name }}</h5>
                        <div class="desc">
                            {{ materialType(v.material_id) }}
                        </div>
                        <div class="address-label" v-if="v.member">
                            Certificate Address:
                            <span class="address">{{ v.item_hash }}</span>
                        </div>
                        <div class="address-label">
                            Sign Time: {{ v.last_sign_at | dateFormat }}
                        </div>
                    </div>
                </div>
                <button class="more-button" @click="$router.push('/market')">
                    more works
                    <div class="icon"></div>
                </button>
            </div>
        </div>
        <div class="sign-item">
            <div class="title">ADD SIGNS</div>
            <div class="item-body">
                <Organization :list="organizationList"></Organization>
            </div>
        </div>
    </div>
</template>
<script>
import AdaptiveImage from "@/components/AdaptiveImage";
import Organization from "./Organization";
import { hexToString, isJsonObject } from "@polkadot/util";
export default {
    name: "index",
    components: {
        AdaptiveImage,
        Organization,
    },
    data() {
        return {
            list: [],
            organizationList: [],
        };
    },
    created() {
        this.requestWorkData();
        this.requestOrganizationInfo();
    },
    methods: {
        async requestOrganizationInfo() {
            await this.$rpc.api.isReady;
            let objList = await this.$rpc.api.query.names.names.entries();
            objList.forEach((v) => {
                v[1] = v[1].toJSON();
                let expiration = v[1].expiration;
                let owner = v[1].owner;
                let value = hexToString(v[1].value);
                value = isJsonObject(value) ? JSON.parse(value) : {};
                let hash = v[0].args[0].toString();
                this.organizationList.push({
                    name: hexToString(hash),
                    hash: hash,
                    expiration,
                    owner,
                    value,
                });
            });
        },
        requestWorkData() {
            this.$http.userGetSignedWorks({}).then((res) => {
                this.list = res.list.splice(0, 3);
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
.index {
    padding-top: 40px;
    padding-bottom: 100px;
}
.sign-head {
    height: 340px;
    width: 100%;
    background: url(~@/assets/images/shenqing-bg@2x.png) no-repeat;
    background-size: auto 100%;
    .title {
        padding-top: 62px;
        padding-left: 70px;
        text-transform: uppercase;
        font-size: 46px;
        font-family: "Broadway";
        font-weight: 400;
        text-align: left;
        color: #ffffff;
        letter-spacing: 0px;
    }
    .icon {
        width: 26px;
        height: 20px;
        background: url(~@/assets/images/jiantou-2@2x.png) no-repeat;
        background-size: 100%;
        margin-left: 10px;
    }
    .apply-link {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 70px;
        width: 251px;
        height: 57px;
        max-width: 337px;
        font-size: 22px;
        font-weight: 600;
        text-align: center;
        color: #ffffff;
        letter-spacing: 0px;
        border: 2px solid white;
        margin-top: 80px;
    }
}

.sign-item {
    margin-top: 109px;
    > .title {
        font-family: "Broadway";
        font-size: 38px;
        font-weight: 400;
        text-align: left;
        color: #020202;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 63px;
    }
    .more-button {
        padding: 17px 0px;
        color: black;
        font-size: 25px;
        font-weight: 600;
        background: transparent;
        border: 3px solid black;
        text-transform: uppercase;
        margin: 0 auto;
        margin-top: 63px;
        width: 337px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        .icon {
            width: 26px;
            height: 20px;
            background: url(~@/assets/images/jiantou-1@2x.png) no-repeat;
            background-size: 100%;
            margin-left: 10px;
        }
    }
}

.thumbnail {
    overflow: hidden;
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
        img {
            height: 100%;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translateY(-50%) translateX(-50%);
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
    }

    .price {
        font-size: 22px;
        font-weight: 600;
        text-align: left;
        line-height: 30px;
        letter-spacing: 0px;
        margin-top: 8px;
    }

    .no-data {
        color: #666;
    }
}
</style>
