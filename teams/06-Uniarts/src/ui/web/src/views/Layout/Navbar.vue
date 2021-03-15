<template>
    <nav>
        <div class="container">
            <div class="logo" @click="goHome">Uniarts</div>
            <ul class="link-group">
                <li>
                    <router-link to="/" :class="{ active: activeTab == 'Home' }"
                        >Homepage</router-link
                    >
                </li>
                <li>
                    <router-link
                        to="/market"
                        :class="{ active: activeTab == 'Market' }"
                        >Market</router-link
                    >
                </li>
                <li>
                    <router-link
                        to="/artist"
                        :class="{ active: activeTab == 'Artist' }"
                        >Artist</router-link
                    >
                </li>
                <li>
                    <router-link
                        to="/authority"
                        :class="{ active: activeTab == 'Authority' }"
                        >Authority</router-link
                    >
                </li>
                <li class="li-search">
                    <router-link to="/market" class="market">
                        <img src="@/assets/images/search@2x.png" />
                    </router-link>
                </li>
                <li v-if="user.token">
                    <router-link
                        to="/account"
                        class="info"
                        :class="{ active: activeTab == 'Account' }"
                    >
                        <img
                            v-if="user.avatar && user.avatar.url"
                            :src="user.avatar ? user.avatar.url : ''"
                            style="
                                width: 24px;
                                height: 24px;
                                border-radius: 50%;
                            "
                        />
                        <img
                            v-else
                            src="@/assets/images/yin@2x.png"
                            style="
                                width: 24px;
                                height: 24px;
                                border: 1px solid black;
                                border-radius: 50%;
                            "
                        />
                    </router-link>
                </li>
                <li class="li-login" v-if="!user.token">
                    <router-link to="/login" class="login">
                        <img src="@/assets/images/profile@2x.png" />
                    </router-link>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script>
export default {
    name: "navbar",
    computed: {
        user() {
            return this.$store.state.user.info;
        },
        activeTab() {
            let routeName = "";
            switch (this.$route.name) {
                case "Home":
                    routeName = "Home";
                    break;
                case "Market":
                    routeName = "Market";
                    break;
                case "Authority":
                    routeName = "Authority";
                    break;
                case "ArtDetail":
                    routeName = "Art";
                    break;
                case "ArtistDetail":
                case "Artist":
                    routeName = "Artist";
                    break;
                case "AccountUpload":
                case "AccountProfile":
                case "AccountPurchase":
                case "AccountSold":
                case "Account":
                    routeName = "Account";
                    break;
            }

            return routeName;
        },
    },
    methods: {
        goHome() {
            if (this.$route.path !== "/") {
                this.$router.push("/");
            }
        },
    },
};
</script>

<style lang="scss" scoped>
nav {
    min-height: 91px;
}
.logo {
    font-family: "Broadway";
    font-size: 34px;
    font-weight: 400;
    cursor: pointer;
}

.container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 33px;
    padding-bottom: 33px;
    height: 91px;
}

ul {
    display: flex;
    align-items: center;
    justify-content: space-between;
    li {
        padding-left: 18px;
        padding-right: 18px;
        font-size: 16px;
        .active {
            font-weight: 600;
            color: black;
        }
        > a {
            color: #4d4d4d;
            display: block;
            min-width: 70px;
        }
        > a.info,
        > a.market {
            width: 24px;
            height: 24px;
        }
    }
    li:last-child {
        padding-right: 0px;
    }
}

.login,
.market,
.register {
    display: block;
    color: white;
    /* background-color: #c61e1e; */
    /* border: 1px solid rgba(194, 96, 96, 0.537); */
    height: 22px;
    cursor: pointer;
    font-size: 0.875rem;
    box-shadow: 0 0 10px 0px rgba(194, 96, 96, 0.07);
    border-radius: 15px;
    text-transform: uppercase;
    img {
        height: 22px;
    }
}

.register {
    /* background-color: #c61e1e; */
    color: white;
}
.li-search {
    width: 68px;
    height: 21px;
    .market > img {
        width: 21px;
        height: 21px;
    }
}
.li-login,
.li-search {
    padding-right: 10px;
}
.li-register {
    padding-left: 10px;
}
.li-info .info {
    width: 24px;
    height: 24px;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 1px solid rgba(194, 96, 96, 0.537);
    border-radius: 15px;
    color: #c61e1e;
    padding: 4px 10px;
    transition: all 0.3s ease;
}
.li-info .info:hover {
    border-color: #c61e1e;
}
</style>
