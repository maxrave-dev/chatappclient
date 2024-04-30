'use client'
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {APIService} from "@/service/APIService";
import {useEffect, useState} from "react";
import { useSpring, animated } from '@react-spring/web'
import {Loader2} from "lucide-react";
import useSWR from "swr";
import {toast, Toaster} from "sonner";
import {redirect} from "next/navigation";
import Link from "next/link";

export default function SignUp() {
    const [shouldRegister, setShouldRegister] = useState<boolean>(false)
    const [password, setPassword] = useState<string>("")
    const [retypePassword, setRetypePassword] = useState<string>("")
    const [wrongRetypePassword, setWrongRetypePassword] = useState<boolean>(false)
    const [errorMessage, setError] = useState<string | null>(null)
    const [registerBody, setRegisterBody] = useState<RegisterBody>({
        FullName: "",
        UserName: "",
        Email: "",
        Password: ""
    })
    const {data, error, isLoading} = useSWR(shouldRegister ? [registerBody] : null , ([registerBody]) => APIService.getInstance().register(registerBody))
    const showLoadingSpring = useSpring({
        opacity: isLoading ? 1 : 0,
    });

    // Define the spring animation for component 2
    const hideLoadingSpring = useSpring({
        opacity: isLoading ? 0 : 1,
    });

    const showRetypePasswordError = useSpring({
        opacity: wrongRetypePassword ? 1 : 0,
    })

    const [secondsRemaining, setSecondsRemaining] = useState(3);
    const [shouldRedirect, setShouldRedirect] = useState(false);
    useEffect(() => {
        if (shouldRedirect) {
            if (secondsRemaining === 0) redirect('/login');

            const timer = setTimeout(() => {
                setSecondsRemaining((prevSecondsRemaining) => prevSecondsRemaining - 1);
            }, 1000);

            return () => {
                clearInterval(timer);
            };
        }
    }, [secondsRemaining, shouldRedirect]);
    useEffect(
        () => {
            if (shouldRegister && data != undefined) {
                setShouldRegister(false)
                console.log(data, error)
                if (!(data as ErrorResponse).errors) {
                    console.log("data" , data)
                    toast("Signup Successful", {
                        description: "You will direct to login page"
                    })
                    setShouldRedirect(true)
                }
                else {
                    console.log("error" , data)
                    setError((data as ErrorResponse).message)
                    toast("Error", {
                        description: errorMessage,
                    })
                }
            }
        },
        [data, error, isLoading]
    )
    useEffect(
        () => {
            if (retypePassword != password && retypePassword != "" && password != "") {
                setWrongRetypePassword(true)
            }
            else {
                setWrongRetypePassword(false)
            }
        },
        [password, retypePassword]
    )
    function checkBeforeRegister(): Boolean {
        registerBody.Password = password
        return registerBody.FullName != "" && registerBody.UserName != "" && registerBody.Email != "" && password != "" && retypePassword != "" && !wrongRetypePassword
    }
    return (
        <>
            <div className="flex h-screen justify-center items-center">
                <Card className="max-w-96 min-w-96">
                    <CardHeader>
                        <CardTitle className="text-2xl">Sign Up</CardTitle>
                        <CardDescription>Create an account to use ChatApp.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullname">Full name</Label>
                            <Input id="fullname" placeholder="Your fullname" required type="text" onChange={
                                (e) => {
                                    setRegisterBody({...registerBody, FullName: e.target.value})
                                }
                            }/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" placeholder="Your username" required type="text" onChange={
                                (e) => {
                                    setRegisterBody({...registerBody, UserName: e.target.value})
                                }
                            }/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Your email</Label>
                            <Input id="email" placeholder="Your email" required type="email" onChange={
                                (e) => {
                                    setRegisterBody({...registerBody, Email: e.target.value})
                                }
                            }/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" required type="password" onChange={
                                (e) => {
                                    setPassword(e.target.value)
                                }
                            }/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="retypePassword">Retype Password</Label>
                            <Input id="retypePassword" required type="password" onChange={
                                (e) => {
                                    setRetypePassword(e.target.value)
                                }
                            }/>
                        </div>
                        <div style={{display: 'flex w-full'}}>
                            <animated.div style={showRetypePasswordError}>
                                { wrongRetypePassword && (
                                        <Label className="text-red-500">Password doesn't match</Label>
                                    )
                                }
                            </animated.div>
                        </div>
                        <div style={{display: 'flex w-full'}}>
                            <animated.div style={showLoadingSpring}>
                                {isLoading && (
                                    <Button disabled className="w-full">
                                        <Loader2 className="mr-2 h-4 animate-spin"/>
                                        Please wait
                                    </Button>
                                )}
                            </animated.div>
                            <animated.div style={hideLoadingSpring}>
                                {!isLoading && (
                                    <Button className="w-full hover:bg-blue-500 transition-colors " onClick={
                                        () => {
                                            if (checkBeforeRegister()) {
                                                setShouldRegister(true)
                                            }
                                            else {
                                                toast("Error", {
                                                    description: "Please check your input"
                                                })
                                            }
                                        }
                                    }>Register</Button>
                                )}
                            </animated.div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="flex w-full justify-between items-center">
                            <Label>You have an account?</Label>
                            <Button variant="link">
                                <Link href="/login">Log in</Link>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
                <Toaster/>
            </div>
        </>
    )
}