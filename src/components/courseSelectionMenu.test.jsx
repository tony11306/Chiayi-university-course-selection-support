import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseSelectionMenu from './courseSelectionMenu';
import { useGlobalData } from '../hooks/useGlobalData';
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

function TabProbe() {
    const { activeTab, setActiveTab } = useGlobalData();
    return (
        <>
            <span data-testid="active-tab">{activeTab}</span>
            <button type="button" onClick={() => setActiveTab('search')}>去找課</button>
        </>
    );
}

function renderMenu({ courses, width = MOBILE_WIDTH } = {}) {
    window.innerWidth = width;
    return renderWithStore(
        <>
            <TabProbe />
            <CourseSelectionMenu />
        </>,
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

test('手機在清單上方常駐課表預覽', async () => {
    renderMenu({ courses: [dataStructure] });
    await screen.findByText('演算法');

    expect(screen.getAllByTestId(/^mini-slot-/)).toHaveLength(84);
    expect(screen.getByTestId('mini-slot-一-1')).toHaveAttribute('data-state', 'occupied');
});

test('桌機不需要預覽，因為課表就在旁邊', async () => {
    renderMenu({ courses: [dataStructure], width: DESKTOP_WIDTH });
    await screen.findByText('【大學部】演算法');

    expect(screen.queryAllByTestId(/^mini-slot-/)).toHaveLength(0);
});

test('加課之後預覽的格子立刻變成已佔用', async () => {
    renderMenu();
    await userEvent.click(await screen.findByRole('button', { name: '加入 資料結構' }));

    await waitFor(() =>
        expect(screen.getByTestId('mini-slot-一-1')).toHaveAttribute('data-state', 'occupied')
    );
    expect(screen.getByTestId('mini-slot-一-1')).toHaveAttribute('data-highlight', 'true');
});

test('輕觸課程卡會在預覽上標出它的位置', async () => {
    renderMenu();
    await userEvent.click(await screen.findByText('演算法'));

    expect(screen.getByTestId('mini-slot-三-5')).toHaveAttribute('data-state', 'preview');
    // 課卡一個、預覽圖例一個
    expect(screen.getAllByText('演算法')).toHaveLength(2);
});

test('再輕觸一次會取消預覽', async () => {
    renderMenu();
    const card = async () => within(await screen.findByTestId('course-card-list')).getByText('演算法');

    await userEvent.click(await card());
    expect(screen.getByTestId('mini-slot-三-5')).toHaveAttribute('data-state', 'preview');

    await userEvent.click(await card());
    expect(screen.getByTestId('mini-slot-三-5')).toHaveAttribute('data-state', 'free');
});

test('預覽衝堂的課會標成 conflict', async () => {
    const overlapping = makeCourse({
        開課序號: '03',
        永久課號: 'CS301',
        課程名稱: '程式設計(一)',
        上課時間: [{ 星期: '一', 開始節次: '3', 結束節次: '4' }],
    });
    getCourseDatas.mockResolvedValue({ data: { semester: '114-1', result: [overlapping] } });
    renderMenu({ courses: [dataStructure] });

    await userEvent.click(await screen.findByText('程式設計(一)'));
    expect(screen.getByTestId('mini-slot-一-2')).toHaveAttribute('data-state', 'conflict');
});

test('點課表預覽會切到課表分頁', async () => {
    renderMenu({ courses: [dataStructure] });
    await screen.findByText('演算法');

    await userEvent.click(screen.getByRole('button', { name: '去找課' }));
    expect(screen.getByTestId('active-tab')).toHaveTextContent('search');

    await userEvent.click(screen.getByRole('button', { name: /完整課表/ }));
    expect(screen.getByTestId('active-tab')).toHaveTextContent('timetable');
});
