import { act } from '@testing-library/react';

export const MOBILE_WIDTH = 390;
export const DESKTOP_WIDTH = 1280;

export function setViewportWidth(width) {
    window.innerWidth = width;
    act(() => {
        window.__notifyMediaQueryLists();
        window.dispatchEvent(new Event('resize'));
    });
}

export function useMobileViewport() {
    window.innerWidth = MOBILE_WIDTH;
}

export function useDesktopViewport() {
    window.innerWidth = DESKTOP_WIDTH;
}
