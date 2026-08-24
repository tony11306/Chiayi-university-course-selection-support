import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseSelectionTable from './courseSelectionTable';
import { renderWithStore } from '../testUtils/render';
import { MOBILE_WIDTH, DESKTOP_WIDTH } from '../testUtils/viewport';

const getCourseDatas = vi.hoisted(() => vi.fn());
vi.mock('../api/course', () => ({ getCourseDatas }));

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

const dataStructure = makeCourse();
const algorithms = makeCourse({
    開課序號: '02',
    永久課號: 'CS201',
    課程名稱: '演算法',
    授課老師: '陳志明',
    上課時間: [{ 星期: '三', 開始節次: '5', 結束節次: '7' }],
});
const literature = makeCourse({
    開課系號: 'CH',
    開課序號: '03',
    永久課號: 'CH101',
    課程名稱: '台灣文學與電影',
    授課老師: '蔡宜真',
    上課系所: '中文系',
    校區: '民雄校區',
    上課時間: [{ 星期: '一', 開始節次: '3', 結束節次: '4' }],
});

function respondWith(courses) {
    getCourseDatas.mockResolvedValue({ data: { semester: '114-1', result: courses } });
}

function renderTable({ courses, hideConflicted = false, keyword = '', width = MOBILE_WIDTH } = {}) {
    window.innerWidth = width;
    return renderWithStore(
        <CourseSelectionTable
            displaySettings={{ keyword, isShowedConflictedCourses: !hideConflicted }}
        />,
        { courses }
    );
}

beforeEach(() => {
    localStorage.clear();
    getCourseDatas.mockReset();
});

afterEach(() => {
    window.innerWidth = DESKTOP_WIDTH;
});

test('手機與桌機用同一份 DOM，密度交給 CSS', async () => {
    respondWith([dataStructure, algorithms]);
    const { unmount } = renderTable({ width: MOBILE_WIDTH });

    const mobileList = await screen.findByTestId('course-list');
    expect(within(mobileList).getAllByRole('button', { name: /^加入/ })).toHaveLength(2);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    const mobileHtml = mobileList.innerHTML;
    unmount();

    respondWith([dataStructure, algorithms]);
    renderTable({ width: DESKTOP_WIDTH });

    const desktopList = await screen.findByTestId('course-list');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(desktopList.innerHTML).toBe(mobileHtml);
});

test('桌機也是按鈕加入，不是 16px 的勾選框', async () => {
    respondWith([dataStructure]);
    renderTable({ width: DESKTOP_WIDTH });

    expect(await screen.findByRole('button', { name: '加入 資料結構' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
});

test('已經選過的課不會出現在清單裡', async () => {
    respondWith([dataStructure, algorithms]);
    renderTable({ courses: [dataStructure] });

    expect(await screen.findByText('演算法')).toBeInTheDocument();
    expect(screen.queryByText('資料結構')).not.toBeInTheDocument();
});

test('關鍵字可以搜課名、系所、老師與學制', async () => {
    respondWith([dataStructure, literature]);
    const { unmount } = renderTable({ keyword: '中文系' });
    expect(await screen.findByText('台灣文學與電影')).toBeInTheDocument();
    expect(screen.queryByText('資料結構')).not.toBeInTheDocument();
    unmount();

    respondWith([dataStructure, literature]);
    renderTable({ keyword: '王偉倫' });
    expect(await screen.findByText('資料結構')).toBeInTheDocument();
    expect(screen.queryByText('台灣文學與電影')).not.toBeInTheDocument();
});

test('衝堂的課不能加入，並說明撞到哪一門', async () => {
    respondWith([literature]);
    renderTable({ courses: [dataStructure] });

    expect(await screen.findByText('台灣文學與電影')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '加入 台灣文學與電影' })).toBeDisabled();
    expect(screen.getByText(/和「資料結構」衝堂/)).toBeInTheDocument();
});

test('打開隱藏衝堂會濾掉衝堂的課，並說明藏了幾門', async () => {
    respondWith([literature, algorithms]);
    renderTable({ courses: [dataStructure], hideConflicted: true });

    expect(await screen.findByText('演算法')).toBeInTheDocument();
    expect(screen.queryByText('台灣文學與電影')).not.toBeInTheDocument();
    expect(screen.getByText(/已隱藏 1 門衝堂/)).toBeInTheDocument();
});

test('顯示結果數量', async () => {
    respondWith([dataStructure, algorithms]);
    renderTable();
    expect(await screen.findByText(/2 門課/)).toBeInTheDocument();
});

test('按加入會把課移出清單', async () => {
    respondWith([dataStructure, algorithms]);
    renderTable();

    await userEvent.click(await screen.findByRole('button', { name: '加入 資料結構' }));

    await waitFor(() => expect(screen.queryByText('資料結構')).not.toBeInTheDocument());
    expect(screen.getByText('演算法')).toBeInTheDocument();
});

test('加入之後原本衝堂的課會被標成衝堂', async () => {
    respondWith([dataStructure, literature]);
    renderTable();

    expect(await screen.findByRole('button', { name: '加入 台灣文學與電影' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: '加入 資料結構' }));

    await waitFor(() =>
        expect(screen.getByRole('button', { name: '加入 台灣文學與電影' })).toBeDisabled()
    );
});

test('載入中顯示提示', () => {
    getCourseDatas.mockReturnValue(new Promise(() => {}));
    renderTable();
    expect(screen.getByText(/載入中/)).toBeInTheDocument();
});

test('載入失敗顯示錯誤', async () => {
    getCourseDatas.mockRejectedValue(new Error('壞了'));
    renderTable();
    expect(await screen.findByText(/發生錯誤/)).toBeInTheDocument();
});

test('沒有符合的課顯示查無結果', async () => {
    respondWith([]);
    renderTable();
    expect(await screen.findByText(/查無結果/)).toBeInTheDocument();
});
