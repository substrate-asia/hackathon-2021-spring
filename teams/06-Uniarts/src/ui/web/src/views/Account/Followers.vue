<template>
    <div class="followers container">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/account' }"
                >Profile</el-breadcrumb-item
            >
            <el-breadcrumb-item>Followers</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="title">Followers</div>
        <div class="list" v-loading="isLoading">
            <div class="no-data" v-if="list.length == 0">No Artwork</div>
            <div class="profile" v-for="(member, i) in list" :key="i">
                <div class="avatar">
                    <router-link
                        :to="`/artist-detail/${member.id}`"
                        class="avatar-img"
                    >
                        <AdaptiveImage
                            :url="
                                member.avatar.url ? member.avatar.url : yin_2x
                            "
                        />
                    </router-link>
                </div>
                <div class="info">
                    <div class="name">
                        {{ member.display_name }}
                    </div>
                    <div class="works">
                        <i class="zp"></i>
                        <span>{{ member.art_size }} works</span>
                    </div>
                </div>
                <button
                    class="follow-button"
                    v-if="!member.follow_by_me"
                    @click="follow(member)"
                >
                    Follow
                </button>
                <button class="follow-button" v-else @click="unfollow(member)">
                    Unfollow
                </button>
            </div>
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
</template>
<script>
import yin_2x from "@/assets/images/yin@2x.png";
import AdaptiveImage from "@/components/AdaptiveImage";
export default {
    name: "followers",
    components: {
        AdaptiveImage,
    },
    data() {
        return {
            list: [],
            page: 1,
            isLoading: false,
            per_page: 18,
            total_pages: 0,
            total_count: 0,
            yin_2x,
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
                .userGetUserFollowers({
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
        follow(member) {
            if (member.isFollowing) return;
            member.isFollowing = true;
            this.$http
                .userPostArtistFollow({ id: member.id }, { id: member.id })
                .then(() => {
                    member.isFollowing = false;
                    member.follow_by_me = true;
                })
                .catch((err) => {
                    member.isFollowing = false;
                    this.$notify.error(err.head ? err.head.msg : err);
                });
        },
        unfollow(member) {
            if (member.isFollowing) return;
            member.isFollowing = true;
            this.$http
                .userPostArtistUnfollow({ id: member.id }, { id: member.id })
                .then(() => {
                    member.isFollowing = false;
                    member.follow_by_me = false;
                })
                .catch((err) => {
                    member.isFollowing = false;
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
.followers {
    padding: 40px;
    padding-top: 70px;
    padding-left: 0px;
    padding-right: 0px;
    text-align: left;
    > .title {
        font-family: "Broadway";
        font-size: 38px;
        font-weight: 400;
        text-align: left;
        color: #020202;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 73px;
        margin-top: 40px;
    }
}

.profile {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 97px;
    width: 43%;
    .avatar-img {
        width: 95px;
        height: 95px;
        overflow: hidden;
        border: 4px solid #020202;
        border-radius: 50%;
        cursor: pointer;
    }
    .avatar-img.empty {
        border-color: transparent;
    }
}
.avatar {
    display: flex;
    align-items: center;
}
.info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: 32px;
    width: 230px;
    margin-right: 10px;
    height: 82px;
    .name {
        font-size: 22px;
        font-weight: 600;
        letter-spacing: 0px;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .works {
        display: flex;
        align-items: center;
        font-size: 18px;
        font-weight: 400;
        text-align: left;
        letter-spacing: 0px;
        .zp {
            margin-right: 12px;
            display: block;
            width: 27px;
            height: 25px;
            background: url("~@/assets/images/zuopin@2x.png") no-repeat;
            background-size: 100% auto;
        }
    }
}
.follow-button {
    font-size: 16px;
    font-weight: 400;
    text-align: center;
    color: #020202;
    line-height: 21px;
    letter-spacing: 0px;
    width: 133px;
    height: 47px;
    cursor: pointer;
    border: 2px solid #020202;
    background-color: transparent;
}
.list {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}
.no-data {
    height: 150px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
