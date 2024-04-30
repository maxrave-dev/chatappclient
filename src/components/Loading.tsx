import {Loader2} from "lucide-react";

export default function Loading() {
    return (
        <div className={'flex justify-items-center h-full w-full'}>
            <Loader2 size={80} className={'m-auto animate-spin'}/>
        </div>
    )
}