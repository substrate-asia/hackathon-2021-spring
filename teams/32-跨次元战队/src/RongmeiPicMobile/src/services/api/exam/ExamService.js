import {httpCommon} from "../HttpService";

export class ExamServiceImpl {
    async getGenerateExercise(count) {
        return await httpCommon.get(`/exam/exercise/generation?count=${count}`)
    }

    async submitUserExam(userExamData) {
        return await httpCommon.post(`/exam/user`, userExamData)
    }

    async getUserExam() {
        return await httpCommon.get(`/exam/user`)
    }

    async verificationExercise(id, answer) {
        return await httpCommon.post(`/exam/exercise/verification`, {
            id, answer
        })
    }
}
