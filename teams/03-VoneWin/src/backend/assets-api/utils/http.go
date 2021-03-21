package utils

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
	"time"
)

//url:请求地址
//response:请求返回的内容
func CurlGet(url string) (response string) {
	client := http.Client{Timeout: 5 * time.Second}
	resp, error := client.Get(url)
	if resp == nil {
		return ""
	}
	defer resp.Body.Close()
	if error != nil {
		panic(error)
	}

	var buffer [512]byte
	result := bytes.NewBuffer(nil)
	for {
		n, err := resp.Body.Read(buffer[0:])
		result.Write(buffer[0:n])
		if err != nil && err == io.EOF {
			break
		} else if err != nil {
			panic(err)
		}
	}

	response = result.String()
	return
}

func LoadFileUrl(fileurl, savepath string) error {
	log.Println("LoadFileUrl:", fileurl)
	res, err := http.Get(fileurl)
	if err != nil {
		log.Printf("LoadFileUrl get file err:%v", err)
		errors.New("LoadFileUrl get file err")
	}
	f, err := os.Create(savepath)
	if err != nil {
		log.Printf("LoadFileUrl save file err:%v", err)
		errors.New("LoadFileUrl save file err")
	}
	io.Copy(f, res.Body)
	return nil
}

func httpDo() {
	client := &http.Client{}

	req, err := http.NewRequest("POST", "http://", strings.NewReader("key=value"))
	if err != nil {
		// handle error
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Cookie", "name=anny")

	resp, err := client.Do(req)

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		// handle error
	}

	fmt.Println(string(body))
}

func PostUrl(posturl, param string, token string) ([]byte, error) {
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: tr}
	log.Println("PostUrl")

	req, err := http.NewRequest("POST", posturl, strings.NewReader(param))
	if err != nil {
		log.Printf("NewRequest err:%v", err)
		return nil, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Authorization", token)

	resp, err := client.Do(req)
	defer resp.Body.Close()
	if err != nil {
		// handle error
		log.Printf("client.Do err:%v", err)
		return nil, err
	}
	resp_body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("ReadAll Body err:%v", err)
		return nil, err
	}
	defer resp.Body.Close()
	return resp_body, nil
	// log.Printf(string(resp_body))
	// respData := models.DataResponse{}
	// if err = json.Unmarshal(resp_body, &respData); nil != err {
	// 	log.Printf("Decode UploadFile err:%v", err)
	// 	return resp, err
	// }

	// log.Printf("upload resp:", respData)
	// return respData.Data, nil
}
func PostUrlJson(posturl, param string, token string) ([]byte, error) {
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: tr}
	log.Println("PostUrl")

	req, err := http.NewRequest("POST", posturl, strings.NewReader(param))
	if err != nil {
		log.Printf("NewRequest err:%v", err)
		return []byte{}, err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Authorization", token)

	resp, err := client.Do(req)
	if err != nil {
		// handle error
		log.Printf("client.Do err:%v", err)
		return []byte{}, err
	}
	defer resp.Body.Close()
	resp_body, err := ioutil.ReadAll(resp.Body)
	defer resp.Body.Close()
	if err != nil {
		log.Printf("ReadAll Body err:%v", err)
		return []byte{}, err
	}
	log.Printf(string(resp_body))
	return resp_body, nil

	// respData := models.PostUrlDataResponse{}
	// if err = json.Unmarshal(resp_body, &respData); nil != err {
	// 	log.Printf("Decode UploadFile err:%v", err)
	// 	return []byte{}, err
	// }

	// log.Printf("upload resp:%v\n", respData.Data)

	// data, err := json.Marshal(respData.Data)
	// log.Printf("Marshal resp:%v\n", data)
	// return data, err
}
func PostFileUrl(filename string, targetUrl string, token string) ([]byte, error) {
	log.Println("PostFileUrl")
	bodyBuf := &bytes.Buffer{}
	bodyWriter := multipart.NewWriter(bodyBuf)

	fileWriter, err := bodyWriter.CreateFormFile("upfile", filename)
	if err != nil {
		log.Println("error writing to buffer")
		return []byte{}, err
	}

	fh, err := os.Open(filename)
	if err != nil {
		log.Println("error opening file")
		return []byte{}, err
	}
	defer fh.Close()

	_, err = io.Copy(fileWriter, fh)
	if err != nil {
		return []byte{}, err
	}

	contentType := bodyWriter.FormDataContentType()
	bodyWriter.Close()

	req, err := http.NewRequest("POST", targetUrl, bodyBuf)
	if err != nil {
		log.Printf("NewRequest err:%v", err)
		return []byte{}, err
	}
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("Authorization", token)
	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		log.Printf("http.Client err:%v", err)
		return []byte{}, err
	}
	resp_body, err := ioutil.ReadAll(resp.Body)
	defer resp.Body.Close()
	if err != nil {
		log.Printf("ReadAll Body err:%v", err)
		return []byte{}, err
	}
	log.Printf(string(resp_body))
	// respData := models.DataResponse{}
	// if err = json.Unmarshal(resp_body, &respData); nil != err {
	// 	log.Printf("Decode UploadFile err:%v", err)
	// 	return []byte{}, err
	// }

	// dataBytes, err := json.Marshal(respData.Data)
	// if err != nil {
	// 	log.Printf("Decode respData.Data err:%v", err)
	// 	return []byte{}, err
	// }
	// log.Printf("upload resp:%v", respData)
	// return dataBytes, nil
	return resp_body, nil
}

//发送POST请求(https)亲测可用
func CurlPosts(url string, data, contentType, token string, types int) (content string) {
	var jsonStr []byte
	if types == 1 {
		jsonStr, _ = json.Marshal(data)
	} else if types == 2 {
		jsonStr = []byte(data)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
	req.Header.Add("Content-Type", contentType)
	req.Header.Add("Authorization", token)
	if err != nil {
		panic(err)
	}
	defer req.Body.Close()
	//跳过证书验证
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: tr}
	resp, error := client.Do(req)
	if resp == nil {
		return ""
	}
	if error != nil {
		panic(error)
	}
	defer resp.Body.Close()
	result, _ := ioutil.ReadAll(resp.Body)
	content = string(result)
	return
}
