import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DesktopApp from './DesktopApp';
import { renderWithStore } from '../testUtils/render';
import { DESKTOP_WIDTH } from '../testUtils/viewport';

const getCourseDatas = vi.hoisted(() => vi.fn());
vi.mock('../api/course', () => ({ getCourseDatas }));

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
    上課時間: [{ 星期: '一', 開始節次: '3', 結束節次: '4' }],
});

function renderDesktop({ courses } = {}) {
    window.innerWidth = DESKTOP_WIDTH;
    return renderWithStore(<DesktopApp />, { courses });
}

beforeEach(() => {
    localStorage.clear();
    getCourseDatas.mockReset();
    getCourseDatas.mockResolvedValue({ data: { semester: '114-1', result: [dataStructure, algorithms, literature] } });
    html2canvas.mockReset();
});

afterEach(() => {
    vi.restoreAllMocks();
});

test('課表與課程清單並排，沿用改版前的版面', async () => {
    const { container } = renderDesktop();

    expect(container.querySelector('.view-desktop')).toBeInTheDocument();
    expect(container.querySelectorAll('.row > .col')).toHaveLength(2);
    expect(await screen.findByText(/114-1 課程清單/)).toBeInTheDocument();
});

test('課表畫出 14 節 × 6 天，已選的格子上綠色', async () => {
    const { container } = renderDesktop({ courses: [dataStructure] });

    expect(screen.getByRole('columnheader', { name: '星期一' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '星期六' })).toBeInTheDocument();
    expect(container.querySelectorAll('.curriculum-table tbody tr')).toHaveLength(15);

    expect(container.querySelectorAll('.used-course-td')).toHaveLength(3);
    expect(within(container.querySelector('.curriculum-table')).getAllByText('【資料結構】')).toHaveLength(3);
});

test('第 C 節是 20:10 ~ 20:55，不會和第 D 節重疊', () => {
    const { container } = renderDesktop();
    expect(container.textContent).toContain('20:10 ~ 20:55');
    expect(container.textContent).toContain('21:00 ~ 21:45');
    expect(container.textContent).not.toContain('21:55');
});

test('顯示授課老師與課堂教室的開關', async () => {
    const { container } = renderDesktop({ courses: [dataStructure] });
    const timetable = container.querySelector('.curriculum-table');

    expect(timetable.textContent).not.toContain('王偉倫');
    await userEvent.click(screen.getByLabelText('顯示授課老師'));
    expect(timetable.textContent).toContain('王偉倫');

    await userEvent.click(screen.getByLabelText('顯示課堂教室'));
    expect(timetable.textContent).toContain('工程館 A203');
});

test('課程清單是八欄表格，用勾選框加入', async () => {
    const { container } = renderDesktop();
    await screen.findByText('【大學部】演算法');

    const menu = container.querySelector('.course-selection-menu');
    expect(menu.querySelectorAll('th')).toHaveLength(8);
    expect(within(menu).getByText('選擇')).toBeInTheDocument();

    const rowCheckboxes = within(menu).getAllByRole('checkbox').filter(box => !box.id);
    expect(rowCheckboxes).toHaveLength(3);
});

test('勾選課程會加進課表', async () => {
    const { container } = renderDesktop();
    await screen.findByText('【大學部】資料結構');

    const row = screen.getByText('【大學部】資料結構').closest('tr');
    await userEvent.click(within(row).getByRole('checkbox'));

    await waitFor(() => expect(container.querySelectorAll('.used-course-td')).toHaveLength(3));
    expect(screen.queryByText('【大學部】資料結構')).not.toBeInTheDocument();
});

test('衝堂的列標紅並停用勾選框', async () => {
    renderDesktop({ courses: [dataStructure] });

    const row = (await screen.findByText('【大學部】台灣文學與電影')).closest('tr');
    expect(row).toHaveClass('conflict-warning');
    expect(within(row).getByRole('checkbox')).toBeDisabled();
});

