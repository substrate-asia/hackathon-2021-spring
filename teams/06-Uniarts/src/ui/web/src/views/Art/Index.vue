<template>
    <div class="art">
        <div class="container">
            <div class="art-info" v-loading="isLoading">
                <div
                    class="img-container"
                    @click="enterPreview(art.img_main_file1)"
                >
                    <AdaptiveImage
                        :isResponsive="false"
                        :isPlay="true"
                        :url="art.img_main_file1 ? art.img_main_file1.url : ''"
                    />
                    <div class="auction-label" v-if="isStarted">IN AUCTION</div>
                    <div class="auction-date" v-if="isStarted || isWaiting">
                        <div class="auction-data-pick">
                            {{
                                isWaiting
                                    ? "Start after"
                                    : isStarted
                                    ? "End after"
                                    : ""
                            }}
                            <span>{{ countdown }}</span>
                        </div>
                        <span
                            >Bidding notice
                            <img src="@/assets/images/auciton_notice@2x.png"
                        /></span>
                    </div>
                </div>
                <div class="info">
                    <div class="title">{{ art.name }}</div>
                    <div class="price">{{ art.price }} UART</div>
                    <p class="intro">
                        {{ getMaterial(art.material_id).title }}，{{
                            art.size_width
                        }}
                        x {{ art.size_length }}
                    </p>
                    <div class="block-title" style="min-height: 37px">
                        BLOCK INFORMATION
                    </div>
                    <div class="address" style="min-height: 28px">
                        Certificate Address:
                        <span
                            class="address-value"
                            @click="
                                showCertificate(
                                    art.collection_id,
                                    art.item_id,
                                    art.item_hash
                                )
                            "
                            >{{ art.item_hash }}</span
                        >
                        <el-tooltip
                            effect="dark"
                            :content="!copyStatus ? 'Copy' : 'Copied'"
                            placement="top"
                        >
                            <i
                                class="copy"
                                @mouseleave="copyLeave"
                                @click="copy(art.item_hash)"
                            ></i>
                        </el-tooltip>
                        <el-tooltip
                            popper-class="qrcode-tooltip"
                            effect="light"
                            placement="bottom"
                        >
                            <div slot="content">
                                <Qrcode
                                    style="border: none"
                                    :scale="5"
                                    :data="art.item_hash ? art.item_hash : ''"
                                    :typeNumber="8"
                                ></Qrcode>
                            </div>
                            <i class="qr"></i>
                        </el-tooltip>
                    </div>
                    <div class="signature" style="min-height: 28px">
                        Number of signatures : {{ signatureList.length }}
                    </div>
                    <div class="function">
                        <div class="action-item">
                            <img
                                src="@/assets/images/zan@2x.png"
                                v-if="!art.liked_by_me"
                                @click="artLike(true)"
                            />
                            <img
                                src="@/assets/images/zan1@2x.png"
                                @click="artLike(false)"
                                v-else
                            />
                            <span class="action-text">{{
                                art.liked_count
                            }}</span>
                        </div>
                        <div class="action-item">
                            <img
                                @click="artDislike(true)"
                                src="@/assets/images/cai@2x.png"
                                v-if="!art.disliked_by_me"
                            />
                            <img
                                @click="artDislike(false)"
                                src="@/assets/images/cai1@2x.png"
                                v-else
                            />
                            <span class="action-text">{{
                                art.dislike_count
                            }}</span>
                        </div>
                        <div class="action-item">
                            <img
                                @click="artFavorite(true)"
                                src="@/assets/images/shoucang@2x.png"
                                v-if="!art.favorite_by_me"
                            />
                            <img
                                @click="artFavorite(false)"
                                src="@/assets/images/shoucang1@2x.png"
                                v-else
                            />
                            <span class="action-text">{{
                                art.favorite_count
                            }}</span>
                        </div>
                        <div class="action-item">
                            <img
                                @click="shareLink"
                                src="@/assets/images/share@2x.png"
                            />
                            <span class="action-text">Share</span>
                        </div>
                    </div>
                    <div class="button-group">
                        <button
                            :disabled="isOffline || isAuction"
                            v-if="isOwner"
                            class="buy"
                            @click="confirm"
                        >
                            {{ isOwnerOrder ? "CANCEL NOW" : "SELL NOW" }}
                        </button>
                        <button
                            v-if="!isOwner"
                            :disabled="isOffline || isAuction || !isOnSale"
                            class="buy"
                            @click="confirm"
                        >
                            BUY NOW
                        </button>
                        <button
                            :disabled="
                                isOffline ||
                                isOnSale ||
                                !isStarted ||
                                isFinished
                            "
                            v-if="!isOwner && isAuction"
                            class="auction"
                            @click="createAuction()"
                        >
                            BID NOW
                        </button>
                        <button
                            :disabled="isOffline || isOnSale"
                            v-if="isOwner && !isAuction"
                            class="auction"
                            @click="createAuction()"
                        >
                            CREATE AUCTION
                        </button>
                        <button
                            :disabled="isOffline || isOnSale || isFollowed"
                            v-if="isOwner && !isFinished && isAuction"
                            class="auction"
                            @click="cancelAuction()"
                        >
                            CANCEL AUCTION
                        </button>
                        <button
                            :disabled="isOffline || isOnSale"
                            v-if="isOwner && isFinished && isAuction"
                            class="auction"
                            @click="cancelAuction()"
                        >
                            FINISH AUCTION
                        </button>
                    </div>
                </div>
            </div>
            <div class="transaction-info" v-if="transactionList.length > 0">
                <div class="title">Transaction records</div>
                <div class="transaction-body">
                    <div class="recent-bid">
                        <div class="bid-title">Recent bid records</div>
                        <div class="ul">
                            <li v-for="(v, i) in transactionList" :key="i">
                                <span
                                    style="
                                        display: inline-block;
                                        width: 270px;
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                    "
                                    >{{ v.buyer }}</span
                                >
                                bought it for {{ v.price | priceFormat }} UART,
                                {{ v.sign_timestamp | dateFormat }}
                            </li>
                        </div>
                    </div>
                    <div class="recent-price">
                        <div class="bid-title">
                            Price trend of recent five transactions
                        </div>
                        <div class="chart">
                            <Chart :list="transactionList"></Chart>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bid-history" v-if="isAuction">
                <div class="title">Bid History</div>
                <div class="content">
                    <div class="table">
                        <div class="no-data" v-if="auctionList.length == 0">
                            No Auction Data
                        </div>
                        <div class="tr" v-for="(v, i) in auctionList" :key="i">
                            <div class="td date">
                                {{ formatBlockNumber(v.bid_time) | dateFormat }}

                                <icon-svg
                                    v-if="i == 0"
                                    class="new-bid-label"
                                    icon-class="new"
                                ></icon-svg>
                            </div>
                            <div class="td price">
                                Lead {{ v.bid_price | priceFormat }}
                                {{ $store.state.global.chain.tokenSymbol }}
                            </div>
                            <div class="td address">
                                {{ v.bidder }}
                            </div>
                        </div>
                    </div>
                    <div class="bid-info">
                        <div class="item">
                            <span class="label">Starting Price</span>
                            <span class="value"
                                >{{ auctionInfo.current_price | priceFormat }}
                                {{
                                    $store.state.global.chain.tokenSymbol
                                }}</span
                            >
                        </div>
                        <div class="item">
                            <span class="label">Price Increase Range</span>
                            <span class="value"
                                >{{ auctionInfo.increment | priceFormat }}
                                {{
                                    $store.state.global.chain.tokenSymbol
                                }}</span
                            >
                        </div>
                        <div class="item">
                            <span class="label">Start Time</span>
                            <span class="value">{{
                                formatBlockNumber(auctionInfo.start_time)
                                    | dateFormat
                            }}</span>
                        </div>
                        <div class="item">
                            <span class="label">End Time</span>
                            <span class="value">{{
                                formatBlockNumber(auctionInfo.end_time)
                                    | dateFormat
                            }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="signature-info" v-if="signatureList.length > 0">
                <div class="title">SIGNING RECORDS</div>
                <div class="signature-body">
                    <div class="recent-signature">
                        <div class="ul">
                            <li v-for="(v, i) in signatureList" :key="i">
                                <div class="header">
                                    <div class="org-img"></div>
                                    <div class="org-name">
                                        {{ hexTostring(v.names) }}
                                    </div>
                                    <div class="timestamp">
                                        {{ v.sign_timestamp | dateFormat }}
                                    </div>
                                </div>
                                <div class="address">{{ v.names }}</div>
                            </li>
                        </div>
                    </div>
                </div>
            </div>
            <div class="author-info">
                <div class="title">About the author</div>
                <div class="author">
                    <div class="author-container">
                        <AdaptiveImage
                            :url="
                                author.avatar && author.avatar.url
                                    ? author.avatar.url
                                    : yin_2x
                            "
                        ></AdaptiveImage>
                        <img src="@/assets/images/yin@2x.png" />
                    </div>
                    <div class="name">
                        {{
                            author.display_name
                                ? author.display_name
                                : "Anonymous"
                        }}
                    </div>
                </div>
                <div class="author-intro-info">
                    <RowText
                        class="author-intro"
                        :textLength="60"
                        :text="author.desc"
                    />
                    <router-link
                        class="go-detail"
                        :to="`/artist-detail/${author.id}`"
                        >Go to the creator's home page<i class="arrow"></i
                    ></router-link>
                </div>
            </div>
            <div class="infomation">
                <div class="title">Art information</div>
                <div class="information-body">
                    <div class="img-container">
                        <div class="img-content">
                            <AdaptiveImage
                                :url="
                                    art.img_main_file1
                                        ? art.img_main_file1.url
                                        : ''
                                "
                                alt=""
                            />
                        </div>
                    </div>
                    <div class="art-information">
                        <div class="title">{{ art.name }}</div>
                        <div class="size">
                            Size：{{ art.size_width }} x {{ art.size_length }}cm
                        </div>
                        <div class="quality">
                            Material quality：{{
                                getMaterial(art.material_id).title
                            }}
                        </div>
                        <div class="type">
                            Type of work：Digital oil painting
                        </div>
                        <div class="date">
                            Creation time：{{ art.created_at | dateFormat }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="comments">
                <div class="title">Comments on works</div>
                <div class="comment-content">
                    {{ art.details }}
                </div>
            </div>
            <div class="details">
                <div class="title">Artwork Details</div>
                <div class="comment-content">
                    <div class="item" v-if="art.img_detail_file1.url">
                        <div
                            class="img-content"
                            @click="enterPreview(art.img_detail_file1)"
                        >
                            <AdaptiveImage
                                :isOrigin="true"
                                :url="
                                    art.img_detail_file1
                                        ? art.img_detail_file1.url
                                        : ''
                                "
                            ></AdaptiveImage>
                        </div>
                        <div class="img-desc">
                            {{ art.img_detail_file1_desc }}
                        </div>
                        <img
                            src="@/assets/images/xiangqing1@2x.png"
                            style="bottom: -10px; right: 0"
                            class="xq"
                        />
                    </div>
                    <div class="item" v-if="art.img_detail_file2.url">
                        <div class="img-desc">
                            {{ art.img_detail_file2_desc }}
                        </div>
                        <div
                            class="img-content"
                            @click="enterPreview(art.img_detail_file2)"
                        >
                            <AdaptiveImage
                                :isOrigin="true"
                                :url="
                                    art.img_detail_file2
                                        ? art.img_detail_file2.url
                                        : ''
                                "
                            ></AdaptiveImage>
                        </div>
                        <img
                            src="@/assets/images/xiangqing2@2x.png"
                            style="bottom: -10px; left: 50px"
                            class="xq"
                        />
                    </div>
                    <div class="item" v-if="art.img_detail_file3.url">
                        <div
                            class="img-content"
                            @click="enterPreview(art.img_detail_file3)"
                        >
                            <AdaptiveImage
                                :isOrigin="true"
                                :url="
                                    art.img_detail_file3
                                        ? art.img_detail_file3.url
                                        : ''
                                "
                            ></AdaptiveImage>
                        </div>
                        <div class="img-desc">
                            {{ art.img_detail_file3_desc }}
                        </div>
                        <img
                            src="@/assets/images/xiangqing1@2x.png"
                            style="bottom: -10px; right: 0"
                            class="xq"
                        />
                    </div>
                    <div class="item" v-if="art.img_detail_file4.url">
                        <div class="img-desc">
                            {{ art.img_detail_file4_desc }}
                        </div>
                        <div
                            class="img-content"
                            @click="enterPreview(art.img_detail_file4)"
                        >
                            <AdaptiveImage
                                :isOrigin="true"
                                :url="
                                    art.img_detail_file4
                                        ? art.img_detail_file4.url
                                        : ''
                                "
                            ></AdaptiveImage>
                        </div>
                        <img
                            src="@/assets/images/xiangqing2@2x.png"
                            style="bottom: -10px; left: 50px"
                            class="xq"
                        />
                    </div>
                    <div
                        class="item"
                        v-if="art.img_detail_file5.url"
                        @click="enterPreview(art.img_detail_file5)"
                    >
                        <div class="img-content">
                            <AdaptiveImage
                                :isOrigin="true"
                                :url="
                                    art.img_detail_file5
                                        ? art.img_detail_file5.url
                                        : ''
                                "
                            ></AdaptiveImage>
                        </div>
                        <div class="img-desc">
                            {{ art.img_detail_file5_desc }}
                        </div>
                        <img
                            src="@/assets/images/xiangqing1@2x.png"
                            style="bottom: -10px; right: 0"
                            class="xq"
                        />
                    </div>
                </div>
            </div>
            <Similar
                v-if="similarList.length > 0"
                v-loading="isSmilarLoading"
                :list="similarList"
            />
        </div>
        <Dialog
            :visible.sync="isDialogPreview"
            type="fullscreen"
            :close="handlePreviewClose"
        >
            <div class="dialog-content preview">
                <AdaptiveImage
                    width="100%"
                    height="100%"
                    :isPlay="true"
                    :isResponsive="false"
                    :isOrigin="true"
                    :url="dialogPreviewUrl"
                />
            </div>
        </Dialog>
        <Dialog
            :visible.sync="dialogVisible"
            :type="dialogType"
            :close="handleClose"
            @closed="handleClosed"
        >
            <div class="dialog-content" v-if="dialogAuctionVisible">
                <Auction
                    @finishAuction="finishAuction"
                    @cancelAuction="finishAuction"
                    :isFinished="isFinished"
                    :isStarted="isStarted"
                    :isWaiting="isWaiting"
                />
            </div>
            <div class="dialog-content" v-else-if="isOwnerOrder">
                <div class="title">FIRM CANCEL</div>
                <div class="price">
                    Current Price:
                    <span class="number">{{ art.price }} UART</span>
                </div>
                <button
                    @click="cancelOrder"
                    v-loading="isSubmiting"
                    element-loading-spinner="el-icon-loading"
                    element-loading-background="rgba(0, 0, 0, 0.8)"
                >
                    CANCEL NOW
                </button>
            </div>
            <div class="dialog-content" v-else-if="isOwner">
                <div class="title">FIRM SELL</div>
                <div class="price">
                    Current Price:
                    <span class="number">{{ art.price }} UART</span>
                </div>
                <div class="desc">
                    <p>Please enter the selling price</p>
                </div>
                <div class="input-body">
                    <input type="number" v-model="form.price" />
                    <span class="code">UART</span>
                </div>
                <div class="note" style="min-height: 56px"></div>
                <button
                    @click="submitSell"
                    v-loading="isSubmiting"
                    element-loading-spinner="el-icon-loading"
                    element-loading-background="rgba(0, 0, 0, 0.8)"
                >
                    SELL NOW
                </button>
            </div>
            <div class="dialog-content" v-else>
                <div class="title">FIRM BUY</div>
                <div class="price">
                    Current Price:
                    <span class="number">{{ art.price }} UART</span>
                </div>
                <button
                    @click="submitBuy"
                    v-loading="isSubmiting"
                    element-loading-spinner="el-icon-loading"
                    element-loading-background="rgba(0, 0, 0, 0.8)"
                >
                    BUY NOW
                </button>
            </div>
        </Dialog>
        <Dialog :visible.sync="dialogShareVisible" type="medium">
            <div class="dialog-content">
                <ShareDialog
                    :url="shareUrl"
                    :art="shareArt"
                    :content="shareContent"
                    type="art"
                />
            </div>
        </Dialog>
    </div>
</template>
<script>
import yin_2x from "@/assets/images/yin@2x.png";
import Dialog from "@/components/Dialog/Dialog";
import AdaptiveImage from "@/components/AdaptiveImage";
import RowText from "@/components/RowText";
import Qrcode from "@/components/Qrcode";
import { BigNumber } from "bignumber.js";
import { Tooltip } from "element-ui";
import { hexToString } from "@polkadot/util";
import { ComputeBlockTimestamp } from "@/utils";
import Auction from "./Auction";
import Chart from "./Chart";
import Similar from "./Similar";
import ShareDialog from "@/components/ShareDialog";

export default {
    name: "art",
    components: {
        Dialog,
        AdaptiveImage,
        [Tooltip.name]: Tooltip,
        Qrcode,
        Chart,
        RowText,
        Auction,
        Similar,
        ShareDialog,
    },
    data() {
        return {
            isLoading: false,
            dialogVisible: false,
            isDialogPreview: false,
            dialogPreviewUrl: "",
            isSubmiting: false,
            dialogAuctionVisible: false,
            dialogShareVisible: false,
            isSmilarLoading: false,
            member: {},
            author: {},
            countdown: "",
            currentArtId: this.$route.params.id,
            copyStatus: false,
            timeWorkId: "",
            similarList: [],
            form: {
                price: "",
            },
            yin_2x,

            subAuctionInfo: "",
            subAuctionList: "",
            subSaleOrderList: "",

            shareUrl: "",
            shareArt: "",
            shareContent: "",
        };
    },
    watch: {
        "$route.params.id"(value) {
            this.currentArtId = value;
            this.requestData();
        },
        isSending(value) {
            if (!value) this.subInfo();
        },
        auctionInfo(value) {
            if (value) {
                this.initTimeWork(value);
            }
        },
    },
    created() {
        // if (!this.$store.state.user.info.address) {
        //     this.$router.push("/login");
        // }
        this.requestData();
    },
    beforeDestroy() {
        this.$store.dispatch("art/ResetSubQueue");
        this.$store.dispatch("art/SetArtInfo", {
            img_detail_file1: {},
            img_detail_file2: {},
            img_detail_file3: {},
            img_detail_file4: {},
            img_detail_file5: {},
        });
        clearInterval(this.timeWorkId);
    },
    computed: {
        art() {
            return this.$store.state.art.art;
        },
        isOffline() {
            return !this.art.item_id;
        },
        isOnSale() {
            return (
                this.$store.getters["art/artStatus"] ==
                this.$store.state.art.ART_ON_SALE
            );
        },
        isSending() {
            return this.$store.state.art.isSending;
        },
        isOwner() {
            return this.art.member_id == this.$store.state.user.info.id;
        },
        isOwnerOrder() {
            return (
                this.member.address == this.$store.state.user.info.address &&
                this.$store.getters["art/artStatus"] ==
                    this.$store.state.art.ART_ON_SALE
            );
        },
        isAuction() {
            return (
                this.$store.getters["art/artStatus"] ==
                    this.$store.state.art.ART_ON_AUCTION ||
                this.$store.getters["art/artStatus"] ==
                    this.$store.state.art.ART_WAITING_AUCTION
            );
        },
        dialogType() {
            return this.isDialogPreview
                ? "fullscreen"
                : this.isOwner
                ? this.isAuction
                    ? "small"
                    : this.isOwnerOrder
                    ? "small"
                    : "medium"
                : this.isAuction
                ? "medium"
                : "small";
        },
        isFinished() {
            return (
                this.$store.getters["art/artStatus"] ==
                this.$store.state.art.ART_AUCTIONED
            );
        },
        isStarted() {
            return (
                this.$store.getters["art/artStatus"] ==
                this.$store.state.art.ART_ON_AUCTION
            );
        },
        isWaiting() {
            return (
                this.$store.getters["art/artStatus"] ==
                this.$store.state.art.ART_WAITING_AUCTION
            );
        },
        isFollowed() {
            return this.$store.state.art.auctionList.length > 0;
        },
        auctionInfo() {
            return this.$store.state.art.auctionInfo;
        },
        auctionList() {
            return this.$store.state.art.auctionList;
        },
        transactionList() {
            return this.$store.state.art.transactionList;
        },
        signatureList() {
            return this.$store.state.art.signatureList;
        },
    },
    methods: {
        requestData(isSub = true) {
            this.isLoading = true;
            if (isSub) {
                this.$store.dispatch("art/ResetSubQueue");
                this.$store.dispatch("art/ResetInfo");
                this.$store.dispatch("art/SetArtInfo", {
                    img_detail_file1: {},
                    img_detail_file2: {},
                    img_detail_file3: {},
                    img_detail_file4: {},
                    img_detail_file5: {},
                });
            }
            this.$http
                .globalGetArtById(
                    {},
                    {
                        id: this.currentArtId,
                    }
                )
                .then(async (res) => {
                    this.member = res.member;
                    this.author = res.author;
                    await this.$store.dispatch("art/SetArtInfo", res);
                    if (res.item_id) {
                        isSub ? await this.subInfo() : "";
                    }
                    this.requestSimilarData();
                    this.isLoading = false;
                })
                .catch((err) => {
                    console.log(err);
                    this.$notify.error(err.head ? err.head.msg : err);
                    this.isLoading = false;
                });
        },
        requestSimilarData() {
            if (!this.$store.state.user.info.address) {
                return;
            }
            this.isSmilarLoading = true;
            this.$http
                .userGetArtSimilar({})
                .then((res) => {
                    this.isSmilarLoading = false;
                    this.similarList = res;
                })
                .catch((err) => {
                    console.log(err);
                    this.isSmilarLoading = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        async subInfo() {
            this.requestData(false);
            await this.$store.dispatch("art/GetTransactionList");
            await this.$store.dispatch("art/GetSignatureList");
            await this.$store.dispatch("art/GetAuctionInfo");
            await this.$store.dispatch("art/GetSaleInfo");
        },
        shareLink() {
            this.dialogShareVisible = true;
            this.shareUrl =
                location.protocol +
                "//" +
                location.hostname +
                (location.port ? `:${location.port}` : "") +
                "/art/" +
                this.currentArtId;
            this.shareArt = this.art.name;
            this.shareContent = `Uniarts chain - Art encryption Tour \n\nArt：${this.art.name} \n\nView the homepage：${this.url}
            `;
        },
        isVideo(url) {
            return /\.mp4$/.test(url);
        },
        enterPreview(obj) {
            if (obj) {
                this.dialogPreviewUrl = obj.url;
                this.isDialogPreview = true;
            }
        },
        showCertificate(collection_id, item_id, item_hash) {
            this.$uniCerDialog.show(
                collection_id,
                item_id,
                item_hash,
                this.$store.state.global.chain.blockHeight,
                this.$store.state.global.chain.timestamp
            );
        },
        handlePreviewClose() {
            this.dialogPreviewUrl = "";
            this.isDialogPreview = false;
        },
        handleClose() {
            this.dialogVisible = false;
        },
        handleClosed() {
            this.dialogAuctionVisible = false;
        },
        confirm() {
            this.dialogVisible = true;
        },
        submit() {
            this.dialogVisible = false;
        },
        getMaterial(id) {
            let item = this.$store.state.art.materials.find((v) => v.id == id);
            return item ? item : {};
        },
        hexTostring(hex) {
            return hexToString(hex);
        },
        copyLeave() {
            setTimeout(() => (this.copyStatus = false), 500);
        },
        copy(value) {
            this.copyStatus = true;
            this.$copy(value);
        },
        finishAuction() {
            this.dialogVisible = false;
        },
        formatBlockNumber(blockNumber) {
            let timestamp = ComputeBlockTimestamp(
                blockNumber,
                this.$store.state.global.chain.timestamp,
                this.$store.state.global.chain.blockHeight
            );
            return timestamp;
        },
        createAuction() {
            if (!this.$store.state.user.info.address) {
                this.$router.push("/login");
                return;
            }
            this.dialogVisible = true;
            this.dialogAuctionVisible = true;
        },
        sendAuction() {
            if (!this.$store.state.user.info.address) {
                this.$router.push("/login");
                return;
            }
            this.dialogVisible = true;
            this.dialogAuctionVisible = true;
        },
        cancelAuction() {
            this.dialogVisible = true;
            this.dialogAuctionVisible = true;
        },
        async submitSell() {
            if (!this.$store.state.user.info.address) {
                this.$router.push("/login");
                return;
            }
            if (this.isSubmiting) {
                return;
            }
            if (!this.form.price) return;
            this.isSubmiting = true;

            let extrinsic = this.$rpc.api.tx.nft.createSaleOrder(
                this.art.collection_id,
                this.art.item_id,
                0,
                new BigNumber(10)
                    .pow(this.$store.state.global.chain.tokenDecimals)
                    .times(this.form.price)
                    .toNumber()
            );
            this.$store.dispatch("art/SendExtrinsic", {
                address: this.$store.state.user.info.address,
                extrinsic,
                cb: () => {
                    this.isSubmiting = false;
                    this.$notify.info("Submitted");
                    this.dialogVisible = false;
                },
                done: () => {
                    this.$notify.success("Success");
                },
                err: () => {
                    this.isSubmiting = false;
                    this.$notify.error("Submission Failed");
                },
            });
        },
        async cancelOrder() {
            if (this.isSubmiting) {
                return;
            }
            this.isSubmiting = true;
            let extrinsic = this.$rpc.api.tx.nft.cancelSaleOrder(
                this.art.collection_id,
                this.art.item_id,
                0
            );
            this.$store.dispatch("art/SendExtrinsic", {
                address: this.$store.state.user.info.address,
                extrinsic,
                cb: () => {
                    this.isSubmiting = false;
                    this.$notify.info("Submitted");
                    this.dialogVisible = false;
                },
                done: () => {
                    this.$notify.success("Success");
                },
                err: () => {
                    this.isSubmiting = false;
                    this.$notify.error("Submission Failed");
                },
            });
        },
        async submitBuy() {
            if (!this.$store.state.user.info.address) {
                this.$router.push("/login");
                return;
            }
            if (this.isSubmiting) {
                return;
            }
            console.log("创建买单");
            this.isSubmiting = true;
            let extrinsic = this.$rpc.api.tx.nft.acceptSaleOrder(
                this.art.collection_id,
                this.art.item_id
            );
            this.$store.dispatch("art/SendExtrinsic", {
                address: this.$store.state.user.info.address,
                extrinsic,
                cb: () => {
                    this.isSubmiting = false;
                    this.$notify.info("Submitted");
                    this.dialogVisible = false;
                },
                done: () => {
                    this.$notify.success("Success");
                },
                err: () => {
                    this.isSubmiting = false;
                    this.$notify.error("Submission Failed");
                },
            });
        },
        artLike(flag) {
            if (flag) {
                this.$http
                    .userPostArtLike(
                        {
                            id: this.art.id,
                        },
                        { id: this.art.id }
                    )
                    .then(() => {
                        this.art.liked_by_me = true;
                        this.art.liked_count += 1;
                        if (this.art.disliked_by_me) {
                            this.art.disliked_by_me = false;
                            this.art.dislike_count -= 1;
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        this.$notify.error(err.head ? err.head.msg : err);
                    });
            } else {
                this.$http
                    .userPostArtCancelLike(
                        {
                            id: this.art.id,
                        },
                        { id: this.art.id }
                    )
                    .then(() => {
                        this.art.liked_by_me = false;
                        this.art.liked_count -= 1;
                    })
                    .catch((err) => {
                        console.log(err);
                        this.$notify.error(err.head ? err.head.msg : err);
                    });
            }
        },
        artDislike(flag) {
            if (flag) {
                this.$http
                    .userPostArtDislike(
                        {
                            id: this.art.id,
                        },
                        { id: this.art.id }
                    )
                    .then(() => {
                        this.art.disliked_by_me = true;
                        this.art.dislike_count += 1;
                        if (this.art.liked_by_me) {
                            this.art.liked_by_me = false;
                            this.art.liked_count -= 1;
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        this.$notify.error(err.head ? err.head.msg : err);
                    });
            } else {
                this.$http
                    .userPostArtCancelDislike(
                        {
                            id: this.art.id,
                        },
                        { id: this.art.id }
                    )
                    .then(() => {
                        this.art.disliked_by_me = false;
                        this.art.dislike_count -= 1;
                    })
                    .catch((err) => {
                        console.log(err);
                        this.$notify.error(err.head ? err.head.msg : err);
                    });
            }
        },
        artFavorite(flag) {
            if (flag) {
                this.$http
                    .userPostArtFavorite(
                        {
                            id: this.art.id,
                        },
                        { id: this.art.id }
                    )
                    .then(() => {
                        this.art.favorite_by_me = true;
                        this.art.favorite_count += 1;
                    })
                    .catch((err) => {
                        console.log(err);
                        this.$notify.error(err.head ? err.head.msg : err);
                    });
            } else {
                this.$http
                    .userPostArtCancelFavorite(
                        {
                            id: this.art.id,
                        },
                        { id: this.art.id }
                    )
                    .then(() => {
                        this.art.favorite_by_me = false;
                        this.art.favorite_count -= 1;
                    })
                    .catch((err) => {
                        console.log(err);
                        this.$notify.error(err.head ? err.head.msg : err);
                    });
            }
        },
        countdownFormat(time) {
            time = parseInt(time) * 1000;
            let jetLag = Math.abs(new Date().getTime() - time) / 1000;
            let second = parseInt(jetLag % 60),
                minute = parseInt((jetLag / 60) % 60),
                hour = parseInt((jetLag / 3600) % 24),
                day = parseInt(jetLag / 3600 / 24);
            if (second == 0 && minute == 0 && hour == 0 && day == 0) {
                return -1;
            } else {
                return `${day}d : ${hour < 10 ? "0" + hour : hour}h : ${
                    minute < 10 ? "0" + minute : minute
                }m : ${second < 10 ? "0" + second : second}s`;
            }
        },
        initTimeWork(item) {
            let timeWorkId = "";
            let curTime = new Date().getTime() / 1000;
            let time = "";
            if (curTime < this.formatBlockNumber(item.start_time)) {
                time = this.formatBlockNumber(item.start_time);
                timeWorkId = setInterval(() => {
                    let result = this.countdownFormat(time);
                    if (result == -1) {
                        this.resetTimeWork(item);
                    } else {
                        this.countdown = result;
                    }
                }, 1000);
                this.timeWorkId = timeWorkId;
            } else if (
                curTime >= this.formatBlockNumber(item.start_time) &&
                curTime <= this.formatBlockNumber(item.end_time)
            ) {
                time = this.formatBlockNumber(item.end_time);
                timeWorkId = setInterval(() => {
                    let result = this.countdownFormat(time);
                    if (result == -1) {
                        this.resetTimeWork(item);
                    } else {
                        this.countdown = result;
                    }
                }, 1000);
                this.timeWorkId = timeWorkId;
            }
        },
        resetTimeWork(item) {
            clearInterval(this.timeWorkId);
            this.timeWorkId = "";
            this.initTimeWork(item);
        },
    },
};
</script>

<style lang="scss" scoped>
.art {
    padding-top: 80px;
}

.art-info {
    overflow: hidden;
    width: 100%;

    .img-container {
        float: left;
        width: 620px;
        height: 580px;
        margin-right: 25px;
        overflow: hidden;
        cursor: pointer;
        position: relative;

        .auction-label {
            position: absolute;
            top: 34px;
            left: 0;
            padding: 5px 16px;
            background-color: #f9b43b;
            font-size: 20px;
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
            font-weight: 600;
            text-align: left;
            color: #ffffff;
            letter-spacing: 0px;
        }

        .auction-date {
            width: 100%;
            height: 50px;
            position: absolute;
            background-color: rgba(134, 29, 57, 0.8);
            bottom: 0;
            left: 0;
            font-size: 18px;
            font-weight: 400;
            text-align: left;
            color: #ffffff;
            padding: 5px 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            letter-spacing: 0px;
            span {
                display: flex;
                align-items: center;
            }
            img {
                width: 17px;
                margin-left: 5px;
            }
            .auction-data-pick {
                display: flex;
                align-items: center;
                span {
                    margin-left: 10px;
                    font-weight: 600;
                }
            }
        }
    }
}
.info {
    float: left;
    width: calc(100% - 620px - 50px);
    margin-left: 25px;
    text-align: left;
    margin-bottom: 151px;
    .title {
        font-size: 48px;
        font-family: "Broadway";
        font-weight: 400;
        line-height: 48px;
        text-align: left;
        letter-spacing: 0px;
        margin-bottom: 35px;
    }

    .price {
        font-size: 24px;
        font-weight: 600;
        text-align: left;
        letter-spacing: 0px;
        margin-bottom: 17px;
    }

    .intro {
        font-size: 20px;
        font-weight: 400;
        text-align: left;
        letter-spacing: 0px;
        margin-bottom: 85px;
    }

    .block-title {
        font-size: 26px;
        font-weight: 600;
        text-align: left;
        letter-spacing: 0px;
        margin-bottom: 34px;
    }

    .address {
        font-size: 20px;
        font-weight: 400;
        text-align: left;
        letter-spacing: 0px;
        margin-bottom: 21px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 55px;
        position: relative;
        .address-value {
            cursor: pointer;
        }
        .address-value:hover {
            text-decoration: underline;
        }
        i.copy {
            position: absolute;
            top: 3px;
            right: 35px;
            display: inline-block;
            width: 19px;
            height: 19px;
            background: url("~@/assets/images/fuzhi@2x.png") no-repeat;
            background-size: 100%;
            cursor: pointer;
        }
        i.qr {
            right: 0px;
            top: 3px;
            position: absolute;
            display: inline-block;
            width: 19px;
            height: 19px;
            background: url("~@/assets/images/ma@2x.png") no-repeat;
            background-size: 100%;
            cursor: pointer;
        }
    }

    .signature {
        font-size: 20px;
        font-weight: 400;
        text-align: left;
        letter-spacing: 0px;
        margin-bottom: 51px;
    }

    .function {
        display: flex;
        align-items: center;
        margin-bottom: 35px;
        .action-item {
            margin-right: 35px;
            display: flex;
            align-items: center;
            > img {
                width: 20px;
                margin-right: 10px;
                cursor: pointer;
            }
            .action-text {
                font-size: 17px;
            }
        }
    }

    .button-group {
        display: flex;
        justify-content: space-between;

        .buy,
        .auction {
            cursor: pointer;
            border: 3px solid #020202;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            color: #020202;
            letter-spacing: 0px;
            padding: 17px 0px;
            width: 260px;
            background: transparent;
        }
        .buy {
            margin-right: 30px;
        }
        button.buy:disabled,
        button.auction:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }
    }
}

.author-info,
.infomation,
.comments,
.details,
.transaction-info,
.signature-info,
.bid-history {
    margin-bottom: 180px;
    > .title {
        font-size: 48px;
        font-family: "Broadway";
        font-weight: 400;
        text-align: left;
        letter-spacing: 0px;
        margin-bottom: 110px;
    }
}

.author-info {
    overflow: hidden;
    .author {
        float: left;
        width: 500px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-right: 1px solid #020202;
        .author-container {
            width: 103px;
            height: 103px;
            overflow: hidden;
            position: relative;
            border-radius: 50%;
            border: 3px solid #020202;
            margin-bottom: 26px;
        }
        .author-container.empty {
            border-color: transparent;
        }
        .name {
            font-size: 26px;
            max-width: 300px;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: center;
            letter-spacing: 0px;
        }
    }
    .author-intro-info {
        float: left;
        width: calc(100% - 501px);
        padding-left: 103px;
        height: 166px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .author-intro {
            font-size: 24px;
            font-weight: 400;
            text-align: left;
            line-height: 36px;
            letter-spacing: 1px;
            margin-bottom: 30px;
            max-width: 480px;
            text-transform: uppercase;
        }
        .go-detail {
            font-size: 24px;
            font-weight: 600;
            text-align: left;
            color: #5d96ff;
            letter-spacing: 0px;
            text-transform: uppercase;
            min-width: 480px;
            i.arrow {
                margin-left: 15px;
                width: 24px;
                height: 17px;
                display: inline-block;
                background: url("~@/assets/images/jiantou@2x.png") no-repeat;
                background-size: 100% auto;
            }
        }
    }
}

.infomation {
    .information-body {
        display: flex;
        justify-content: center;
        .img-container {
            margin-right: 100px;
            width: 320px;
            height: 320px;
            background: url("~@/assets/images/xiangkuang@2x.png") no-repeat;
            background-size: 100% auto;
            padding-top: 40px;
            padding-left: 40px;
            .img-content {
                position: relative;
                overflow: hidden;
                height: 210px;
                width: 208px;
            }
            img {
                height: 100%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translateX(-50%) translateY(-50%);
            }
        }

        .art-information {
            .title {
                font-size: 30px;
                font-weight: 600;
                text-align: left;
                color: #020202;
                letter-spacing: 0px;
                margin-bottom: 44px;
            }
            .quality,
            .size,
            .type,
            .date {
                font-size: 22px;
                font-weight: 400;
                text-align: left;
                letter-spacing: 0px;
                margin-bottom: 24px;
            }
        }
    }
}

.comments {
    .comment-content {
        font-size: 23px;
        font-weight: 400;
        text-align: left;
        line-height: 36px;
        letter-spacing: 1px;
    }
}

.details {
    .comment-content {
        min-height: 100px;
    }
    .img-content {
        width: 456px;
        height: 456px;
        cursor: pointer;
    }
    .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 130px;
        position: relative;
        margin-bottom: 120px;
        padding: 0 70px;
    }
    .img-desc {
        max-width: 489px;
        font-size: 24px;
        font-weight: 400;
        text-align: left;
        color: #020202;
        line-height: 36px;
        letter-spacing: 1px;
    }
    .xq {
        position: absolute;
        height: 230px;
        z-index: -1;
    }
}

.transaction-info {
    margin-bottom: 100px;
    .title {
        margin-bottom: 70px;
    }
    .transaction-body {
        display: flex;
        justify-content: space-between;
        .bid-title {
            font-size: 22px;
            font-weight: 600;
            text-align: left;
            margin-bottom: 39px;
            color: #020202;
        }
        .ul {
            li {
                font-size: 18px;
                font-weight: 400;
                text-align: left;
                margin-bottom: 25px;
                color: #020202;
                display: flex;
            }
        }
    }
}

.signature-info .title {
    margin-bottom: 70px;
}
.signature-info .recent-signature {
    .ul {
        li {
            border-bottom: 1px solid #272727;
            padding: 31px 0;
        }
        .header {
            display: flex;
            align-items: flex-end;
            margin-bottom: 22px;
            .org-img {
                height: 30px;
                width: 39px;
                background: url(~@/assets/images/jianzhu@2x.png) no-repeat;
                background-size: 100% 100%;
                margin-right: 18px;
            }
            .org-name {
                width: calc(100% - 200px);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: 22px;
                font-weight: 600;
                text-align: left;
                color: #020202;
                letter-spacing: 0px;
            }
            .timestamp {
                width: 200px;
                line-height: 30px;
            }
        }
        .address {
            font-size: 20px;
            font-weight: 400;
            text-align: left;
            color: #020202;
            letter-spacing: 0px;
        }
    }
}

.bid-history {
    .content {
        .table {
            display: flex;
            flex-direction: column;
            margin-bottom: 80px;
        }
        .tr {
            width: 100%;
            border-bottom: 1px solid #020202;
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 400;
            text-align: center;
            letter-spacing: 0px;
            padding: 30px 16px;
        }
        .tr:last-child {
            border-bottom: none;
        }
        .address {
            width: 30%;
        }
        .price {
            width: 45%;
        }
        .date {
            width: 25%;
            text-align: left;
            display: flex;
            align-items: center;
        }
        .new-bid-label {
            font-size: 30px;
            margin-left: 5px;
            color: #c61e1e;
        }
        .address {
            max-width: 240px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .bid-info {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            .item {
                background-color: #eee;
                padding: 16px 0px;
                width: 540px;
                font-size: 18px;
                font-weight: 400;
                text-align: center;
                letter-spacing: 0px;
                margin-bottom: 37px;
                overflow: hidden;
                .label {
                    float: left;
                    display: block;
                    width: 60%;
                    text-align: center;
                }
                .value {
                    float: left;
                    display: block;
                    width: 40%;
                    text-align: left;
                }
            }
        }
    }
}
.dialog ::v-deep .el-dialog {
    padding-left: 30px;
    padding-right: 30px;
    padding-bottom: 10px;
}
.dialog-content {
    font-size: 26px;
    text-align: left;
    letter-spacing: 0px;
    text-align: center;
    color: #020202;
    .title {
        font-weight: 600;
        margin-bottom: 30px;
    }
    .price {
        font-size: 20px;
        font-weight: 400;
        min-height: 30px;
        margin-bottom: 25px;
    }
    .number {
        font-size: 24px;
        color: #c61e1e;
    }
    .desc {
        font-size: 20px;
        font-weight: 400;
        margin-bottom: 37px;
        min-height: 30px;
    }
    .input-body {
        position: relative;
        margin-bottom: 37px;
        height: 40px;
        input {
            width: 100%;
            height: 75px;
            font-size: 26px;
            border: 2px solid #020202;
            padding: 14px 34px;
            text-align: center;
        }
        .code {
            font-size: 26px;
            font-weight: 600;
            text-align: left;
            letter-spacing: 0px;
            position: absolute;
            right: 34px;
            top: 19px;
        }
    }
    .note {
        font-size: 20px;
        margin-bottom: 25px;
    }
    > button {
        background: #020202;
        width: 307px;
        height: 75px;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
        color: #ffffff;
        letter-spacing: 0px;
        cursor: pointer;
    }
}

.dialog-content.preview {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 0;
    background-color: black;
    > img {
        max-width: 100%;
        max-height: 100%;
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 0;
        transform: translateX(-50%) translateY(-50%);
    }
}
</style>

<style>
.qrcode-tooltip {
    padding: 2px;
}
</style>
