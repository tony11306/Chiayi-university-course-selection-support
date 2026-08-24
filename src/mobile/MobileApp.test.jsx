import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MobileApp from './MobileApp';
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
const wednesdayCourse = makeCourse({
    開課序號: '02',
    永久課號: 'CS201',
    課程名稱: '演算法',
    上課時間: [{ 星期: '三', 開始節次: '5', 結束節次: '7' }],
});

function renderApp({ courses, width = MOBILE_WIDTH } = {}) {
    window.innerWidth = width;
    return renderWithStore(<MobileApp />, { courses });
}

const mainTabs = () => within(screen.getByRole('tablist', { name: '主要分頁' }));

beforeEach(() => {
    localStorage.clear();
    getCourseDatas.mockReset();
    getCourseDatas.mockResolvedValue({
        data: { semester: '114-1', result: [dataStructure, wednesdayCourse] },
    });

    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-08-24T09:00:00'));
});

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.innerWidth = DESKTOP_WIDTH;
});

test('手機用底部分頁，預設在課表', () => {
    renderApp({ courses: [dataStructure] });

    expect(mainTabs().getByRole('tab', { name: /課表/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('day-agenda')).toBeInTheDocument();
    expect(screen.queryByText(/課程清單/)).not.toBeInTheDocument();
});

test('手機可以切到找課與已選', async () => {
    renderApp({ courses: [dataStructure] });

    await userEvent.click(mainTabs().getByRole('tab', { name: /找課/ }));
    expect(await screen.findByText(/課程清單/)).toBeInTheDocument();

    await userEvent.click(mainTabs().getByRole('tab', { name: /已選/ }));
    expect(screen.getByRole('button', { name: '移除 資料結構' })).toBeInTheDocument();
});

test('切換分頁時內容帶著滑入方向的 class，初次掛載不播動畫', async () => {
    renderApp({ courses: [dataStructure] });

    expect(document.querySelector('.tab-slide')).not.toBeInTheDocument();

    await userEvent.click(mainTabs().getByRole('tab', { name: /找課/ }));
    expect(document.querySelector('.tab-slide-forward')).toBeInTheDocument();

    await userEvent.click(mainTabs().getByRole('tab', { name: /已選/ }));
    expect(document.querySelector('.tab-slide-forward')).toBeInTheDocument();

    await userEvent.click(mainTabs().getByRole('tab', { name: /課表/ }));
    expect(document.querySelector('.tab-slide-back')).toBeInTheDocument();
});

test('切走的分頁保持掛載、只隱藏，切回來時狀態原封不動', async () => {
    renderApp({ courses: [dataStructure] });

    await userEvent.click(mainTabs().getByRole('tab', { name: /找課/ }));
    await userEvent.type(await screen.findByLabelText('搜尋課程'), '資料');

    await userEvent.click(mainTabs().getByRole('tab', { name: /課表/ }));

    // 找課面板還在，只是被藏起來
    const searchPanel = document.querySelector('.tab-panel-hidden');
    expect(searchPanel).not.toBeNull();
    expect(within(searchPanel).getByLabelText('搜尋課程')).toHaveValue('資料');

    await userEvent.click(mainTabs().getByRole('tab', { name: /找課/ }));
    expect(screen.getByLabelText('搜尋課程')).toHaveValue('資料');
});

test('已選分頁的徽章顯示門數', () => {
    renderApp({ courses: [dataStructure, wednesdayCourse] });
    expect(mainTabs().getByRole('tab', { name: /已選 2/ })).toBeInTheDocument();
});

test('加課後出現提示，按「看課表」會跳到那門課的星期', async () => {
    renderApp();

    await userEvent.click(mainTabs().getByRole('tab', { name: /找課/ }));
    await userEvent.click(await screen.findByRole('button', { name: '加入 演算法' }));

    expect(await screen.findByRole('status')).toHaveTextContent('已加入 演算法');

    await userEvent.click(screen.getByRole('button', { name: '看課表' }));

    expect(screen.getByRole('tab', { name: /星期三/, selected: true })).toBeInTheDocument();
    expect(within(screen.getByTestId('day-agenda')).getByText('演算法')).toBeInTheDocument();
});

test('移除後的「復原」會把課加回來', async () => {
    renderApp({ courses: [dataStructure] });

    await userEvent.click(mainTabs().getByRole('tab', { name: /已選/ }));
    await userEvent.click(screen.getByRole('button', { name: '移除 資料結構' }));

    await waitFor(() => expect(screen.getByText(/還沒選課/)).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: '復原' }));

    expect(await screen.findByRole('button', { name: '移除 資料結構' })).toBeInTheDocument();
});

test('清空後的「復原」會把整份課表還原', async () => {
    renderApp({ courses: [dataStructure, wednesdayCourse] });

    await userEvent.click(mainTabs().getByRole('tab', { name: /已選/ }));
    await userEvent.click(screen.getByRole('button', { name: /清空/ }));

    await waitFor(() => expect(screen.getByText(/還沒選課/)).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: '復原' }));

    expect(await screen.findByText(/2 門/)).toBeInTheDocument();
});

test('公告在手機上不再叫使用者去點右下角的書籤', () => {
    renderApp({ courses: [dataStructure] });
    expect(screen.queryByText(/右下角/)).not.toBeInTheDocument();
    expect(screen.getByText(/「已選」分頁/)).toBeInTheDocument();
});

test('聯絡資訊還在', () => {
    renderApp();
    expect(screen.getByText(/嘉義大學選課輔助器/)).toBeInTheDocument();
});
