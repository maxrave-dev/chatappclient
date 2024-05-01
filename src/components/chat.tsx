import ChatTopbar from "./chat-topbar";
import {ChatList} from "./chat-list";
import React, {useEffect, useState} from "react";
import useSWR from "swr";
import {APIService} from "@/service/APIService";
import {HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel} from "@microsoft/signalr";
import {socketService} from "@/service/ChatService";
import useSWRImmutable from "swr/immutable";
import {util} from "zod";
import find = util.find;
import {toast, Toaster} from "sonner";
import {refresh} from "effect/Resource";
import {cons} from "effect/List";
import Loading from "@/components/Loading";

interface ChatProps {
    selectedRoom: Room;
    isMobile: boolean;
}

export function Chat({ selectedRoom, isMobile }: ChatProps) {

    const [shouldGetMessages, setShouldGetMessages] = useState<boolean>(false)
    const {data, error, mutate} = useSWRImmutable(shouldGetMessages ? selectedRoom.name : null, APIService.getInstance().getMessages, {
        revalidateIfStale: true,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshInterval: 1000,
        keepPreviousData: false
    })

    const [newMessage, setNewMessage] = useState<NewMessage>();
    const [shouldSendMessage, setShouldSendMessage] = useState<boolean>(false);
    const {data: sendMessageData, error: sendMessageError} = useSWR(shouldSendMessage ? newMessage : null, APIService.getInstance().sendMessage)
    const [newUpload, setNewUpload] = useState<UploadBody>();
    const [shouldSendUpload, setShouldSendUpload] = useState<boolean>(false);
    const {data: sendUploadData, error: sendUploadError} = useSWR(shouldSendUpload ? newUpload : null, APIService.getInstance().uploadFile)
    const [roomToRemove, setRoomToRemove] = useState<Room | null>(null)
    const [shouldRemoveRoom, setShouldRemoveRoom] = useState<boolean>(false)
    const {data: removeRoomData, error: removeRoomError} = useSWR(shouldRemoveRoom ? roomToRemove : null, APIService.getInstance().removeRoom)
    const [removeMessage, setRemoveMessage] = useState<Message | null>(null)
    const [shouldRemoveMessage, setShouldRemoveMessage] = useState<boolean>(false)
    const {data: removeMessageData, error: removeMessageError} = useSWR(shouldRemoveMessage ? removeMessage : null, APIService.getInstance().removeMessage)

    const [connection, setConnection] = useState<HubConnection | null>(null);
    const {data: user, error: usererror} = useSWR("getUser", APIService.getInstance().getUser, {refreshInterval: 1000})
    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        setShouldGetMessages(false)
        if (data != undefined ) {
            console.log("useSWR")
            while (messages.length > 0) messages.pop()
            if (data.length > 0) setMessages(old => [...old, ...data])
            mutate(// which cache keys are updated
                undefined,   // update cache data to `undefined`
                { revalidate: false } // do not revalidate
            );
        }
    }, [data]);

    async function joinRoom (roomName: string) {
        try {
            const conn = new HubConnectionBuilder()
                .withUrl("http://nhom02.api.ec47.net/chatHub", {
                    accessTokenFactory: () => {
                        return APIService.getInstance().getToken() ?? "";
                    },
                    skipNegotiation: true,
                    transport: HttpTransportType.WebSockets,
                })
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information)
                .build();

            conn.on('newMessage', (payload: Message) => {
                console.log("tim kiem" + messages.find(message => message.id == payload.id))
                handleAddMessage(payload)
            })
            conn.on('removeChatMessage', (id: number) => {
                handleRemoveMessage(id)
            })
            conn.on('onRoomDeleted', () => {
                console.log("Room deleted")
                toast.error("Room deleted")
                window.location.reload()
            })
            await conn.start();
            await conn.invoke('Join', roomName).then(() => {
                console.log("Joined room", roomName)
            })

            setConnection(conn)

        } catch (e) {
            console.log("Error creating connection", e)
        }
    }

    const [shouldHandleAddMessage, setShouldHandleAddMessage] = useState<boolean>(false)
    const [addMessageData, setAddMessageData] = useState<Message | null>(null)
    const [shouldHandleRemoveMessage, setShouldHandleRemoveMessage] = useState<boolean>(false)
    const [removeMessageDataId, setRemoveMessageDataId] = useState<number | null>(null)
    useEffect(() => {
        if (shouldHandleAddMessage && addMessageData != null) {
            if (addMessageData.fromUserName != user?.userName) {
                if (messages.find(message => message.id == addMessageData.id) === undefined) {
                    console.log("Message sent", addMessageData)
                    setMessages(prevState => [...prevState, addMessageData])
                }
            }
            setShouldHandleAddMessage(false);
            setAddMessageData(null);
        }
    }, [shouldHandleAddMessage, addMessageData, messages]);
    useEffect(() => {
        if (shouldHandleRemoveMessage && removeMessageDataId != null) {
            console.log("Message removed", removeMessageDataId)
            let messIndex = messages.findIndex(message => message.id == removeMessageDataId)
            console.log(messIndex)
            if (messIndex != -1) {
                setMessages([
                    ...messages.slice(0, messIndex),
                    ...messages.slice(messIndex + 1)
                ]);
            }
            setShouldHandleRemoveMessage(false);
            setRemoveMessageDataId(null);
        }
    }, [shouldHandleRemoveMessage, removeMessageDataId, messages]);

    function handleAddMessage(payload: Message) {
        setAddMessageData(payload)
        setShouldHandleAddMessage(true)
    }

    function handleRemoveMessage(id: number) {
        setRemoveMessageDataId(id)
        setShouldHandleRemoveMessage(true)
    }

    useEffect(() => {
        if (selectedRoom != undefined) {
            console.log("Joining room", selectedRoom.name)
            setShouldGetMessages(true)
            joinRoom(selectedRoom.name).then(() => {
                console.log("Joined room")
            }).catch(
                (e) => {
                    console.log("Error joining room", e)
                }
            )
        }
    }, [selectedRoom]);

    useEffect(() => {
        if (shouldSendMessage) {
            if (sendMessageData != undefined) {
                console.log("tim kiem" + messages.find(message => message.id == sendMessageData.id))
                if (messages.find(message => message.id == sendMessageData.id) === undefined) {
                    console.log("Message sent", sendMessageData)
                    setMessages(prevState => [...prevState, sendMessageData])
                }
            }
            else {
                console.log("Error sending message", sendMessageError)
            }
            setShouldSendMessage(false)
        }
    }, [sendMessageData, sendMessageError]);
    useEffect(() => {
        if (shouldSendUpload) {
            if (sendUploadData != undefined) {
                console.log(sendUploadData)
                setShouldGetMessages(true)
            }
            else {
                console.log("Error sending message", sendMessageError)
            }
            setShouldSendUpload(false)
        }
    }, [sendUploadData, sendUploadError]);

    useEffect(() => {
        if (shouldRemoveRoom) {
            if (removeRoomData != undefined) {
                console.log(removeRoomData)
            }
            else {
                console.log("Error sending message", removeRoomError)
            }
            setShouldRemoveRoom(false)
        }
    }, [removeRoomData, removeRoomError]);

    useEffect(() => {
        if (shouldRemoveMessage) {
            if (removeMessageData != undefined) {
                console.log(removeMessageData)
                setMessages(messages.filter(message => message.id != removeMessage?.id))
            }
            else {
                console.log("Error sending message", removeMessageError)
            }
            setShouldRemoveMessage(false)
        }
    }, [removeMessageData, removeMessageError]);

    const sendMessage = (newMessage: NewMessage) => {
        setNewMessage(newMessage)
        setShouldSendMessage(true)
    };
    const sendUpload = (uploadBody: UploadBody) => {
        setNewUpload(uploadBody)
        setShouldSendUpload(true)
    };
    const removeRoom = async (room: Room) => {
        if (room.admin === user?.userName) {
            setRoomToRemove(room)
            setShouldRemoveRoom(true)
        }
        else {
            toast.error("You are not the admin of this room")
        }
    }
    const sendRemoveMessage = (message: Message) => {
        console.log("Removing message", message)
        setRemoveMessage(message)
        setShouldRemoveMessage(true)
    }

    return (
        <div className="flex flex-col justify-between w-full h-full">
            <ChatTopbar selectedRoom={selectedRoom} onDeleteRoomClick={removeRoom} />

            {user != undefined ? <ChatList
                user = {user}
                messages={messages}
                selectedRoom={selectedRoom}
                sendMessage={sendMessage}
                sendUpload={sendUpload}
                removeMessage={sendRemoveMessage}
                isMobile={isMobile}
            /> : <Loading/>}
            <Toaster />
        </div>
    );
}