const routes = [
    {
        path: "/",
        name: "Home",
        component: () =>
            import(/* webpackChunkName: "home" */ "@/views/Home/Index.vue"),
    },
    {
        path: "/market",
        name: "Market",
        component: () =>
            import(/* webpackChunkName: "market" */ "@/views/Market/Index.vue"),
    },
    {
        path: "/auction/:id",
        name: "AuctionIndex",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "auction" */ "@/views/Auction/Index.vue"
            ),
    },
    {
        path: "/auction/:id/apply",
        name: "AuctionApply",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "auction" */ "@/views/Auction/Apply.vue"
            ),
    },
    {
        path: "/auction/:id/candidates",
        name: "AuctionCandidates",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "auction" */ "@/views/Auction/Candidates.vue"
            ),
    },
    {
        path: "/authority",
        name: "Authority",
        component: () =>
            import(
                /* webpackChunkName: "authority" */ "@/views/Certificate/Authority.vue"
            ),
    },
    {
        path: "/artist",
        name: "Artist",
        component: () =>
            import(/* webpackChunkName: "artist" */ "@/views/Artist/Index.vue"),
    },
    {
        path: "/artist-detail/:id",
        name: "ArtistDetail",
        component: () =>
            import(
                /* webpackChunkName: "artist" */ "@/views/Artist/Detail.vue"
            ),
    },
    {
        path: "/art/:id",
        name: "ArtDetail",
        component: () =>
            import(/* webpackChunkName: "art" */ "@/views/Art/Index.vue"),
    },
    {
        path: "/certificate",
        name: "Certificate",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "certificate" */ "@/views/Certificate/Index.vue"
            ),
    },
    {
        path: "/certificate/sign",
        name: "Sign",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "certificate" */ "@/views/Certificate/Sign.vue"
            ),
    },
    {
        path: "/certificate/orgsign/:hash",
        name: "OrgSign",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "certificate" */ "@/views/Certificate/Sign.vue"
            ),
    },
    {
        path: "/certificate/apply",
        name: "Apply",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "certificate" */ "@/views/Certificate/ApplyOrg.vue"
            ),
    },
    {
        path: "/account",
        name: "Account",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "account" */ "@/views/Account/Index.vue"
            ),
        children: [
            {
                path: "/",
                name: "AccountIndex",
                meta: {
                    needAuth: true,
                },
                component: () =>
                    import(
                        /* webpackChunkName: "accountIndex" */ "@/views/Account/Own.vue"
                    ),
            },
            {
                path: "sale",
                name: "AccountSale",
                meta: {
                    needAuth: true,
                },
                component: () =>
                    import(
                        /* webpackChunkName: "accountSale" */ "@/views/Account/Sale.vue"
                    ),
            },
            {
                path: "sign",
                name: "AccountSign",
                meta: {
                    needAuth: true,
                },
                component: () =>
                    import(
                        /* webpackChunkName: "AccountSign" */ "@/views/Account/Signs.vue"
                    ),
            },
        ],
    },
    {
        path: "/account/upload",
        name: "AccountUpload",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "accountUpload" */ "@/views/Account/Upload.vue"
            ),
    },
    {
        path: "/account/edit/:id",
        name: "AccountEdit",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "accountUpload" */ "@/views/Account/Edit.vue"
            ),
    },
    {
        path: "/account/profile",
        name: "AccountProfile",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "accountProfile" */ "@/views/Account/Profile.vue"
            ),
    },
    {
        path: "/account/purchase",
        name: "AccountPurchase",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "accountPurchase" */ "@/views/Account/Purchase.vue"
            ),
    },
    {
        path: "/account/sold",
        name: "AccountSold",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "accountSold" */ "@/views/Account/Sold.vue"
            ),
    },
    {
        path: "/account/following",
        name: "AccountFollowing",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "AccountFollowing" */ "@/views/Account/Following.vue"
            ),
    },
    {
        path: "/account/followers",
        name: "AccountFollowers",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "AccountFollowers" */ "@/views/Account/Followers.vue"
            ),
    },
    {
        path: "/account/collection",
        name: "AccountCollection",
        meta: {
            needAuth: true,
        },
        component: () =>
            import(
                /* webpackChunkName: "AccountCollection" */ "@/views/Account/Collection.vue"
            ),
    },
    {
        path: "/login",
        name: "Login",
        component: () =>
            import(/* webpackChunkName: "Login" */ "@/views/Session/Login.vue"),
    },
];

export default routes;
