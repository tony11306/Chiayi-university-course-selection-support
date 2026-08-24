import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

function stripComments(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function splitSelectorList(prelude) {
    const parts = [];
    let depth = 0;
    let current = '';
    for (const ch of prelude) {
        if (ch === '(') depth += 1;
        else if (ch === ')') depth -= 1;
        if (ch === ',' && depth === 0) {
            if (current.trim()) parts.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
}

function rules(css) {
    const found = [];
    walk(stripComments(css));
    return found;

    function walk(text) {
        let i = 0;
        let buffer = '';
        while (i < text.length) {
            if (text[i] !== '{') {
                buffer += text[i];
                i += 1;
                continue;
            }
            let depth = 1;
            let j = i + 1;
            while (j < text.length && depth > 0) {
                if (text[j] === '{') depth += 1;
                else if (text[j] === '}') depth -= 1;
                j += 1;
            }
            const prelude = buffer.trim();
            const body = text.slice(i + 1, j - 1);
            if (prelude.startsWith('@keyframes') || prelude.startsWith('@font-face')) {
                buffer = '';
                i = j;
                continue;
            }
            if (prelude.startsWith('@')) {
                walk(body);
            } else {
                for (const selector of splitSelectorList(prelude)) {
                    found.push({ selector, body });
                }
            }
            buffer = '';
            i = j;
        }
    }
}

const selectorsOf = css => rules(css).map(rule => rule.selector);
const declaring = (css, text) => rules(css).filter(rule => rule.body.includes(text));

const desktopCss = readFileSync('src/desktop/desktop.css', 'utf8');
const mobileCss = readFileSync('src/mobile/mobile.css', 'utf8');
const sharedCss = readFileSync('src/index.css', 'utf8');

const DESKTOP_SCOPE = ':is(.view-desktop, .desktop-modal)';

describe('桌機樣式', () => {
    test('每一條規則都關在 .view-desktop（或 portal 出去的 Modal）底下', () => {
        const leaked = selectorsOf(desktopCss).filter(selector =>
            !selector.startsWith(DESKTOP_SCOPE) &&
            selector !== '.view-desktop' &&
            !selector.startsWith('.modal')
        );
        expect(leaked).toEqual([]);
    });

    test('沿用原版的置中構成 —— 原本在 App.css 的 .App { text-align: center }', () => {
        const centering = declaring(desktopCss, 'text-align: center');
        expect(centering.map(rule => rule.selector)).toContain('.view-desktop');
    });

    test('置中只套在 view 根節點 —— 原版的 Modal 在 .App 外面，本來就沒被置中', () => {
        expect(selectorsOf(desktopCss)).not.toContain(DESKTOP_SCOPE);

        const roots = declaring(desktopCss, 'text-align: center')
            .filter(rule => !rule.selector.includes(' '));
        expect(roots.map(rule => rule.selector)).toEqual(['.view-desktop']);
    });

    test('已選課程的 Modal 是 portal 到 body 的，樣式不能只靠祖先 class', () => {
        expect(selectorsOf(desktopCss)).toContain('.modal');

        expect(selectorsOf(desktopCss)).toContain(DESKTOP_SCOPE + ' .custom-scrollbar');
        expect(selectorsOf(desktopCss)).toContain(DESKTOP_SCOPE + ' .table-first-row-white tr:first-child');
    });

    test('已選課程 Modal 的滑入動畫：.modal 有起始狀態，.modal.show 歸零', () => {
        const closed = rules(desktopCss).find(rule => rule.selector === '.modal');
        const open = rules(desktopCss).find(rule => rule.selector === '.modal.show');

        expect(closed.body).toContain('transition');
        expect(closed.body).toContain('margin-top: 100%');
        expect(open.body).toContain('margin-top: 0');
    });

    test('課表格子的顏色保留 !important —— 要壓過 Bootstrap 的 .table 規則', () => {
        const used = declaring(desktopCss, 'rgb(199, 241, 208)');
        expect(used).toHaveLength(1);
        expect(used[0].selector).toBe(DESKTOP_SCOPE + ' .used-course-td');
        expect(used[0].body).toContain('!important');
    });
});

describe('手機樣式', () => {
    test('每一條規則都關在 .view-mobile 底下', () => {
        const outsideView = ['body', 'footer', 'html'];
        const portaled = ['.filter-sheet', '.offcanvas'];
        const leaked = selectorsOf(mobileCss).filter(selector =>
            !selector.startsWith('.view-mobile') &&
            !outsideView.includes(selector) &&
            !portaled.some(prefix => selector.startsWith(prefix))
        );
        expect(leaked).toEqual([]);
    });

    test('不含 min-width: 992px 的規則 —— 手機版只在 992px 以下掛載', () => {
        expect(mobileCss).not.toContain('min-width: 992px');
    });

    test('搜尋框與原生 select 的字級至少 16px，避免 iOS 聚焦時整頁放大', () => {
        const searchBar = rules(mobileCss).find(r => r.selector === '.view-mobile .search-bar');
        const select = rules(mobileCss).find(r => r.selector === '.view-mobile .filter-field select');
        expect(searchBar.body).toContain('font-size: 16px');
        expect(select.body).toContain('font-size: 16px');
    });
});

describe('共用樣式', () => {
    test('只放兩邊共用的骨架，不含任何 view 專屬的規則', () => {
        const viewSpecific = selectorsOf(sharedCss).filter(selector =>
            selector.includes('view-desktop') || selector.includes('view-mobile')
        );
        expect(viewSpecific).toEqual([]);
    });

    test('頁面背景維持原版的漸層，沒有多加 background-attachment', () => {
        expect(sharedCss).toContain('linear-gradient(to right top, rgb(235, 154, 133), rgb(148, 214, 235))');
        expect(sharedCss).not.toContain('background-attachment');
    });
});
