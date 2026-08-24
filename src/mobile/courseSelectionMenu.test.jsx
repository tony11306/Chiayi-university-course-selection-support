import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { screen } from '@testing-library/react';
import CourseSelectionMenu from './courseSelectionMenu';
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
    上課時間: [{ 星期: '三', 開始節次: '5', 結束節次: '7' }],
});

function renderMenu({ courses, width = MOBILE_WIDTH } = {}) {
    window.innerWidth = width;
    return renderWithStore(
        <CourseSelectionMenu />,
        { courses }
    );
}

beforeEach(() => {
    localStorage.clear();
    getCourseDatas.mockReset();
    getCourseDatas.mockResolvedValue({ data: { semester: '114-1', result: [dataStructure, algorithms] } });
});

afterEach(() => {
    window.innerWidth = DESKTOP_WIDTH;
});

test('顯示學期', async () => {
    renderMenu();
    expect(await screen.findByText(/114-1/)).toBeInTheDocument();
});

test('搜尋列與篩選按鈕固定在同一區，清單在下面', async () => {
    renderMenu();

    const searchBar = await screen.findByPlaceholderText(/課名/);
    expect(searchBar.closest('.search-dock')).not.toBeNull();
    expect(screen.getByRole('button', { name: /^篩選/ })).toBeInTheDocument();
    expect(await screen.findByTestId('course-list')).toBeInTheDocument();
});

test('桌機沒有篩選按鈕，欄位直接排在頁面上', async () => {
    renderMenu({ width: DESKTOP_WIDTH });

    expect(await screen.findByLabelText('上課系所')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^篩選/ })).not.toBeInTheDocument();
});
