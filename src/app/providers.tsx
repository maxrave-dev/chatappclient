'use client'

import React from "react";
import { CookiesProvider, useCookies} from "react-cookie";

export interface ProvidersProps {
    children: React.ReactNode
}

export function Providers({children}: ProvidersProps) {

    return (
        <CookiesProvider>
            {children}
        </CookiesProvider>
    );
}