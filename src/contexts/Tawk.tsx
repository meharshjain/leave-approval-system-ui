import React, { useEffect } from 'react';


declare global {
    interface Window {
        Tawk_API?: any;
        Tawk_LoadStart?: Date;
    }
}

const Tawk: React.FC = () => {

    useEffect(() => {
        // Initialize Tawk API object
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        // Create the script tag
        const s1 = document.createElement("script");
        s1.async = true;
        s1.src = "https://embed.tawk.to/690b82f72ee2f9195d6ef359/1j9aff66p";
        s1.charset = "UTF-8";
        s1.setAttribute("crossorigin", "*");

        // Insert before the first script tag
        const s0 = document.getElementsByTagName("script")[0];
        if (s0 && s0.parentNode) {
            s0.parentNode.insertBefore(s1, s0);
        }

        // Optional cleanup (usually not needed for Tawk)
        return () => {
            const tawkFrame = document.querySelector("iframe[title='chat widget']");
            if (tawkFrame) tawkFrame.remove();
        };
    }, []);


    return (
        <>
        </>
    );
};

export default Tawk;