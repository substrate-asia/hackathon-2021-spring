package main

import (
	_ "assets-api/routers"

	beego "github.com/beego/beego/v2/server/web"
)

func main() {
	beego.Run()
}
