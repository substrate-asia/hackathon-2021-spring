import http from "../HttpService";

export class AccountServiceMock {
    async login(loginData) {
        const loginResponse = {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjE4ODUxODIyMTYyIiwiaWF0IjoxNTM2Mzg5NTU2fQ.p3QSYt-yKiqN6-I3V6yU0wCRYJ81acSTRliccKW3-Tc'
        };
        return await loginResponse;
    }

    async register(loginData) {
        const loginResponse = {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjE4ODUxODIyMTYyIiwiaWF0IjoxNTM2Mzg5NTU2fQ.p3QSYt-yKiqN6-I3V6yU0wCRYJ81acSTRliccKW3-Tc'
        };
        return await loginResponse;
    }
}
