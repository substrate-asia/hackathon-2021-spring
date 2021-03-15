<template>
    <div class="detail">
        <div class="container">
            <div class="author" v-loading="isInfoLoading">
                <div class="avatar-container">
                    <div class="avatar">
                        <AdaptiveImage
                            :url="getImg(author)"
                            width="236px"
                            height="236px"
                        ></AdaptiveImage>
                    </div>
                </div>
                <div class="info">
                    <h2>
                        {{
                            author.display_name
                                ? author.display_name
                                : author.address || "Anonymous"
                        }}
                    </h2>
                    <RowText
                        class="desc"
                        :textLength="60"
                        :text="author.desc"
                    />
                    <div class="button-group">
                        <button
                            v-loading="isFollowing"
                            class="follow-button"
                            @click="follow"
                            v-if="!author.follow_by_me && !isSelf"
                        >
                            Follow
                        </button>
                        <button
                            v-loading="isFollowing"
                            class="follow-button"
                            @click="unfollow"
                            v-else-if="author.follow_by_me && !isSelf"
                        >
                            Unfollow
                        </button>
                        <div class="share" @click="share">
                            <img src="@/assets/images/share_white@2x.png" />
                            <span class="share">Share</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="content">
                <div class="title">Personal works</div>
                <Thumbnail
                    style="padding-left: 0"
                    :list="list"
                    :isGroup="true"
                    v-loading="isLoading"
                ></Thumbnail>
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
        <Dialog :visible.sync="dialogShareVisible" type="medium">
            <div class="dialog-content">
                <ShareDialog
                    :url="shareUrl"
                    :author="shareAuthor"
                    :content="shareContent"
                    type="artist"
                />
            </div>
        </Dialog>
    </div>
</template>

<script>
import Thumbnail from "@/components/Thumbnail";
import AdaptiveImage from "@/components/AdaptiveImage";
import Dialog from "@/components/Dialog/Dialog";
import ShareDialog from "@/components/ShareDialog";
import RowText from "@/components/RowText";
import avatar from "@/assets/images/yin@2x.png";
export default {
    name: "detail",
    components: {
        Thumbnail,
        AdaptiveImage,
        RowText,
        Dialog,
        ShareDialog,
    },
    data() {
        return {
            optionActive: "1",
            menuActive: "0",
            authorId: this.$route.params.id,
            list: [],
            isLoading: false,
            isInfoLoading: false,
            isFollowing: false,
            author: {},

            dialogShareVisible: false,
            shareUrl: "",
            shareAuthor: "",
            shareContent: "",
            avatar,
        };
    },
    created() {
        this.requestData();
        this.requestArtistData();
    },
    computed: {
        hasPrev() {
            return this.page > 1;
        },
        hasNext() {
            return this.page < this.total_pages;
        },
        isSelf() {
            return this.$store.state.user.info.address == this.author.address;
        },
    },
    methods: {
        requestData() {
            this.isLoading = true;
            this.$http
                .globalGetAuthorArts({}, { id: this.authorId })
                .then((res) => {
                    this.isLoading = false;
                    this.list = res.total_count >= 0 ? res.list : res;
                })
                .catch((err) => {
                    this.isLoading = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        requestArtistData() {
            this.isInfoLoading = true;
            this.$http
                .globalGetMemberInfo({}, { id: this.authorId })
                .then((res) => {
                    this.isInfoLoading = false;
                    this.author = res;
                })
                .catch((err) => {
                    this.isInfoLoading = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        share() {
            this.dialogShareVisible = true;
            this.shareUrl =
                location.protocol +
                "//" +
                location.hostname +
                (location.port ? `:${location.port}` : "") +
                "/artist-detail/" +
                this.authorId;
            this.shareAuthor = this.author.display_name;

            this.shareContent = `Uniarts chain - Art encryption Tour \n\nAuthor：${this.shareAuthor} \n\nView the homepage：${this.shareUrl}
            `;
        },
        follow() {
            if (!this.isLogin()) {
                this.$router.push("/login");
                return;
            }
            if (this.isFollowing) return;
            this.isFollowing = true;
            this.$http
                .userPostArtistFollow(
                    { id: this.authorId },
                    { id: this.authorId }
                )
                .then(() => {
                    this.isFollowing = false;
                    this.author.follow_by_me = true;
                })
                .catch((err) => {
                    this.isFollowing = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        unfollow() {
            if (this.isLogin()) {
                this.$router.push("/login");
                return;
            }
            if (this.isFollowing) return;
            this.isFollowing = true;
            this.$http
                .userPostArtistUnfollow(
                    { id: this.authorId },
                    { id: this.authorId }
                )
                .then(() => {
                    this.isFollowing = false;
                    this.author.follow_by_me = false;
                })
                .catch((err) => {
                    this.isFollowing = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        isLogin() {
            if (this.$store.state.user.info.address) {
                return true;
            } else {
                return false;
            }
        },
        getImg(obj) {
            return obj.avatar && obj.avatar.url ? obj.avatar.url : avatar;
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
.detail {
    padding-top: 80px;
    padding-bottom: 80px;
}
.author {
    height: 469px;
    width: 100%;
    background: url(~@/assets/images/ren-bg2@2x.png) no-repeat;
    background-size: auto 100%;
    margin-bottom: 120px;
    position: relative;
    .avatar-container {
        transform: translateX(185px) translateY(105px);
        width: 262px;
        height: 262px;
        padding: 12px;
        border: 1px solid white;
        border-radius: 50%;
    }
    .avatar {
        width: 236px;
        height: 236px;
        border-radius: 50%;
        overflow: hidden;
    }
    .info {
        position: absolute;
        color: white;
        text-align: left;
        left: 550px;
        top: 120px;
        > h2 {
            font-size: 40px;
            font-family: "Broadway";
            font-weight: 400;
            text-align: left;
            color: #ffffff;
            letter-spacing: 0px;
            margin-bottom: 30px;
            width: 600px;
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .desc {
            font-size: 24px;
            font-weight: 400;
            text-align: left;
            max-width: 400px;
            color: #ffffff;
            letter-spacing: 1px;
            margin-bottom: 40px;
        }
        .button-group {
            display: flex;
            align-items: center;
            justify-content: flex-start;
        }
        .follow-button {
            font-size: 20px;
            font-weight: 500;
            margin-right: 40px;
            text-align: center;
            color: #ffffff;
            border: 1px solid #fff;
            background-color: transparent;
            min-width: 162px;
            min-height: 49px;
            cursor: pointer;
        }
        .follow-button ::v-deep .el-loading-mask {
            background-color: rgba(2, 2, 2, 0.6);
        }
        .follow-button ::v-deep .el-loading-spinner {
            margin-top: -23px;
            .circular .path {
                stroke: white;
            }
        }
        .share {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            cursor: pointer;
            img {
                width: 20px;
                height: 20px;
                margin-right: 15px;
            }
            > span {
                font-size: 20px;
                margin-left: 0;
                font-weight: 400;
                text-align: left;
                color: #ffffff;
            }
        }
    }
}
.content {
    min-height: 400px;
    .title {
        font-size: 48px;
        font-family: "Broadway";
        font-weight: 400;
        line-height: 40px;
        text-align: left;
        letter-spacing: 0px;
        margin-bottom: 103px;
    }
}
.pagenation {
    margin-top: 100px;
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
