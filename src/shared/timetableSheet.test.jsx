import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cookies from 'js-cookie';
import DesktopTimeTable from '../desktop/timeTable';
import MobileTimeTable from '../mobile/timeTable';
import { renderWithStore } from '../testUtils/render';
import { DESKTOP_WIDTH, MOBILE_WIDTH } from '../testUtils/viewport';

const html2canvas = vi.hoisted(() => vi.fn());
vi.mock('html2canvas', () => ({ default: html2canvas }));

const dataStructure = {
    開課系號: 'CS',
    開課序號: '01',
    永久課號: 'CS101',
    校區: '蘭潭校區',
    適用年級: '2',
    上課系所: '資工系',
    課程名稱: '資料結構',
    授課老師: '王偉倫',
    學分數: '3',
    上課教室: '工程館 A203',
    上課學制: '大學部',
    教學大綱: '',
    上課時間: [{ 星期: '一', 開始節次: '2', 結束節次: '4' }],
};

beforeEach(() => {
    localStorage.clear();
    Cookies.remove('isShowTeacherButtonOn');
    Cookies.remove('isShowClassroomButtonOn');
    html2canvas.mockReset();
    html2canvas.mockResolvedValue({ toBlob: callback => callback(new Blob(['png'], { type: 'image/png' })) });
    // jsdom 會對真的 <a> 點擊噴 navigation 警告
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
    window.innerWidth = DESKTOP_WIDTH;
});

function sheetHtmlOf(ui, width) {
    window.innerWidth = width;
    const { unmount } = renderWithStore(ui, { courses: [dataStructure] });
    const html = screen.getByTestId('timetable-export-root').outerHTML;
    unmount();
    return html;
}

test('桌機與手機匯出的是同一份課表，DOM 完全一樣', () => {
    const desktopSheet = sheetHtmlOf(<DesktopTimeTable />, DESKTOP_WIDTH);
    const mobileSheet = sheetHtmlOf(<MobileTimeTable />, MOBILE_WIDTH);

    expect(mobileSheet).toBe(desktopSheet);
});

test('手機在「當日」檢視也照樣匯出整週的課表', () => {
    window.innerWidth = MOBILE_WIDTH;
    renderWithStore(<MobileTimeTable />, { courses: [dataStructure] });

    // 畫面上只有當日議程，但匯出用的課表一直都在（預設畫週一～五）
    expect(screen.queryByRole('columnheader', { name: '星期六' })).not.toBeInTheDocument();
    const sheet = screen.getByTestId('timetable-export-root');
    expect(sheet.textContent).toContain('星期五');
    expect(sheet.textContent).not.toContain('星期六');
    expect(sheet.querySelectorAll('[data-state="occupied"]')).toHaveLength(3);
});

test('匯出的課表預設畫到第 8 節，800px 寬、有節\\日 表頭、不吃 Bootstrap 的 .table', () => {
    renderWithStore(<DesktopTimeTable />, { courses: [dataStructure] });
    const sheet = screen.getByTestId('timetable-export-root');

    expect(sheet).toHaveClass('timetable-sheet');
    expect(sheet.textContent).toContain('節\\日');
    expect(sheet.textContent).toContain('第 F 節');
    expect(sheet.querySelector('table')).not.toHaveClass('table');
    expect(sheet.querySelectorAll('tbody tr')).toHaveLength(9);
    expect(sheet.querySelectorAll('thead th')).toHaveLength(6);
    expect(sheet.textContent).toContain('第 8 節');
    expect(sheet.textContent).not.toContain('第 9 節');
});

test('選到週六的課，匯出的課表會長出星期六', () => {
    const saturday = { ...dataStructure, 永久課號: 'CS900', 上課時間: [{ 星期: '六', 開始節次: '2', 結束節次: '3' }] };
    renderWithStore(<DesktopTimeTable />, { courses: [saturday] });

    const sheet = screen.getByTestId('timetable-export-root');
    expect(sheet.textContent).toContain('星期六');
});

test('選到第八節以後的課，匯出的課表會長出那些節次', () => {
    const night = { ...dataStructure, 永久課號: 'CS901', 上課時間: [{ 星期: '二', 開始節次: 'A', 結束節次: 'B' }] };
    renderWithStore(<DesktopTimeTable />, { courses: [night] });

    const sheet = screen.getByTestId('timetable-export-root');
    expect(sheet.textContent).toContain('第 B 節');
    expect(sheet.textContent).not.toContain('第 C 節');
});

test('匯出的課表不含開關與下載按鈕（那些不該被截進圖裡）', () => {
    renderWithStore(<DesktopTimeTable />, { courses: [dataStructure] });
    const sheet = screen.getByTestId('timetable-export-root');

    expect(sheet.querySelectorAll('input, button')).toHaveLength(0);
});

test('老師 / 教室的開關會跟著進到匯出的課表', async () => {
    renderWithStore(<DesktopTimeTable />, { courses: [dataStructure] });
    const sheet = () => screen.getByTestId('timetable-export-root');

    expect(sheet().textContent).not.toContain('王偉倫');
    await userEvent.click(screen.getByLabelText('顯示授課老師'));
    expect(sheet().textContent).toContain('王偉倫');

    await userEvent.click(screen.getByLabelText('顯示課堂教室'));
    expect(sheet().textContent).toContain('工程館 A203');
});

test('匯出用的課表對輔助技術隱藏，不會被讀兩次', () => {
    renderWithStore(<DesktopTimeTable />, { courses: [dataStructure] });

    expect(screen.getByTestId('timetable-export-root').closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getAllByRole('columnheader', { name: '星期一' })).toHaveLength(1);
});

test('截圖用固定倍率，手機與桌機才會輸出同尺寸的圖', async () => {
    renderWithStore(<DesktopTimeTable />, { courses: [dataStructure] });

    await userEvent.click(screen.getByTitle('下載課表'));

    await waitFor(() => expect(html2canvas).toHaveBeenCalledTimes(1));
    const [node, options] = html2canvas.mock.calls[0];
    expect(node).toBe(screen.getByTestId('timetable-export-root'));
    expect(options.scale).toBe(2);
    expect(options.backgroundColor).toBeNull();
});
