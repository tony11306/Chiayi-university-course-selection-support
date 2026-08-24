import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectedCoursesList from './selectedCoursesList';
import { useGlobalData } from '../hooks/useGlobalData';
import { renderWithStore } from '../testUtils/render';
import { MOBILE_WIDTH, DESKTOP_WIDTH } from '../testUtils/viewport';

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
const calculus = makeCourse({
    開課序號: '02',
    永久課號: 'MA101',
    課程名稱: '微積分(二)',
    授課老師: '李國賢',
    上課教室: '理學院 B201',
    學分數: '4',
    上課時間: [{ 星期: '三', 開始節次: '3', 結束節次: '4' }],
});

function ToastProbe() {
    const { toast } = useGlobalData();
    return <span data-testid="toast-action">{toast?.action?.type ?? '-'}</span>;
}

function renderList({ courses = [dataStructure, calculus], width = MOBILE_WIDTH } = {}) {
    window.innerWidth = width;
    return renderWithStore(
        <>
            <ToastProbe />
            <SelectedCoursesList />
        </>,
        { courses }
    );
}

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    window.innerWidth = DESKTOP_WIDTH;
    vi.restoreAllMocks();
});

test('顯示已選門數與總學分', () => {
    renderList();
    expect(screen.getByText(/2 門/)).toBeInTheDocument();
    expect(screen.getByText(/7 學分/)).toBeInTheDocument();
});

test('沒選課時顯示空狀態，也不顯示清空', () => {
    renderList({ courses: [] });
    expect(screen.getByText(/還沒選課/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /清空/ })).not.toBeInTheDocument();
});

test('手機與桌機用同一份 DOM', () => {
    const { unmount } = renderList({ width: MOBILE_WIDTH });
    const mobileHtml = screen.getByTestId('selected-course-list').innerHTML;
    expect(screen.getByRole('button', { name: '移除 資料結構' })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    unmount();

    renderList({ width: DESKTOP_WIDTH });
    expect(screen.getByTestId('selected-course-list').innerHTML).toBe(mobileHtml);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

test('移除一門課會給可復原的提示', async () => {
    renderList();
    await userEvent.click(screen.getByRole('button', { name: '移除 資料結構' }));

    await waitFor(() => expect(screen.queryByText('資料結構')).not.toBeInTheDocument());
    expect(screen.getByText('微積分(二)')).toBeInTheDocument();
    expect(screen.getByTestId('toast-action')).toHaveTextContent('undo');
});

test('清空不再彈原生對話框，改成可復原的提示', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderList();

    await userEvent.click(screen.getByRole('button', { name: /清空/ }));

    expect(confirmSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText(/還沒選課/)).toBeInTheDocument());
    expect(screen.getByTestId('toast-action')).toHaveTextContent('undoClear');
});

test('顯示每一門課的老師與教室', () => {
    renderList({ width: MOBILE_WIDTH });
    expect(screen.getByText(/王偉倫/)).toBeInTheDocument();
    expect(screen.getByText(/工程館 A203/)).toBeInTheDocument();
});
