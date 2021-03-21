package vo

type UploadIpfsVo struct {
	Id       int    `json:"id"`
	FilePath string `json:"file_path"` //带https的完整网址
	FileHash string `json:"file_hash"` //文件哈希
	FileSize int64  `json:"file_size"`
	FileName string `json:"file_name"`
	//FileType 	  int    `json:"file_type"`

}
