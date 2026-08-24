import { useEffect, useState } from 'react';

// 對齊 Bootstrap 的 lg 斷點：以下走手機版面（分頁 + 卡片），以上走桌機雙欄。
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
        // 掛上時再對一次，避免 hydration 到 effect 之間視窗被改過
        onChange();
        return () => mediaQueryList.removeEventListener('change', onChange);
    }, []);

    return isMobile;
}
