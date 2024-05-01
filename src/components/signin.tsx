'use client'
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox";
import {APIService} from "@/service/APIService";
import {useEffect, useState} from "react";
import { useSpring, animated } from '@react-spring/web'
import {Loader2} from "lucide-react";
import useSWR from "swr";
import {toast, Toaster} from "sonner";
import Link from "next/link";
import { useCookies } from "react-cookie";
import {redirect} from "next/navigation";

export default function SignIn() {
    const [shouldAuth, setShouldAuth] = useState<boolean>(false)
    const [rememberMe, setRememberMe] = useState<boolean>(false)
    const [token, setToken] = useState<string | null>(null)
    const [errorMessage, setError] = useState<string | null>(null)
    const [authBody, setAuthBody] = useState<AuthBody>({
        UserName: "",
        Password: ""
    })
    const {data, error, isLoading} = useSWR(shouldAuth ? [authBody, rememberMe] : null , ([authBody, rememberMe]) => APIService.getInstance().authentication(authBody, rememberMe))
    const showLoadingSpring = useSpring({
        opacity: isLoading ? 1 : 0,
    });

    const [cookies, setCookie] = useCookies(['token']);
    const [user, setUserCookie] = useCookies(['user']);
    const [expire, setExpire] = useCookies(['expire']);

    // Define the spring animation for component 2
    const hideLoadingSpring = useSpring({
        opacity: isLoading ? 0 : 1,
    });

    useEffect(
        () => {
            if (shouldAuth && data != undefined) {
                setShouldAuth(false)
                console.log(data, error)
                if ((data as TokenResponse).token != undefined) {
                    console.log("data" , data)
                    toast("Login Successful")
                    let tokenLoaded = (data as TokenResponse).token
                    setToken(tokenLoaded)
                    if (tokenLoaded != null) {
                        console.log("token" , tokenLoaded)
                        APIService.getInstance().setToken(tokenLoaded)
                        setCookie('token', tokenLoaded, { path: '/' });
                        setUserCookie('user', authBody, { path: '/' });
                        setExpire('expire', (data as TokenResponse).expiresIn, { path: '/' });
                    }
                    window.location.href = '/chat'
                }
                else {
                    console.log("error" , error)
                    setError((data as ErrorResponse).message)
                    toast("Error", {
                        description: errorMessage,
                    })
                }
            }
        },
        [data, error, isLoading]
    )
    function checkNotEmpty(): Boolean {
        return authBody.UserName != "" && authBody.Password != ""
    }
    return (
        <>
            <div className="flex h-screen justify-center items-center">
                <Card className="max-w-96">
                    <CardHeader>
                        <CardTitle className="text-2xl">Login</CardTitle>
                        <CardDescription>Please enter your username and password to login.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" placeholder="Your username" required type="text" onChange={
                                (e) => {
                                    setAuthBody({...authBody, UserName: e.target.value})
                                }
                            }/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" required type="password" onChange={
                                (e) => {
                                    setAuthBody({...authBody, Password: e.target.value})
                                }
                            }/>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="rememberme" checked={rememberMe} onCheckedChange={
                                (e) => {
                                    setRememberMe(!rememberMe)
                                }
                            }/>
                            <label
                                htmlFor="rememberme"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Remember me?
                            </label>
                        </div>
                        <div style={{display: 'flex w-full'}}>
                            <animated.div style={showLoadingSpring}>
                                {isLoading && (
                                    <Button disabled className="w-full">
                                        <Loader2 className="mr-2 h-4 animate-spin" />
                                        Please wait
                                    </Button>
                                )}
                            </animated.div>
                            <animated.div style={hideLoadingSpring}>
                                {!isLoading && (
                                    <Button className="w-full hover:bg-blue-500 transition-colors " onClick={
                                        () => {
                                            if (checkNotEmpty()) {
                                                setShouldAuth(true)
                                            }
                                            else {
                                                toast("Error", {
                                                    description: "Username or password cannot be empty"
                                                })
                                            }
                                        }
                                    }>Sign in</Button>
                                )}
                            </animated.div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="flex w-full justify-between items-center">
                            <Label>You don't have an account?</Label>
                            <Button variant="link">
                                <Link href="/signup">Register now</Link>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
                <Toaster />
            </div>
        </>
    )
}