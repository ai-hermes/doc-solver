'use client'
import { useState, useEffect } from 'react';

export function useBrowserLanguage() {
    const [language, setLanguage] = useState(() => {
        if(typeof navigator !== 'undefined') {
            return navigator.language || navigator.languages[0]
        }
        return 'en'
    });

    useEffect(() => {
        const updateLanguage = () => {
            setLanguage(navigator.language || navigator.languages[0]);
        };

        window.addEventListener('languagechange', updateLanguage);

        return () => {
            window.removeEventListener('languagechange', updateLanguage);
        };
    }, []);

    return language;
}