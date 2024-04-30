import React from 'react'
import Avatar from 'react-avatar';
import {Info, Phone, Trash2Icon, Video} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface ChatTopbarProps {
    selectedRoom: Room;
    onDeleteRoomClick: (room: Room) => void;
}

export const TopbarIcons = [{ icon: Trash2Icon }];


export default function ChatTopbar({selectedRoom, onDeleteRoomClick}: ChatTopbarProps) {
    return (
        <div className="w-full h-20 flex p-4 justify-between items-center border-b">
            <div className="flex items-center gap-2">
                <div className="flex justify-center items-center mr-4">
                    <Avatar name={selectedRoom.name} round={true} size={'40px'}/>
                </div>


                <div className="flex flex-col">
                    <span className="font-medium">{selectedRoom.name}</span>
                    <span className="text-xs">Admin: {selectedRoom.admin}</span>
                </div>
            </div>

            <div>
                {TopbarIcons.map((icon, index) => (
                    <Link
                        key={index}
                        href="#"
                        className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "h-9 w-9",
                            "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white mr-2"
                        )}
                        onClick={(e) => {
                            onDeleteRoomClick(selectedRoom)}
                        }
                    >
                        <icon.icon size={20} className="text-muted-foreground" />
                    </Link>
                ))}
            </div>
        </div>
    )
}