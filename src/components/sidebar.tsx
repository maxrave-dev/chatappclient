'use client'

import Link from "next/link";
import {LogOut, MoreHorizontal, SquarePen} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button, buttonVariants} from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip";
import {Avatar, AvatarImage} from "./ui/avatar";
import useSWR from "swr";
import {GroupIcon, PersonIcon} from "@radix-ui/react-icons";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {useState} from "react";
import {Content, Portal} from "@radix-ui/react-alert-dialog";
import {APIService} from "@/service/APIService";
import {Input} from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {DialogClose} from "@radix-ui/react-dialog";
import {toast} from "sonner";
import {setCookie} from "undici-types";
import {redirect} from "next/navigation";

interface SidebarProps {
    isCollapsed: boolean;
    links: {
        name: string;
        variant: "grey" | "ghost";
    }[];
    onClickItem: (name: string) => void;
    onCreateRoom: (name: string) => void;
    isMobile: boolean;
}

const formSchema = z.object({
    roomName: z.string().min(5, {
        message: "Room name must be at least 5 characters.",
    }).max(100, {
        message: "Room name must be at most 100 characters.",
    }),
})

export function Sidebar({links, isCollapsed, onClickItem, onCreateRoom, isMobile}: SidebarProps) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            roomName: "",
        },
    })

    const [shouldShowCreateRoom, setShouldShowCreateRoom] = useState(false)

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setShouldShowCreateRoom(false)
        console.log(values)
        onCreateRoom(values.roomName)
    }

    return (
        <div
            data-collapsed={isCollapsed}
            className="relative group flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2 "
        >
            {!isCollapsed && (
                <div className="flex justify-between p-2 items-center">
                    <div className="flex gap-2 items-center text-2xl">
                        <p className="font-medium">Chats</p>
                        <span className="text-zinc-300">({links.length})</span>
                    </div>

                    <div>
                        <Link
                            href="#"
                            className={cn(
                                buttonVariants({variant: "ghost", size: "icon"}),
                                "h-9 w-9"
                            )}
                            onClick={
                                () => {
                                    APIService.getInstance().logOut()
                                        .then((r) => {
                                            if (r == 200) {
                                                toast.success("Logged out successfully")
                                                window.location.href = "/"
                                            }
                                        })
                                }
                            }
                        >
                            <LogOut size={20}/>
                        </Link>

                        <Link
                            href="#"
                            className={cn(
                                buttonVariants({variant: "ghost", size: "icon"}),
                                "h-9 w-9"
                            )}
                            onClick={() => {
                                setShouldShowCreateRoom(true)
                            }}
                        >
                            <SquarePen size={20}/>
                        </Link>
                    </div>
                </div>
            )}
            <nav
                className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                {links.map((link, index) =>
                    isCollapsed ? (
                        <TooltipProvider key={index}>
                            <Tooltip key={index} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="#"
                                        className={cn(
                                            buttonVariants({variant: "link", size: "icon"}),
                                            "h-11 w-11 md:h-16 md:w-16",
                                            link.variant === "grey" &&
                                            "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                                        )}
                                        onClick={
                                            () => {
                                                onClickItem(link.name)
                                            }
                                        }
                                    >
                                        <PersonIcon></PersonIcon>
                                        <span className="sr-only">#{link.name}</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    className="flex items-center gap-4"
                                >
                                    {link.name}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : (
                        <Link
                            key={index}
                            href="#"
                            onClick= {
                                () => {
                                    onClickItem(link.name)
                                }
                            }
                            className={cn(
                                buttonVariants({variant: "link", size: "lg"}),
                                link.variant === "grey" &&
                                "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink",
                                "justify-start gap-4"
                            )}
                        >
                            <div className="flex flex-col max-w-28">
                                <span>#{link.name}</span>
                            </div>
                        </Link>
                    )
                )}
            </nav>
            <AlertDialog open={shouldShowCreateRoom} onOpenChange={setShouldShowCreateRoom}>
                    <AlertDialogContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    name="roomName"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Room name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Room name" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Room name must be at least 5 characters and at most 100 characters.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}>
                                </FormField>
                                <Button type="submit">Submit</Button>
                                <Button className={'ml-2'} variant="ghost" onClick={() => setShouldShowCreateRoom(false)}>Cancel</Button>
                            </form>
                        </Form>
                    </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}