import {useState} from "react";
import {Button, buttonVariants} from "@/components/ui/button";
import {Ellipsis, MoreHorizontal, Trash2Icon, TrashIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import Link from "next/link";

export default function ShowButtonHover({onClick}: { onClick: () => void }) {
    const [style, setStyle] = useState({display: 'none', padding: '8px'});

    return (
        <div className={"flex justify-center h-10 w-10 "}
            onMouseEnter={e => {
            setStyle({display: 'block', padding: '8px'});
        }}
             onMouseLeave={e => {
                 setStyle({display: 'none', padding: '8px'})
             }}>
            <Link
                href="#"
                className={cn(
                    buttonVariants({variant: "ghost", size: "icon"}),
                    "h-9 w-9"
                )}
                onClick={onClick}
                style={style}
            >
                <TrashIcon size={20}/>
            </Link>
        </div>
    );
}