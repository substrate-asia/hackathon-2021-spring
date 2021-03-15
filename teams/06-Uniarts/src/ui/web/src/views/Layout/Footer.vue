<template>
    <footer>
        <div class="container">
            <div class="bottom-logo">
                <span class="logo">Uniarts</span>
                <span class="desc">@2019-2020 uniarts.me</span>
            </div>
            <div class="bottom-community">
                <div class="text">Community</div>
                <div class="icons">
                    <a
                        href="https://t.me/uniarts"
                        style="margin-left: 0"
                        target="_blank"
                    >
                        <icon-svg icon-class="telegram"></icon-svg>
                    </a>
                    <a
                        href="https://twitter.com/NetworkUniarts"
                        target="_blank"
                    >
                        <icon-svg icon-class="twitter"></icon-svg>
                    </a>
                    <a href="https://discord.gg/ynKCwp5c" target="_blank">
                        <icon-svg icon-class="discord"></icon-svg>
                    </a>
                    <a
                        href="https://medium.com/@UniartsNetwork"
                        target="_blank"
                    >
                        <icon-svg icon-class="medium"></icon-svg>
                    </a>
                    <a href="https://github.com/uni-arts-chain" target="_blank">
                        <icon-svg icon-class="github"></icon-svg>
                    </a>
                </div>
            </div>
            <div class="bottom-nav">
                <ul>
                    <span class="title">For Artists</span>
                    <li><a to="#">Apply as an artist</a></li>
                </ul>
                <ul>
                    <span class="title">Legal</span>
                    <li><a to="#">Terms of Service</a></li>
                    <li><a to="#">Privacy Policy</a></li>
                </ul>
                <ul>
                    <span class="title">Products</span>
                    <li>
                        <a
                            href="http://explorer.uniarts.me/#/explorer"
                            target="_blank"
                            >Chain Explorer</a
                        >
                    </li>
                    <li>
                        <a
                            target="_blank"
                            href="https://telemetry.polkadot.io/#list/Uni-Arts%20Staging%20network"
                            >Chain Network</a
                        >
                    </li>
                </ul>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    name: "footerbar",
};
</script>

<style lang="scss" scoped>
footer {
    background: linear-gradient(#380302 0%, #020202 100%);
}
.container {
    min-height: 283px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
}
.bottom-logo {
    width: 25%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-right: 1px solid white;
    .logo {
        font-family: "Broadway";
        font-size: 33px;
        font-weight: 400;
        margin-bottom: 30px;
    }
    .desc {
        font-size: 17px;
        line-height: 30px;
    }
}
.bottom-community {
    margin-left: 23px;
    .text {
        font-size: 23px;
        text-align: left;
        font-weight: 500;
        margin-bottom: 30px;
    }
    .icons {
        display: flex;
        align-items: center;
        a {
            display: block;
            font-size: 50px;
            margin: 0 7px;
            line-height: 50px;
        }
    }
}
.bottom-nav {
    width: 66%;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    ul {
        overflow: hidden;
        width: 33%;
        display: block;
        text-align: right;
        .title {
            display: inline-block;
            font-size: 18px;
            text-align: right;
            font-weight: 600;
            line-height: 30px;
            padding-bottom: 23px;
            border-bottom: 1px solid #cfb9b9;
            min-width: 137px;
        }
        li {
            display: block;
            margin-top: 23px;
            text-align: right;
            font-size: 14px;
        }
    }
}
</style>
