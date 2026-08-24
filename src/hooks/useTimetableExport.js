import { useCallback, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { canvasToBlob, saveImageBlob } from '../lib/downloadImage';
import { EXPORT_FILE_NAME } from '../shared/timetableSheet';
import { useGlobalData } from './useGlobalData';

// 固定倍率，不跟著裝置的 devicePixelRatio 跑，手機（dpr 3）跟桌機（dpr 1）
// 才會輸出同樣尺寸的圖。
export const EXPORT_SCALE = 2;

export function useTimetableExport() {
    const { showToast } = useGlobalData();
    const sheetRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const exportSheet = useCallback(async () => {
        const sheet = sheetRef.current;
        if (!sheet || isExporting) return;

        setIsExporting(true);
        try {
            const canvas = await html2canvas(sheet, {
                backgroundColor: null,
                scale: EXPORT_SCALE,
                logging: false,
            });
            const blob = await canvasToBlob(canvas);
            const result = await saveImageBlob(blob, EXPORT_FILE_NAME);

            if (result === 'cancelled') return;
            if (result === 'opened') {
                showToast({ title: '已產生課表圖片', meta: '長按圖片即可儲存' });
            } else if (result === 'shared') {
                showToast({ title: `已產生 ${EXPORT_FILE_NAME}` });
            } else {
                showToast({ title: `已下載 ${EXPORT_FILE_NAME}` });
            }
        } catch {
            showToast({ title: '圖片產生失敗，請再試一次' });
        } finally {
            setIsExporting(false);
        }
    }, [isExporting, showToast]);

    return { sheetRef, exportSheet, isExporting };
}
