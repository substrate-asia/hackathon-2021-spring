package routers

import (
	beego "github.com/beego/beego/v2/server/web"
	"github.com/beego/beego/v2/server/web/context/param"
)

func init() {

    beego.GlobalControllerRouter["assets-api/controllers:AssetsController"] = append(beego.GlobalControllerRouter["assets-api/controllers:AssetsController"],
        beego.ControllerComments{
            Method: "Detail",
            Router: "/v2/assets/detail",
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["assets-api/controllers:AssetsController"] = append(beego.GlobalControllerRouter["assets-api/controllers:AssetsController"],
        beego.ControllerComments{
            Method: "List",
            Router: "/v2/assets/list",
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["assets-api/controllers:AssetsController"] = append(beego.GlobalControllerRouter["assets-api/controllers:AssetsController"],
        beego.ControllerComments{
            Method: "Trading",
            Router: "/v2/assets/trading",
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["assets-api/controllers:AssetsController"] = append(beego.GlobalControllerRouter["assets-api/controllers:AssetsController"],
        beego.ControllerComments{
            Method: "Upload",
            Router: "/v2/assets/upload",
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["assets-api/controllers:CategoryController"] = append(beego.GlobalControllerRouter["assets-api/controllers:CategoryController"],
        beego.ControllerComments{
            Method: "Add",
            Router: "/v2/category/add",
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["assets-api/controllers:CategoryController"] = append(beego.GlobalControllerRouter["assets-api/controllers:CategoryController"],
        beego.ControllerComments{
            Method: "BatchAdd",
            Router: "/v2/category/batch_add",
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["assets-api/controllers:CategoryController"] = append(beego.GlobalControllerRouter["assets-api/controllers:CategoryController"],
        beego.ControllerComments{
            Method: "Delete",
            Router: "/v2/category/delete",
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["assets-api/controllers:CategoryController"] = append(beego.GlobalControllerRouter["assets-api/controllers:CategoryController"],
        beego.ControllerComments{
            Method: "Detail",
            Router: "/v2/category/detail",
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["assets-api/controllers:CategoryController"] = append(beego.GlobalControllerRouter["assets-api/controllers:CategoryController"],
        beego.ControllerComments{
            Method: "List",
            Router: "/v2/category/list",
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["assets-api/controllers:CategoryController"] = append(beego.GlobalControllerRouter["assets-api/controllers:CategoryController"],
        beego.ControllerComments{
            Method: "Update",
            Router: "/v2/category/update",
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["assets-api/controllers:CommonController"] = append(beego.GlobalControllerRouter["assets-api/controllers:CommonController"],
        beego.ControllerComments{
            Method: "QueryProof",
            Router: "/v2/category/detail",
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["assets-api/controllers:UserController"] = append(beego.GlobalControllerRouter["assets-api/controllers:UserController"],
        beego.ControllerComments{
            Method: "Assets",
            Router: "/v2/user/assets",
            AllowHTTPMethods: []string{"post"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

    beego.GlobalControllerRouter["assets-api/controllers:UserController"] = append(beego.GlobalControllerRouter["assets-api/controllers:UserController"],
        beego.ControllerComments{
            Method: "Orders",
            Router: "/v2/user/orders",
            AllowHTTPMethods: []string{"get"},
            MethodParams: param.Make(),
            Filters: nil,
            Params: nil})

}
