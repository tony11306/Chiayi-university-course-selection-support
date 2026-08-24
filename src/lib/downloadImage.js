export function isIOS() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent ?? '';
    return /iP(hone|ad|od)/.test(ua) || (ua.includes('Macintosh') && (navigator.maxTouchPoints ?? 0) > 1);
}

export function canvasToBlob(canvas, type = 'image/png') {
    return new Promise((resolve, reject) => {
        if (typeof canvas.toBlob === 'function') {
            canvas.toBlob(
                blob => (blob ? resolve(blob) : reject(new Error('canvas 轉檔失敗'))),
                type
            );
            return;
        }
        try {
            resolve(dataUrlToBlob(canvas.toDataURL(type)));
        } catch (error) {
            reject(error);
        }
    });
}

export function dataUrlToBlob(dataUrl) {
    const [header, data] = dataUrl.split(',');
    const type = header.match(/:(.*?);/)?.[1] ?? 'image/png';
    if (!header.includes('base64')) {
        return new Blob([decodeURIComponent(data)], { type });
    }
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; ++i) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type });
}

function createUrl(blob) {
    if (typeof URL.createObjectURL !== 'function') {
        throw new Error('這個瀏覽器不支援圖片下載');
    }
    const url = URL.createObjectURL(blob);
    setTimeout(() => URL.revokeObjectURL?.(url), 60000);
    return url;
}

async function shareImage(blob, fileName) {
    if (typeof File !== 'function' || !navigator.share) return null;
    const file = new File([blob], fileName, { type: blob.type || 'image/png' });
    if (navigator.canShare && !navigator.canShare({ files: [file] })) return null;

    try {
        await navigator.share({ files: [file], title: fileName });
        return 'shared';
    } catch (error) {
        if (error?.name === 'AbortError') return 'cancelled';
        return null;
    }
}

function downloadViaLink(blob, fileName) {
    const link = document.createElement('a');
    link.href = createUrl(blob);
    link.download = fileName;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    return 'downloaded';
}

export async function saveImageBlob(blob, fileName) {
    if (isIOS()) {
        const shared = await shareImage(blob, fileName);
        if (shared) return shared;
    }

    if ('download' in document.createElement('a')) {
        return downloadViaLink(blob, fileName);
    }

    const shared = await shareImage(blob, fileName);
    if (shared) return shared;

    const opened = window.open(createUrl(blob), '_blank');
    if (!opened) throw new Error('無法開啟圖片');
    return 'opened';
}
