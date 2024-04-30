import {buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import React from "react";
import ChatLayout from "@/components/chatlayout";

export default function ChatPage() {
    return (
        <main className="flex h-[calc(100dvh)] flex-col items-center justify-center p-4 md:px-24 py-32 gap-4">
            <div className="flex justify-between max-w-5xl w-full items-center">
                <Link href="#" className="text-4xl font-bold text-gradient">Group 2 Chat App like Slack</Link>
            </div>

            <div className="z-10 border rounded-lg max-w-5xl w-full h-full text-sm lg:flex">
                <ChatLayout defaultLayout={[320, 480]} navCollapsedSize={8}/>
            </div>

        </main>
    )
}
