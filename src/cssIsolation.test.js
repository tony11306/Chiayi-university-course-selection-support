import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

/**
 * 元件測試看不到 CSS（vitest 會把 CSS import 擋掉），而這個專案踩過的坑
 * 幾乎都在 CSS 層：桌機的格子被 Bootstrap 的 .table 蓋掉、scope 加到 view
 * 外面的元素上、置中被連著 App.css 一起刪掉。這裡直接讀樣式檔，守住約定。
 */

function stripComments(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** 依逗號切選擇器，但要跳過 :is(...) 這種括號裡面的逗號。 */
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

/** 攤平出所有規則的 { selector, body }；@keyframes 的內容不算規則。 */
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
                // 內容是 0% / 100% 這種關鍵影格，不是選擇器
            } else if (prelude.startsWith('@')) {
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
        // 沒有任何規則直接套在 :is(...) 這個組合的根節點上
        expect(selectorsOf(desktopCss)).not.toContain(DESKTOP_SCOPE);
        // 根節點層級（選擇器沒有後代）宣告置中的只有 .view-desktop 一條；
        // .curriculum-table td 的置中是格子自己的，不算在內
        const roots = declaring(desktopCss, 'text-align: center')
            .filter(rule => !rule.selector.includes(' '));
        expect(roots.map(rule => rule.selector)).toEqual(['.view-desktop']);
    });

    test('已選課程的 Modal 是 portal 到 body 的，樣式不能只靠祖先 class', () => {
        // .modal 本身不能被 scope，否則 portal 出去的那個節點就選不到了
        expect(selectorsOf(desktopCss)).toContain('.modal');
        // Modal 裡面的表格用到的 class 要連 .desktop-modal 一起選
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
        // .table>:not(caption)>*>* 的特異度是 (0,1,3)，會把背景色蓋成 transparent
        const used = declaring(desktopCss, 'rgb(199, 241, 208)');
        expect(used).toHaveLength(1);
        expect(used[0].selector).toBe(DESKTOP_SCOPE + ' .used-course-td');
        expect(used[0].body).toContain('!important');
    });
});

describe('手機樣式', () => {
    test('每一條規則都關在 .view-mobile 底下', () => {
        // body / footer 在 view 外面（寫在 index.html），加了 scope 就永遠不生效
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
