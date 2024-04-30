'use client'
import React, {useEffect, useState} from "react";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import {Sidebar} from "@/components/sidebar";
import {cn} from "@/lib/utils";
import useSWR from "swr";
import {APIService} from "@/service/APIService";
import {Chat} from "@/components/chat";
import {HubConnection} from "@microsoft/signalr";

interface ChatLayoutProps {
    defaultLayout: number[] | undefined;
    defaultCollapsed?: boolean;
    navCollapsedSize: number;
}

export default function ChatLayout({
                               defaultLayout = [320, 480],
                               defaultCollapsed = false,
                               navCollapsedSize,
                           }: ChatLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [refreshRooms, setRefreshRooms] = useState<boolean>(true)

    const [isMobile, setIsMobile] = useState(false);
    const [shouldCreateRoom, setShouldCreateRoom] = useState<boolean>(false)
    const [createRoomName, setCreateRoomName] = useState<string>("")
    const {data: roomsData, error: errorRooms, isLoading: isLoadingRoom, mutate} = useSWR(refreshRooms ? "getRooms" : null, APIService.getInstance().getRooms)
    const {data: createRoomData, error: errorCreateRoom, isLoading: isLoadingCreateRoom} = useSWR(shouldCreateRoom ? createRoomName : null, APIService.getInstance().createRoom)
    const [rooms, setRooms] = useState<Room[]>([])
    const [selectedRoom, setSelectedRoom] = useState<Room>(rooms[0]);

    function handleSetSelectedRoom(name: string | null) {
        if (name != null) {
            setSelectedRoom(rooms.find(room => room.name === name) as Room)
        }
    }

    function handleCreateRoom(name: string) {
        setCreateRoomName(name)
        setShouldCreateRoom(true)
    }

    useEffect(() => {
        if (roomsData != undefined) {
            setRooms(roomsData)
            setRefreshRooms(false)
            mutate(// which cache keys are updated
                undefined,   // update cache data to `undefined`
                { revalidate: false } // do not revalidate
            );
        }
    }, [roomsData]);

    useEffect(() => {
        if (createRoomData != undefined) {
            setShouldCreateRoom(false)
            setRefreshRooms(true)
        }
    }, [createRoomData]);


    useEffect(() => {
        const checkScreenWidth = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        // Initial check
        checkScreenWidth();

        // Event listener for screen width changes
        window.addEventListener("resize", checkScreenWidth);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("resize", checkScreenWidth);
        };
    }, []);

    return (
        <ResizablePanelGroup
            direction="horizontal"
            onLayout={(sizes: number[]) => {
                document.cookie = `react-resizable-panels:layout=${JSON.stringify(
                    sizes
                )}`;
            }}
            className="h-full items-stretch"
        >
            <ResizablePanel
                defaultSize={defaultLayout[0]}
                collapsedSize={navCollapsedSize}
                collapsible={true}
                minSize={isMobile ? 0 : 24}
                maxSize={isMobile ? 8 : 30}
                onCollapse={() => {
                    setIsCollapsed(true);
                    document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                        true
                    )}`;
                }}
                onExpand={() => {
                    setIsCollapsed(false);
                    document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                        false
                    )}`;
                }}
                className={cn(
                    isCollapsed && "min-w-[50px] md:min-w-[70px] transition-all duration-300 ease-in-out"
                )}
            >
                <Sidebar
                    isCollapsed={isCollapsed || isMobile}
                    links={
                        rooms.map((room) => ({
                                name: room.name,
                                variant: selectedRoom?.name === room.name ? "grey" : "ghost",
                            })
                        )
                    }
                    isMobile={isMobile}
                    onClickItem = {
                        handleSetSelectedRoom
                    }
                    onCreateRoom={
                        handleCreateRoom
                    }
                />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                {
                    selectedRoom != undefined ? <Chat
                        selectedRoom={selectedRoom}
                        isMobile={isMobile}
                    /> : <div className={'w-full h-full'}>
                        <h1 className={'h-full text-center align-middle text-3xl mt-20'}>Pick a room...</h1>
                    </div>
                }
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}