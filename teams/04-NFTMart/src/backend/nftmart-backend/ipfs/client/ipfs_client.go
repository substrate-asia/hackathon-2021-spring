package client

import (
	"fmt"
	shell "github.com/ipfs/go-ipfs-api"
	"io/ioutil"
	"os"
	"strings"
)

func getAPIURI() string{
	//return variable.ConfigYml.GetString("Storage.Ipfs.Host")+":"+variable.ConfigYml.GetString("Storage.Ipfs.Port")
   return "47.110.236.215:5001"
}
//ipfs 上传字符串
func AddString(str string) string{
	// Where your local node is running on localhost:5001
	sh := shell.NewShell(getAPIURI())
	cid, err := sh.Add(strings.NewReader(str))
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %s", err)
		os.Exit(1)
	}
	fmt.Printf("added %s", cid)
	return cid
}

//ipfs 上传文件
func AddFile(path string) string{
	url :=getAPIURI()
	sh := shell.NewShell(url)
	cid, err := sh.AddDir(path)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %s", err)
		os.Exit(1)
	}
	fmt.Printf("added %s", cid)
	return cid
}

func Cat(examplesHash string) {
	sh := shell.NewShell(getAPIURI())
	rc, err := sh.Cat(examplesHash)
	if err != nil {
		fmt.Println(err.Error())
	}
	body, err := ioutil.ReadAll(rc)
	if err != nil {
		fmt.Println(err.Error())
	}
	fmt.Println("cat:", string(body))
}