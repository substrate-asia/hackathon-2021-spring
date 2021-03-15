import { Loading, Breadcrumb, BreadcrumbItem } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";

// 设置语言
locale.use(lang);

export default {
    install: (vue) => {
        vue.use(Loading.directive);
        vue.use(Breadcrumb);
        vue.use(BreadcrumbItem);
    },
};
