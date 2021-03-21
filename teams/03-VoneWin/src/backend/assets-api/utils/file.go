package utils

import (
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"strings"
)

type FileList struct {
	Path     string
	FileInfo os.FileInfo
}

//递归遍历目录下所有文件
func ReadDir(dir string) (data []FileList, err error) {
	//判断文件或目录是否存在
	file, err := os.Stat(dir)
	if err != nil {
		return data, err
	}

	//如果不是目录，直接返回文件信息
	if !file.IsDir() {
		data = append(data, FileList{path.Dir(dir) + "/", file})
		return data, err
	}
	fileInfo, err := ioutil.ReadDir(dir)
	if err != nil {
		fmt.Println(fileInfo)
		return data, err
	}

	//目录为空
	if len(fileInfo) == 0 {
		return
	}

	for _, v := range fileInfo {
		if v.IsDir() {
			if subDir, err := ReadDir(dir + v.Name()); err != nil {
				return data, err
			} else {
				data = append(data, subDir...)
			}
		} else {
			data = append(data, FileList{strings.TrimRight(dir, "/") + "/", v})
		}
	}
	return data, err
}

//获取本地文件大小
func GetFileSize(filename string) int64 {
	var size int64
	filepath.Walk(filename, func(path string, f os.FileInfo, err error) error {
		size = f.Size()
		return nil
	})
	return size
}
