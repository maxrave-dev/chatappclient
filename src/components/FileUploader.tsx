import React, { useRef } from "react";
import { PaperclipIcon } from "lucide-react";
import {cn} from "@/lib/utils";
import {buttonVariants} from "@/components/ui/button";
import Link from "next/link";

interface FileUploaderProps {
    handleFile: (file: File) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ handleFile }) => {
    // Create a reference to the hidden file input element
    const hiddenFileInput = useRef<HTMLInputElement>(null);

    // Programatically click the hidden file input element
    // when the Button component is clicked
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        hiddenFileInput.current?.click();
    };

    // Call a function (passed as a prop from the parent component)
    // to handle the user-selected file
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileUploaded = event.target.files?.[0];
        if (fileUploaded) {
            handleFile(fileUploaded);
        }
    };

    return (
        <>
            <Link
                href="#"
                className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "h-9 w-9",
                    "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                )}
                onClick={
                    (e) => {
                        handleClick(e);
                    }
                }
            >
                <PaperclipIcon size={20} className="text-muted-foreground" />
            </Link>
            <input
                type="file"
                onChange={handleChange}
                ref={hiddenFileInput}
                style={{ display: "none" }} // Make the file input element invisible
            />
        </>
    );
};
