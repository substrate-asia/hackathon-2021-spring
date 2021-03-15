const apiList = [
    {
        name: "getBannerList",
        method: "GET",
        desc: "获取Banner",
        path: "/banners",
        mockPath: "/banners",
        params: {},
        options: {
            unSignature: false,
        },
    },
    {
        name: "getArtById",
        method: "GET",
        desc: "获取指定ID作品",
        path: "/arts/{:id}",
        mockPath: "/arts/{:id}",
        params: {},
        options: {
            unSignature: false,
        },
    },
    {
        name: "getCategories",
        method: "GET",
        desc: "获取作品分类",
        path: "/arts/categories",
        mockPath: "/arts/categories",
        params: {},
        options: {
            unSignature: true,
        },
    },
    {
        name: "getThemes",
        method: "GET",
        desc: "获取作品主题",
        path: "/arts/themes",
        mockPath: "/arts/themes",
        params: {},
        options: {
            unSignature: true,
        },
    },
    {
        name: "getMaterials",
        method: "GET",
        desc: "获取作品材质",
        path: "/arts/materials",
        mockPath: "/arts/materials",
        params: {},
        options: {
            unSignature: true,
        },
    },
    {
        name: "getAuthorArts",
        method: "GET",
        desc: "获取作品材质",
        path: "/members/{:id}/arts",
        mockPath: "/members/{:id}/arts",
        params: {},
        options: {
            unSignature: true,
        },
    },
    {
        name: "getPopArts",
        method: "GET",
        desc: "获取热门作品",
        path: "/arts/popular",
        mockPath: "/arts/popular",
        params: {},
        options: {
            unSignature: true,
        },
    },
    {
        name: "getTopicArts",
        method: "GET",
        desc: "获取推荐主题作品",
        path: "/arts/topic",
        mockPath: "/arts/topic",
        params: {},
        options: {
            unSignature: true,
        },
    },
    {
        name: "getPopularAuthor",
        method: "GET",
        desc: "获取推荐艺术家",
        path: "/members/popular",
        mockPath: "/members/popular",
        params: {},
        options: {
            unSignature: true,
        },
    },
    {
        name: "getSellingArt",
        method: "GET",
        desc: "正在售卖的作品",
        path: "/arts/selling",
        mockPath: "/arts/selling",
        params: {},
        options: {
            unSignature: true,
        },
    },
    {
        name: "getAllArt",
        method: "GET",
        desc: "所有艺术家",
        path: "/members/artists",
        mockPath: "/members/artists",
        params: {},
        options: {
            unSignature: true,
        },
    },
    {
        name: "getPriceInterval",
        method: "GET",
        desc: "价格过滤区间",
        path: "/arts/prices",
        mockPath: "/arts​/prices",
        params: {},
        options: {
            unSignature: true,
        },
    },
    {
        name: "getTopArtist",
        method: "GET",
        desc: "推荐艺术家置顶",
        path: "/members/artist_topic",
        mockPath: "/members/artist_topic",
        params: {},
        options: {
            unSignature: true,
        },
    },
    {
        name: "getAuctionList",
        method: "GET",
        desc: "拍卖会列表",
        path: "/auction_meetings",
        mockPath: "/auction_meetings",
        params: {},
        options: {
            unSignature: true,
        },
    },
    {
        name: "getAuctionInfo",
        method: "GET",
        desc: "拍卖会信息",
        path: "/auction_meetings/{:id}",
        mockPath: "/auction_meetings/{:id}",
        params: {},
        options: {
            unSignature: true,
            id: "",
        },
    },
    {
        name: "getAuctionArtInfo",
        method: "GET",
        desc: "拍卖会信息",
        path: "/auction_meetings/{:id}/arts",
        mockPath: "/auction_meetings/{:id}/arts",
        params: {},
        options: {
            unSignature: true,
            id: "",
        },
    },
    {
        name: "getArtistInfo",
        method: "GET",
        desc: "获取艺术家信息",
        path: "/members/{:id}/artist_info",
        mockPath: "/members/{:id}/artist_info",
        params: {},
        options: {
            unSignature: true,
            id: "",
        },
    },
    {
        name: "getMemberInfo",
        method: "GET",
        desc: "获取艺术家信息",
        path: "/members/{:id}",
        mockPath: "/members/{:id}",
        params: {},
        options: {
            unSignature: false,
        },
    },
    {
        name: "getSearchMarket",
        method: "GET",
        desc: "搜索市场",
        path: "/arts/search",
        mockPath: "/arts/search",
        params: {
            q: "",
        },
        options: {
            unSignature: false,
        },
    },
    {
        name: "getPreArtistTopic",
        method: "GET",
        desc: "往期艺术家",
        path: "/members/pre_artist_topic",
        mockPath: "/members/pre_artist_topic",
        params: {},
        options: {
            unSignature: false,
        },
    },
];

export default apiList;
