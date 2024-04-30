import { useEffect, useState } from 'react';
import {redirect} from "next/navigation";

export default function useRedirectAfterSomeSeconds(shouldRedirect: boolean, redirectTo: string, seconds = 5) {
    const [secondsRemaining, setSecondsRemaining] = useState(seconds);

    useEffect(() => {
        if (shouldRedirect) {
            if (secondsRemaining === 0) redirect('/');

            const timer = setTimeout(() => {
                setSecondsRemaining((prevSecondsRemaining) => prevSecondsRemaining - 1);
                if (secondsRemaining === 1) redirect(redirectTo);
            }, 1000);

            return () => {
                clearInterval(timer);
            };
        }
    }, [secondsRemaining, redirectTo]);

    return { secondsRemaining };
}