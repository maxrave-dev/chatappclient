import axios, {AxiosError, AxiosResponse} from "axios";
import {useCookies} from "react-cookie";
import Cookies from "universal-cookie";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {getCookies} from "undici-types";

export class APIService {
    private static _instance: APIService | null = null;
    private cookies = new Cookies()

    private constructor() {
    }

    public static getInstance() {
        return this._instance ?? (this._instance = new APIService());
    }

    baseUrl = "http://nhom02.api.ec47.net/api"
    private bearerToken: string | null = null;

    public getToken(): string | null {
        this.createApiAxios.interceptors.response.use(
            (response: AxiosResponse) => {
                console.log("response", response);
                return response;
            },
            async (error) => {
                console.log("error", error);
                if (error.response?.status === 401) {
                    this.catch401Eror();
                }
                return Promise.reject(error);
            }
        )
        if (this.bearerToken != null) {
            return this.bearerToken;
        } else {
            this.bearerToken = this.cookies.get('token')
            console.log("Token", this.bearerToken)
            return this.bearerToken;
        }
    }

    public setToken(token: string) {
        this.bearerToken = token;
        this.createApiAxios.defaults.headers["Authorization"] = `Bearer ${token}`;
    }

    createApiAxios = axios.create({
        baseURL: this.baseUrl,
        headers: {
            "Accept": "*/*",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    })
    catch401Eror = () => {
        console.log("Catch 401 error")
        const cookies = new Cookies(null, {path: '/'});
        let expire = cookies.get('expire')
        if (isNaN(Date.parse(expire))) {
            cookies.remove('token', {path: '/'})
            cookies.remove('expire', {path: '/'})
            window.location.href = '/login'
        }
        else if (!isNaN(Date.parse(expire)) && Date.parse(expire) < Date.now()) {
            let userName = cookies.get('user').UserName
            let password = cookies.get('user').Password
            this.authentication({UserName: userName, Password: password}, true).then((data) => {
                var tokenResponse = data as TokenResponse
                if (tokenResponse != undefined && tokenResponse.token != undefined) {
                    this.setToken(tokenResponse.token)
                    cookies.set('token', tokenResponse.token, {path: '/'})
                    cookies.set('expire', tokenResponse.expiresIn, {path: '/'})
                    window.location.href = '/chat'
                } else {
                    window.location.href = '/login'
                }
            })
        } else {
            window.location.href = '/login'
        }
    }
    getUser = async () => {
        return this.createApiAxios
            .get("/user", {
                headers: {
                    "Authorization": 'Bearer ' + this.getToken(),
                }
            })
            .then((response: AxiosResponse<ApplicationUser>) => {
                console.log("THEN")
                console.log(response.statusText)
                console.log(response.headers)
                console.log(response.statusText)
                return response.data;
            })
            .catch((e) => {
                if (e.status === 401) {
                    this.catch401Eror()
                }
            })
    }
    authentication = async (authBody: AuthBody, rememberMe: boolean) => {
        return this.createApiAxios
            .post("/account/login", authBody)
            .then((response: AxiosResponse<TokenResponse>) => {
                console.log("THEN")
                console.log(response.statusText)
                console.log(response.headers)
                console.log(response.statusText)
                return response.data;
            })
            .catch((error: AxiosError<ErrorResponse>) => {
                console.log("CATCH")
                console.log(error.response?.statusText)
                return error.response?.data;
            });
    }
    register = async (registerBody: RegisterBody) => {
        return this.createApiAxios
            .post("/account/register", registerBody)
            .then((response: AxiosResponse<ErrorResponse>) => {
                console.log("THEN")
                console.log(response.statusText)
                console.log(response.headers)
                console.log(response.statusText)
                return response.data;
            })
            .catch((error: AxiosError<ErrorResponse>) => {
                console.log("CATCH")
                console.log(error.response?.statusText)
                return error.response?.data;
            });
    }
    logOut = async () => {
        return this.createApiAxios.post("/account/logout", null, {
            headers: {
                "Authorization": 'Bearer ' + this.getToken(),
            }
        }).then(
            (response) => {
                if (response.status === 401) {
                    this.catch401Eror()
                }
                let cookies = new Cookies(null, {path: '/'})
                cookies.remove('token', {path: '/'})
                cookies.remove('expire', {path: '/'})
                cookies.remove('user', {path: '/'})
                console.log("THEN")
                console.log(response.statusText)
                return response.status;
            }
        ).catch((e) => {
            if (e.status === 401) {
                this.catch401Eror()
            }
        })
    }

    //Room
    getRooms = async () => {
        return this.createApiAxios
            .get("/Rooms", {
                headers: {
                    "Authorization": 'Bearer ' + this.getToken(),
                }
            })
            .then((response: AxiosResponse<Room[]>) => {
                console.log("THEN")
                console.log(response.statusText)
                if (response.status === 401) {
                    this.catch401Eror()
                }
                console.log(response.headers)
                console.log(response.statusText)
                return response.data;
            })
            .catch((e) => {
                if (e.status === 401) {
                    this.catch401Eror()
                }
            });
    }
    createRoom = async (name: string) => {
        return this.createApiAxios
            .post("/Rooms", {name: name}, {
                headers: {
                    "Authorization": 'Bearer ' + this.getToken(),
                }
            })
            .then(
                (response: AxiosResponse<Room>) => {
                    if (response.status === 401) {
                        this.catch401Eror()
                    }
                    console.log("THEN")
                    console.log(response.statusText)
                    console.log(response.headers)
                    console.log(response.statusText)
                    return response.data;
                }
            ).catch((e) => {
                if (e.status === 401) {
                    this.catch401Eror()
                }
            })
    }
    removeRoom = async (removeRoom: Room) => {
        return this.createApiAxios.delete(`/Rooms/${removeRoom.id}`, {
            headers: {
                "Authorization": 'Bearer ' + this.getToken(),
            }
        }).then(
            (response) => {
                if (response.status === 401) {
                    this.catch401Eror()
                }
                console.log("THEN")
                console.log(response.statusText)
                return response.status;
            }
            ).catch((e) => {
                if (e.status === 401) {
                    this.catch401Eror()
                }
            }
        )
    }

    //Message
    getMessages = async (roomName: string) => {
        return this.createApiAxios
            .get(`/Messages/Room/${roomName}`, {
                headers: {
                    "Authorization": 'Bearer ' + this.getToken(),
                }
            })
            .then((response: AxiosResponse<Message[]>) => {
                if (response.status === 401) {
                    this.catch401Eror()
                }
                console.log("THEN")
                console.log(response.statusText)
                console.log(response.headers)
                console.log(response.statusText)
                return response.data;
            }).catch((e) => {
                if (e.status === 401) {
                    this.catch401Eror()
                }
            });
    }
    sendMessage = async (message: NewMessage) => {
        return this.createApiAxios
            .post("/Messages", message, {
                headers: {
                    "Authorization": 'Bearer ' + this.getToken(),
                }
            })
            .then(
                (response: AxiosResponse<Message>) => {
                    if (response.status === 401) {
                        this.catch401Eror()
                    }
                    console.log("THEN")
                    console.log(response.statusText)
                    console.log(response.headers)
                    console.log(response.statusText)
                    return response.data;
                }
            ).catch((e) => {
                if (e.status === 401) {
                    this.catch401Eror()
                }
            })
    }
    uploadFile = async (upload: UploadBody) => {
        return this.createApiAxios.post("/upload", upload,
            {
                headers: {
                    "Authorization": 'Bearer ' + this.getToken(),
                    "Content-Type" : "multipart/form-data"
                }
            }
        ).then(
            (response) => {
                if (response.status === 401) {
                    this.catch401Eror()
                }
                console.log("THEN")
                console.log(response.statusText)
                return response.status;
            }
        ).catch((e) => {
            if (e.status === 401) {
                this.catch401Eror()
            }
        })
    }

    removeMessage = async (message: Message) => {
        return this.createApiAxios.delete(`/Messages/${message.id}`, {
            headers: {
                "Authorization": 'Bearer ' + this.getToken(),
            }
        }).then(
            (response) => {
                if (response.status === 401) {
                    this.catch401Eror()
                }
                console.log("THEN")
                console.log(response.statusText)
                return response.status;
            }
        ).catch((e) => {
            if (e.status === 401) {
                this.catch401Eror()
            }
        })
    }
}