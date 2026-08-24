import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { canvasToBlob, dataUrlToBlob, isIOS, saveImageBlob } from './downloadImage';

const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit Safari';
const WINDOWS_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit Chrome';

function fakeCanvas({ withToBlob = true } = {}) {
    return withToBlob
        ? { toBlob: callback => callback(new Blob(['png'], { type: 'image/png' })) }
        : { toDataURL: () => 'data:image/png;base64,QUJD' };
}

function pretendUserAgent(userAgent, maxTouchPoints = 0) {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
    Object.defineProperty(navigator, 'maxTouchPoints', { value: maxTouchPoints, configurable: true });
}

let createdUrls;
let clicked;

beforeEach(() => {
    createdUrls = [];
    clicked = [];
    pretendUserAgent(WINDOWS_UA);
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
        const url = `blob:test-${createdUrls.length}`;
        createdUrls.push(url);
        return url;
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click() {
        clicked.push({ href: this.href, download: this.download, inDocument: document.body.contains(this) });
    });
});

afterEach(() => {
    vi.restoreAllMocks();
    delete navigator.share;
    delete navigator.canShare;
    delete navigator.maxTouchPoints;
});

describe('canvasToBlob', () => {
    test('有 toBlob 就直接用', async () => {
        const blob = await canvasToBlob(fakeCanvas());
        expect(blob.type).toBe('image/png');
    });

    test('沒有 toBlob 的舊瀏覽器退回 dataURL', async () => {
        const blob = await canvasToBlob(fakeCanvas({ withToBlob: false }));
        expect(await blob.text()).toBe('ABC');
    });

    test('toBlob 給 null 就當失敗', async () => {
        await expect(canvasToBlob({ toBlob: callback => callback(null) })).rejects.toThrow();
    });
});

test('dataUrlToBlob 保留 MIME type', () => {
    expect(dataUrlToBlob('data:image/png;base64,QUJD').type).toBe('image/png');
});

describe('saveImageBlob', () => {
    const blob = () => new Blob(['png'], { type: 'image/png' });

    function stubShare({ result = Promise.resolve(), canShare = true } = {}) {
        navigator.canShare = vi.fn(() => canShare);
        navigator.share = vi.fn(() => result);
    }

    test('用 blob: 連結下載，而且連結真的掛進 document 才點（iOS 不吃沒掛上去的連結）', async () => {
        const result = await saveImageBlob(blob(), '選課結果.png');

        expect(result).toBe('downloaded');
        expect(clicked).toHaveLength(1);
        expect(clicked[0].download).toBe('選課結果.png');
        expect(clicked[0].inDocument).toBe(true);
        expect(clicked[0].href).toContain('blob:');
        expect(document.querySelector('a')).toBeNull();
    });

    test('不再用 data:image/octet-stream —— 那個在 iOS Safari 只會失敗', async () => {
        await saveImageBlob(blob(), '選課結果.png');
        expect(clicked[0].href).not.toContain('octet-stream');
        expect(clicked[0].href).not.toContain('data:');
    });

    test('桌機即使有 Web Share 也照樣下載，不跳系統分享視窗', async () => {
        stubShare();

        expect(await saveImageBlob(blob(), '選課結果.png')).toBe('downloaded');
        expect(navigator.share).not.toHaveBeenCalled();
        expect(clicked).toHaveLength(1);
    });

    test('iOS 優先走分享面板，才存得進照片', async () => {
        pretendUserAgent(IPHONE_UA);
        stubShare();

        expect(await saveImageBlob(blob(), '選課結果.png')).toBe('shared');
        expect(navigator.share.mock.calls[0][0].files[0].name).toBe('選課結果.png');
        expect(clicked).toHaveLength(0);
    });

    test('會假裝自己是 Mac 的 iPad 也走分享面板', async () => {
        pretendUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari', 5);
        stubShare();

        expect(await saveImageBlob(blob(), '選課結果.png')).toBe('shared');
    });

    test('iOS 使用者在分享面板按取消，就不再硬塞一次下載', async () => {
        pretendUserAgent(IPHONE_UA);
        stubShare({ result: Promise.reject(Object.assign(new Error('cancel'), { name: 'AbortError' })) });

        expect(await saveImageBlob(blob(), '選課結果.png')).toBe('cancelled');
        expect(clicked).toHaveLength(0);
    });

    test('iOS 的分享被瀏覽器擋掉（點擊授權過期）就退回一般下載', async () => {
        pretendUserAgent(IPHONE_UA);
        stubShare({ result: Promise.reject(Object.assign(new Error('nope'), { name: 'NotAllowedError' })) });

        expect(await saveImageBlob(blob(), '選課結果.png')).toBe('downloaded');
        expect(clicked).toHaveLength(1);
    });

    test('iOS 上 canShare 說不能分享檔案就直接下載', async () => {
        pretendUserAgent(IPHONE_UA);
        stubShare({ canShare: false });

        expect(await saveImageBlob(blob(), '選課結果.png')).toBe('downloaded');
        expect(navigator.share).not.toHaveBeenCalled();
    });

    test('iOS 上完全沒有分享 API 也還是下載得到', async () => {
        pretendUserAgent(IPHONE_UA);

        expect(await saveImageBlob(blob(), '選課結果.png')).toBe('downloaded');
    });

    test('不支援 download 屬性的老 iOS 改成開新視窗讓使用者長按存圖', async () => {
        pretendUserAgent(IPHONE_UA);
        const descriptor = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'download');
        delete HTMLAnchorElement.prototype.download;
        const open = vi.spyOn(window, 'open').mockReturnValue({});

        try {
            expect(await saveImageBlob(blob(), '選課結果.png')).toBe('opened');
            expect(open).toHaveBeenCalledWith(expect.stringContaining('blob:'), '_blank');
        } finally {
            Object.defineProperty(HTMLAnchorElement.prototype, 'download', descriptor);
        }
    });

    test('object URL 不會馬上被 revoke，免得下載中斷', async () => {
        vi.useFakeTimers();
        try {
            await saveImageBlob(blob(), '選課結果.png');
            expect(URL.revokeObjectURL).not.toHaveBeenCalled();
            vi.advanceTimersByTime(60000);
            expect(URL.revokeObjectURL).toHaveBeenCalledWith(createdUrls[0]);
        } finally {
            vi.useRealTimers();
        }
    });
});

describe('isIOS', () => {
    test('認得 iPhone', () => {
        pretendUserAgent(IPHONE_UA);
        expect(isIOS()).toBe(true);
    });

    test('認得會假裝自己是 Mac 的 iPad', () => {
        pretendUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari', 5);
        expect(isIOS()).toBe(true);
    });

    test('真的 Mac 不算', () => {
        pretendUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari', 0);
        expect(isIOS()).toBe(false);
    });

    test('Windows 不算', () => {
        pretendUserAgent(WINDOWS_UA);
        expect(isIOS()).toBe(false);
    });
});