test('隱藏衝堂的開關會把衝堂的課濾掉', async () => {
    renderDesktop({ courses: [dataStructure] });
    await screen.findByText('【大學部】台灣文學與電影');

    await userEvent.click(screen.getByLabelText('是否隱藏衝堂'));

    await waitFor(() =>
        expect(screen.queryByText('【大學部】台灣文學與電影')).not.toBeInTheDocument()
    );
    expect(screen.getByText('【大學部】演算法')).toBeInTheDocument();
});

test('篩選器收在 details 裡，自製下拉可以改校區', async () => {
    renderDesktop();
    expect(screen.getByText(/篩選器/)).toBeInTheDocument();

    const campusGroup = screen.getByText('校區', { selector: 'label' }).closest('div');
    await userEvent.click(within(campusGroup).getByRole('button', { name: '蘭潭校區' }));
    await userEvent.click(within(campusGroup).getByRole('button', { name: '民雄校區' }));

    expect(campusGroup.querySelector('.dropdown-toggle')).toHaveTextContent('民雄校區');
});

test('右下角書籤按鈕顯示已選數量，點了開出清單', async () => {
    const { container } = renderDesktop({ courses: [dataStructure, algorithms] });

    const bookmark = container.querySelector('.edit-btn');
    expect(bookmark).toBeInTheDocument();
    expect(within(bookmark).getByText('2')).toBeInTheDocument();

    await userEvent.click(bookmark);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/已選擇 2 堂課，共 6 學分/)).toBeInTheDocument();
});

test('Modal 是 portal 出去的，樣式靠 .desktop-modal 這個 class 掛上', async () => {
    const { container } = renderDesktop({ courses: [dataStructure] });
    await userEvent.click(container.querySelector('.edit-btn'));

    const dialog = await screen.findByRole('dialog');
    expect(dialog.closest('.desktop-modal')).not.toBeNull();

    expect(container.querySelector('.view-desktop').contains(dialog)).toBe(false);
});

test('Modal 保留 fade —— CSS 的滑入 transition 需要一個起始狀態才跑得起來', async () => {
    const { container } = renderDesktop({ courses: [dataStructure] });
    await userEvent.click(container.querySelector('.edit-btn'));
    await screen.findByRole('dialog');

    expect(document.querySelector('.desktop-modal')).toHaveClass('fade');
});

test('清空仍然會先問一次', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { container } = renderDesktop({ courses: [dataStructure] });

    await userEvent.click(container.querySelector('.edit-btn'));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: /清空/ }));

    expect(confirmSpy).toHaveBeenCalledWith('確定清空所有課程？');
});

test('匯出 PNG 截的是共用的匯出課表，畫面上的課表不動', async () => {
    html2canvas.mockResolvedValue({ toBlob: callback => callback(new Blob(['png'], { type: 'image/png' })) });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const { container } = renderDesktop({ courses: [dataStructure] });

    await userEvent.click(screen.getByTitle('下載課表'));

    await waitFor(() => expect(html2canvas).toHaveBeenCalledTimes(1));
    expect(html2canvas.mock.calls[0][0]).toBe(screen.getByTestId('timetable-export-root'));
    expect(container.querySelector('.curriculum-table').getAttribute('style')).toBeNull();

    await waitFor(() => expect(clickSpy).toHaveBeenCalled());
});

test('匯出完成後桌機也看得到提示（改版前只有一個 confirm）', async () => {
    html2canvas.mockResolvedValue({ toBlob: callback => callback(new Blob(['png'], { type: 'image/png' })) });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const confirmSpy = vi.spyOn(window, 'confirm');

    renderDesktop({ courses: [dataStructure] });
    await userEvent.click(screen.getByTitle('下載課表'));

    expect(await screen.findByText('已下載 選課結果.png')).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
});

test('公告仍然介紹右下角的書籤按鈕', () => {
    renderDesktop();
    expect(screen.getByText(/右下角/)).toBeInTheDocument();
});
