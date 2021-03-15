package consts

// Constants defined here are usually composed of an error code plus an error description, and are generally used for interface return
const (
	// 进程被结束
	ProcessKilled string = "The process is terminated when the signal is received"
	// 表单验证器前缀
	ValidatorPrefix              string = "Form_Validator_"
	ValidatorParamsCheckFailCode int    = -400300
	ValidatorParamsCheckFailMsg  string = "Parameter validation failed"

	//服务器代码发生错误
	ServerOccurredErrorCode int    = -500100
	ServerOccurredErrorMsg  string = "Code execution error occurred inside the server, "

	// token相关
	JwtTokenSignKey       string = "nftmart"
	JwtTokenOK            int    = 200100           //token effectivity
	JwtTokenInvalid       int    = -400100          //invalid token
	JwtTokenExpired       int    = -400101          //overdue token
	JwtTokenFormatErrCode int    = -400102          //submitted token formal error
	JwtTokenFormatErrMsg  string = "The submitted token format is incorrect" //submitted token formal error
	JwtTokenOnlineUsers   int    = 10               // Set the maximum number of users on an account at the same time. Default is 10

	//SnowFlake 雪花算法
	StartTimeStamp = int64(1483228800000) //Start time cut (2017-01-01)
	MachineIdBits  = uint(10)             //The number of machine IDs
	SequenceBits   = uint(12)             //Number of digits in the sequence
	//MachineIdMax   = int64(-1 ^ (-1 << MachineIdBits)) //The maximum number of machine IDs supported
	SequenceMask   = int64(-1 ^ (-1 << SequenceBits)) //
	MachineIdShift = SequenceBits                     //Number of left shifts of machine ID
	TimestampShift = SequenceBits + MachineIdBits     //The left shift of the timestamp

	// CURD 常用业务状态码
	CurdStatusOkCode         int    = 200
	CurdStatusOkMsg          string = "Success"
	CurdCreatFailCode        int    = -400200
	CurdCreatFailMsg         string = "add fail"
	CurdUpdateFailCode       int    = -400201
	CurdUpdateFailMsg        string = "update fail"
	CurdDeleteFailCode       int    = -400202
	CurdDeleteFailMsg        string = "delete fail"
	CurdSelectFailCode       int    = -400203
	CurdSelectFailMsg        string = "search no data"
	CurdRegisterFailCode     int    = -400204
	CurdRegisterFailMsg      string = "register fail"
	CurdLoginFailCode        int    = -400205
	CurdLoginFailMsg         string = "login fail"
	CurdRefreshTokenFailCode int    = -400206
	CurdRefreshTokenFailMsg  string = "refresh Token fail"

	//文件上传
	FilesUploadFailCode            int    = -400250
	FilesUploadFailMsg             string = "File upload failed. There was an error getting the uploaded file!"
	FilesUploadMoreThanMaxSizeCode int    = -400251
	FilesUploadMoreThanMaxSizeMsg  string = "Long - pass file exceeds the maximum value set by the system（M）："
	FilesUploadMimeTypeFailCode    int    = -400252
	FilesUploadMimeTypeFailMsg     string = "File MIME type not allowed"

	//websocket
	WsServerNotStartCode int    = -400300
	WsServerNotStartMsg  string = "websocket The service is not open. Please open it in the configuration file：config/config.yml"
	WsOpenFailCode       int    = -400301
	WsOpenFailMsg        string = "websocket open Failed to initialize the base parameter of the phase"

	//验证码
	CaptchaGetParamsInvalidMsg    string = "Get the CAPTCHA: The submitted CAPTCHA parameter is invalid. Please check the CAPTCHA ID and filename suffix for completeness"
	CaptchaGetParamsInvalidCode   int    = -400350
	CaptchaCheckParamsInvalidMsg  string = "Verify Captcha: The submitted parameter is invalid. Please make sure the submitted Captcha ID and value are valid"
	CaptchaCheckParamsInvalidCode int    = -400351
	CaptchaCheckOkMsg             string = "Captcha validation passed"
	//CaptchaCheckOkCode            int    = 200
	CaptchaCheckFailCode int    = -400355
	CaptchaCheckFailMsg  string = "Captcha validation failed"
)
