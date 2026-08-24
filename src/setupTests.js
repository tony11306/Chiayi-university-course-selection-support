// jest-dom adds custom vitest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

// jsdom 沒有 matchMedia，而響應式版面的測試需要能改視窗寬度。
// 這裡放一個只認得 (max-width: Npx) / (min-width: Npx) 的假件，
// 搭配 testUtils/viewport.js 的 setViewportWidth 使用。
const mediaQueryLists = new Set();

function evaluate(query) {
    const max = query.match(/\(max-width:\s*([\d.]+)px\)/);
    if (max) return window.innerWidth <= Number.parseFloat(max[1]);
    const min = query.match(/\(min-width:\s*([\d.]+)px\)/);
    if (min) return window.innerWidth >= Number.parseFloat(min[1]);
    return false;
}

window.matchMedia = query => {
    const listeners = new Set();
    const mql = {
        media: query,
        get matches() {
            return evaluate(query);
        },
        addEventListener: (type, callback) => {
            if (type === 'change') listeners.add(callback);
        },
        removeEventListener: (type, callback) => {
            if (type === 'change') listeners.delete(callback);
        },
        // 舊版 API，React 生態還有函式庫在用
        addListener: callback => listeners.add(callback),
        removeListener: callback => listeners.delete(callback),
        dispatchChange() {
            for (const callback of listeners) callback({ matches: mql.matches, media: query });
        },
    };
    mediaQueryLists.add(mql);
    return mql;
};

window.__notifyMediaQueryLists = () => {
    for (const mql of mediaQueryLists) mql.dispatchChange();
};

// html2canvas 在 jsdom 下沒有 canvas 可用，元件測試只需要知道它被呼叫過。
window.HTMLCanvasElement.prototype.getContext = () => null;
