import { useEffect, useState } from 'react';

export const MOBILE_MEDIA_QUERY = '(max-width: 991.98px)';

function matchesMobile() {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(matchesMobile);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY);
        const onChange = () => setIsMobile(mediaQueryList.matches);
        mediaQueryList.addEventListener('change', onChange);

        onChange();
        return () => mediaQueryList.removeEventListener('change', onChange);
    }, []);

    return isMobile;
}
