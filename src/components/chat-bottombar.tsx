import {
    FileImage,
    Mic,
    Paperclip,
    PlusCircle,
    SendHorizontal,
    Smile,
    ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import React, {useEffect, useRef, useState} from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { EmojiPicker } from "@/components/emoji-picker";
import useSWR from "swr";
import {APIService} from "@/service/APIService";
import {Content} from "@radix-ui/react-alert-dialog";
import {FileUploader} from "@/components/FileUploader";

interface ChatBottombarProps {
    sendMessage: (newMessage: NewMessage) => void;
    uploadFile: (file: File) => void;
    room: Room;
    isMobile: boolean;
}

export const BottombarIcons = [{ icon: Paperclip }];

export default function ChatBottombar({
                                          sendMessage, uploadFile, room, isMobile,
                                      }: ChatBottombarProps) {

    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value);
    };

    const handleThumbsUp = () => {
        console.log("Thumbs up");
        const newMessage: NewMessage = {
            RoomName: room.name,
            Content: "👍",
        };
        sendMessage(newMessage);
        setMessage("")
    };

    const handleSend = () => {
        if (message.trim()) {
            const newMessage: NewMessage = {
                RoomName: room.name,
                Content: message.trim(),
            };
            sendMessage(newMessage);
            setMessage("")

            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }

        if (event.key === "Enter" && event.shiftKey) {
            event.preventDefault();
            setMessage((prev) => prev + "\n");
        }
    };
    const [file, setFile] = useState<File>();
    function handleFile(f: File) {
        console.log(f);
        setFile(f);
    }
    useEffect(() => {
        if (file !== undefined) {
            uploadFile(file);
        }
    }, [file]);

    return (
        <div className="p-2 flex justify-between w-full items-center gap-2">
            <div className="flex">
                {!message.trim() && !isMobile && (
                    <div className="flex">
                        <FileUploader handleFile={ f =>
                            handleFile(f)
                        }/>
                    </div>
                )}
            </div>

            <AnimatePresence initial={false}>
                <motion.div
                    key="input"
                    className="w-full relative"
                    layout
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{
                        opacity: { duration: 0.05 },
                        layout: {
                            type: "spring",
                            bounce: 0.15,
                        },
                    }}
                >
                    <Textarea
                        autoComplete="off"
                        value={message}
                        ref={inputRef}
                        onKeyDown={handleKeyPress}
                        onChange={handleInputChange}
                        name="message"
                        placeholder="Aa"
                        className=" w-full border flex items-center h-5 overflow-hidden bg-background"
                    ></Textarea>
                    <div className="absolute right-2 bottom-0.5  ">
                        <EmojiPicker onChange={(value) => {
                            setMessage(message + value)
                            if (inputRef.current) {
                                inputRef.current.focus();
                            }
                        }} />
                    </div>
                </motion.div>

                {message.trim() ? (
                    <Link
                        href="#"
                        className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "h-14 w-14",
                            "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
                        )}
                        onClick={handleSend}
                    >
                        <SendHorizontal size={20} className="text-muted-foreground" />
                    </Link>
                ) : (
                    <Link
                        href="#"
                        className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "h-14 w-14",
                            "dark:bg-muted rounded-full dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
                        )}
                        onClick={handleThumbsUp}
                    >
                        <ThumbsUp size={20} className="text-muted-foreground" />
                    </Link>
                )}
            </AnimatePresence>
        </div>
    );
}