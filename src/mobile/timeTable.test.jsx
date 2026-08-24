import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cookies from 'js-cookie';
import TimeTable from './timeTable';
import { renderWithStore } from '../testUtils/render';
import { setViewportWidth, MOBILE_WIDTH, DESKTOP_WIDTH } from '../testUtils/viewport';
import { useGlobalData } from '../hooks/useGlobalData';

function ToastProbe() {
    const { toast } = useGlobalData();
    return toast ? <span data-testid="toast-title">{toast.title}</span> : null;
}

const html2canvas = vi.hoisted(() => vi.fn());
vi.mock('html2canvas', () => ({ default: html2canvas }));

function makeCourse(overrides = {}) {
    return {
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
        ...overrides,
    };
}

const monday = makeCourse();
const wednesday = makeCourse({
    永久課號: 'MA101',
    課程名稱: '微積分(二)',
    授課老師: '李國賢',
    上課教室: '理學院 B201',
    上課時間: [{ 星期: '三', 開始節次: '3', 結束節次: '4' }],
});

beforeEach(() => {
    localStorage.clear();
    Cookies.remove('isShowTeacherButtonOn');
    Cookies.remove('isShowClassroomButtonOn');
    html2canvas.mockReset();

    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-08-26T09:00:00'));
    // jsdom 會對真的 <a> 點擊噴 navigation 警告
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.innerWidth = DESKTOP_WIDTH;
});

test('桌機畫出整週表格，不出現星期分頁', () => {
    window.innerWidth = DESKTOP_WIDTH;
    renderWithStore(<TimeTable />, { courses: [monday] });

    expect(screen.getByRole('columnheader', { name: '星期一' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '星期六' })).toBeInTheDocument();
    expect(screen.queryByRole('tablist', { name: '星期' })).not.toBeInTheDocument();
});

test('手機出現星期分頁與當日議程，而不是週表格', () => {
    window.innerWidth = MOBILE_WIDTH;
    renderWithStore(<TimeTable />, { courses: [monday, wednesday] });

    expect(screen.getByRole('tablist', { name: '星期' })).toBeInTheDocument();

    expect(screen.getByText('微積分(二)')).toBeInTheDocument();
    expect(screen.getByText('第 3–4 節')).toBeInTheDocument();
});

test('手機的星期分頁顯示每天有幾堂', () => {
    window.innerWidth = MOBILE_WIDTH;
    renderWithStore(<TimeTable />, { courses: [monday, wednesday] });

    expect(screen.getByRole('tab', { name: /星期一 1 堂/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /星期二 0 堂/ })).toBeInTheDocument();
});

test('手機可以切換星期', async () => {
    window.innerWidth = MOBILE_WIDTH;
    renderWithStore(<TimeTable />, { courses: [monday, wednesday] });

    await userEvent.click(screen.getByRole('tab', { name: /星期一/ }));
    expect(screen.getByText('資料結構')).toBeInTheDocument();
    expect(screen.queryByText('微積分(二)')).not.toBeInTheDocument();
});

test('手機切到「週」會顯示整週表格', async () => {
    window.innerWidth = MOBILE_WIDTH;
    renderWithStore(<TimeTable />, { courses: [monday] });

    await userEvent.click(screen.getByRole('tab', { name: /整週/ }));
    expect(screen.getByRole('columnheader', { name: '星期一' })).toBeInTheDocument();
});

test('星期日時預設顯示星期一', () => {
    vi.setSystemTime(new Date('2026-08-30T09:00:00'));
    window.innerWidth = MOBILE_WIDTH;
    renderWithStore(<TimeTable />, { courses: [monday] });

    expect(screen.getByRole('tab', { name: /星期一/, selected: true })).toBeInTheDocument();
});

test('視窗放大到桌機寬度時，星期分頁會收掉', () => {
    window.innerWidth = MOBILE_WIDTH;
    renderWithStore(<TimeTable />, { courses: [monday] });
    expect(screen.getByRole('tablist', { name: '星期' })).toBeInTheDocument();

    setViewportWidth(DESKTOP_WIDTH);
    expect(screen.queryByRole('tablist', { name: '星期' })).not.toBeInTheDocument();
});

