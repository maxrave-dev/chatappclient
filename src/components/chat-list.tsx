import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import Avatar from 'react-avatar';
import ChatBottombar from "./chat-bottombar";
import { AnimatePresence, motion } from "framer-motion";
import {Locate, Text} from "lucide-react";
import ShowButtonHover from "@/components/ShowButtonHover";

interface ChatListProps {
    user: ApplicationUser;
    messages?: Message[];
    selectedRoom: Room;
    sendMessage: (newMessage: NewMessage) => void;
    sendUpload: (newUpload: UploadBody) => void;
    removeMessage: (message: Message) => void;
    isMobile: boolean;
}

export function ChatList({
                                user,
                             messages,
                             selectedRoom,
                             sendMessage,
                             sendUpload,
                             removeMessage,
                             isMobile
                         }: ChatListProps) {
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
                messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);
    function dateToMinutesAgo(dateString: Date): string {
        let date = new Date(dateString);
        const currentTime = Date.now(); // Current time in milliseconds
        const timestamp = date.getTime();
        const differenceInMilliseconds = currentTime - timestamp;

        if (differenceInMilliseconds < 3600000) { // If the difference is less than 1 hour (3600000 milliseconds)
            const minutesAgo = Math.floor(differenceInMilliseconds / 60000);
            return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
        } else {
            // If the difference is greater than or equal to 1 hour
            return date.toLocaleString('vi-VN', {timeZone: 'Asia/Ho_Chi_Minh'});
        }
    }
    function uploadFile(file: File) {
        console.log("Uploading file " + file.name)
        const newUpload: UploadBody = {
            RoomId: selectedRoom.id,
            BackendHost: 'https://nhom02.api.ec47.net',
            File: file,
        };
        sendUpload(newUpload);
    }
    return (
        <div className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
            <div
                ref={messagesContainerRef}
                className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col"
            >
                <AnimatePresence>
                    {messages?.map((message, index) => (
                        <motion.div
                            key={index}
                            layout
                            initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                            transition={{
                                opacity: { duration: 0.1 },
                                layout: {
                                    type: "spring",
                                    bounce: 0.3,
                                    duration: messages.indexOf(message) * 0.05 + 0.2,
                                },
                            }}
                            style={{
                                originX: 0.5,
                                originY: 0.5,
                            }}
                            className={cn(
                                "flex flex-col gap-2 p-4 whitespace-pre-wrap",
                                message.fromUserName === user.userName ? "items-end" : "items-start"
                            )}
                        >
                            <div className={'grid justify-items-stretch'}>
                                <div className={ message.fromUserName !== user.userName ? "flex gap-3 items-center justify-self-start" : "flex gap-3 items-center justify-self-end"}>
                                    {message.fromUserName !== user.userName && (
                                        <div className="flex justify-center items-center">
                                            <Avatar
                                                name={message.fromUserName ?? "Admin"}
                                                round={true}
                                                size={'40px'}
                                            />
                                        </div>
                                    )}
                                    {
                                        message.fromUserName === user.userName && (
                                            <ShowButtonHover onClick={() => removeMessage(message)}>
                                            </ShowButtonHover>
                                        )
                                    }
                                    {
                                        message.content.startsWith("<a href=") ? (
                                            <div className={"bg-accent p-3 rounded-md max-w-xs"} dangerouslySetInnerHTML={{__html: message.content}}/>
                                        ) : (
                                            <span className=" bg-accent p-3 rounded-md max-w-xs">
                                            {message.content}
                                            </span>
                                        )
                                    }
                                    {message.fromUserName === user.userName && (
                                        <>
                                            <div className="flex justify-center items-center">
                                                <Avatar
                                                    name={message.fromUserName ?? "Admin"}
                                                    round={true}
                                                    size={'40px'}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <small style={
                                    message.fromUserName === user.userName ? {color: '#9CA3AF', textAlign: 'right', marginTop: '5px'} : { color: '#9CA3AF', textAlign: 'left', marginTop: '5px'}
                                }>{dateToMinutesAgo(message.timestamp)}</small>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            {selectedRoom != undefined ?
                <ChatBottombar sendMessage={sendMessage} uploadFile={uploadFile} room={selectedRoom} isMobile={isMobile}/> : <> </>}
        </div>
    );
}