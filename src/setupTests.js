import '@testing-library/jest-dom/vitest';

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

window.HTMLCanvasElement.prototype.getContext = () => null;
