import {httpCommon} from "../HttpService";

export class UploadServiceImpl {
    async upload(file) {
        let formData = new FormData();
        formData.append("file", file)
        return await httpCommon.post(
            '/upload', formData
        )
    }
}