test('顯示授課老師的開關會影響議程並記進 cookie', async () => {
    window.innerWidth = MOBILE_WIDTH;
    renderWithStore(<TimeTable />, { courses: [wednesday] });

    const agenda = () => within(screen.getByTestId('day-agenda'));
    expect(agenda().queryByText(/李國賢/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('顯示授課老師'));

    expect(agenda().getByText(/李國賢/)).toBeInTheDocument();
    expect(Cookies.get('isShowTeacherButtonOn')).toBe('true');
});

test('顯示課堂教室的開關會影響議程', async () => {
    window.innerWidth = MOBILE_WIDTH;
    renderWithStore(<TimeTable />, { courses: [wednesday] });

    await userEvent.click(screen.getByLabelText('顯示課堂教室'));
    expect(within(screen.getByTestId('day-agenda')).getByText(/理學院 B201/)).toBeInTheDocument();
    expect(Cookies.get('isShowClassroomButtonOn')).toBe('true');
});

test('cookie 存在時沿用上次的開關狀態', () => {
    Cookies.set('isShowTeacherButtonOn', 'true');
    window.innerWidth = MOBILE_WIDTH;
    renderWithStore(<TimeTable />, { courses: [wednesday] });

    expect(screen.getByLabelText('顯示授課老師')).toBeChecked();
    expect(within(screen.getByTestId('day-agenda')).getByText(/李國賢/)).toBeInTheDocument();
});

test('匯出時把共用的匯出課表交給 html2canvas', async () => {
    html2canvas.mockResolvedValue({ toBlob: callback => callback(new Blob(['png'], { type: 'image/png' })) });
    window.innerWidth = DESKTOP_WIDTH;
    renderWithStore(<TimeTable />, { courses: [monday] });

    await userEvent.click(screen.getByRole('button', { name: /下載課表/ }));

    await waitFor(() => expect(html2canvas).toHaveBeenCalledTimes(1));
    expect(html2canvas.mock.calls[0][0]).toBe(screen.getByTestId('timetable-export-root'));
});

test('匯出用的課表不再靠 inline style 撐版面，畫面上的課表也不會被動到', async () => {
    html2canvas.mockResolvedValue({ toBlob: callback => callback(new Blob(['png'], { type: 'image/png' })) });
    window.innerWidth = DESKTOP_WIDTH;
    renderWithStore(<TimeTable />, { courses: [monday] });

    const exportRoot = screen.getByTestId('timetable-export-root');
    await userEvent.click(screen.getByRole('button', { name: /下載課表/ }));

    await waitFor(() => expect(html2canvas).toHaveBeenCalled());
    expect(exportRoot.getAttribute('style')).toBeNull();
    expect(screen.getByRole('table')).toHaveClass('week-grid');
});

test('下載成功後跳提示', async () => {
    html2canvas.mockResolvedValue({ toBlob: callback => callback(new Blob(['png'], { type: 'image/png' })) });
    window.innerWidth = DESKTOP_WIDTH;
    renderWithStore(<><TimeTable /><ToastProbe /></>, { courses: [monday] });

    await userEvent.click(screen.getByRole('button', { name: /下載課表/ }));

    expect(await screen.findByTestId('toast-title')).toHaveTextContent('已下載 選課結果.png');
});

test('截圖失敗會跳提示，而不是安靜地什麼都沒發生', async () => {
    html2canvas.mockRejectedValue(new Error('canvas 掛了'));
    window.innerWidth = DESKTOP_WIDTH;
    renderWithStore(<><TimeTable /><ToastProbe /></>, { courses: [monday] });

    await userEvent.click(screen.getByRole('button', { name: /下載課表/ }));

    expect(await screen.findByTestId('toast-title')).toHaveTextContent('圖片產生失敗，請再試一次');
});

test('截圖中不讓重複點擊', async () => {
    html2canvas.mockImplementation(() => new Promise(() => {}));
    window.innerWidth = DESKTOP_WIDTH;
    renderWithStore(<TimeTable />, { courses: [monday] });

    const button = screen.getByRole('button', { name: /下載課表/ });
    await userEvent.click(button);

    await waitFor(() => expect(button).toBeDisabled());
    expect(html2canvas).toHaveBeenCalledTimes(1);
});

test('沒有選課時不讓匯出', () => {
    window.innerWidth = DESKTOP_WIDTH;
    renderWithStore(<TimeTable />, { courses: [] });
    expect(screen.getByRole('button', { name: /下載課表/ })).toBeDisabled();
});

test('週表格的節次帶著 occupied / free 狀態，顏色不靠 Bootstrap 的表格樣式', () => {
    window.innerWidth = DESKTOP_WIDTH;
    renderWithStore(<TimeTable />, { courses: [monday] });

    expect(screen.getByTestId('week-slot-一-1')).toHaveAttribute('data-state', 'occupied');
    expect(screen.getByTestId('week-slot-一-3')).toHaveAttribute('data-state', 'occupied');
    expect(screen.getByTestId('week-slot-一-4')).toHaveAttribute('data-state', 'free');
    expect(screen.getByTestId('week-slot-二-1')).toHaveAttribute('data-state', 'free');
});

test('課表不掛 Bootstrap 的 .table，避免 padding 與背景色被蓋掉', () => {
    window.innerWidth = DESKTOP_WIDTH;
    renderWithStore(<TimeTable />, { courses: [monday] });

    const grid = screen.getByRole('table');
    expect(grid).toHaveClass('week-grid');

    expect(grid).not.toHaveClass('table');
});
