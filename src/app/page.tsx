'use client'

import {useCookies} from "react-cookie";
import {useEffect, useState} from "react";
import {APIService} from "@/service/APIService";
import {redirect} from "next/navigation";
import useSWR from "swr";
import {toast} from "sonner";

export default function Page() {
    const [user, setUser] = useCookies(['user'])
    const [token, setToken] = useCookies(['token'])
    const [expire, setExpire] = useCookies(['expire'])

    const [shouldRefreshToken, setShouldRefreshToken] = useState<boolean>(false)
    const {
        data,
        error,
        isLoading
    } = useSWR(shouldRefreshToken ? [user, true] : null, ([authBody, rememberMe]) => APIService.getInstance().authentication(authBody.user, rememberMe))
    useEffect(() => {
        if (user.user == undefined) {
            redirect('/login')
        } else if ((token.token === undefined) || expire.expire != undefined && (expire.expire as number) < new Date().getMilliseconds()) {
            setShouldRefreshToken(true)
        } else {
            redirect('/chat')
        }

    }, [user, token, expire]);

    useEffect(() => {
        if (shouldRefreshToken) {
            if ((data as TokenResponse).token != undefined) {
                console.log("data", data)
                toast("Login Successful")
                let tokenLoaded = (data as TokenResponse).token
                if (tokenLoaded != null) {
                    APIService.getInstance().setToken = tokenLoaded
                    setToken('token', tokenLoaded, {path: '/'});
                    setExpire('expire', (data as TokenResponse).expiresIn, {path: '/'});
                }
            } else {
                console.log("error", error)
                toast("Error", {
                    description: (data as ErrorResponse).message,
                })
                redirect('/login')
            }
        }
    }, [shouldRefreshToken]);

    return (
        <>
            {user.user != undefined ?
                <div>
                    <h1>{user.user.UserName}</h1>
                    <h1>{user.user.Password}</h1>
                </div> : null
            }
        </>
    )
}
