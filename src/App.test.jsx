import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { setViewportWidth, MOBILE_WIDTH, DESKTOP_WIDTH } from './testUtils/viewport';

const getCourseDatas = vi.hoisted(() => vi.fn());
vi.mock('./api/course', () => ({ getCourseDatas }));

function renderApp(width) {
    window.innerWidth = width;
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    );
}

beforeEach(() => {
    localStorage.clear();
    getCourseDatas.mockReset();
    getCourseDatas.mockResolvedValue({ data: { semester: '114-1', result: [] } });
});

afterEach(() => {
    window.innerWidth = DESKTOP_WIDTH;
});

test('桌機寬度掛桌機那支畫面', () => {
    const { container } = renderApp(DESKTOP_WIDTH);
    expect(container.querySelector('.view-desktop')).toBeInTheDocument();
    expect(container.querySelector('.view-mobile')).not.toBeInTheDocument();
});

test('手機寬度掛手機那支畫面', () => {
    const { container } = renderApp(MOBILE_WIDTH);
    expect(container.querySelector('.view-mobile')).toBeInTheDocument();
    expect(container.querySelector('.view-desktop')).not.toBeInTheDocument();
});

test('兩支畫面不會同時存在', () => {
    const { container } = renderApp(MOBILE_WIDTH);
    expect(container.querySelectorAll('.view-mobile, .view-desktop')).toHaveLength(1);
});

test('視窗跨過斷點時整支畫面換掉，共用的已選課程留著', () => {
    localStorage.setItem('userSelectedCourses', JSON.stringify([{
        開課系號: 'CS', 開課序號: '01', 永久課號: 'CS101',
        課程名稱: '資料結構', 學分數: '3', 校區: '蘭潭校區', 適用年級: '2',
        上課系所: '資工系', 授課老師: '王偉倫', 上課教室: 'A203', 上課學制: '大學部',
        教學大綱: '', 上課時間: [{ 星期: '一', 開始節次: '2', 結束節次: '4' }],
    }]));

    const { container } = renderApp(DESKTOP_WIDTH);
    expect(container.querySelector('.view-desktop')).toBeInTheDocument();
    expect(container.querySelectorAll('.used-course-td')).toHaveLength(3);

    setViewportWidth(MOBILE_WIDTH);

    expect(container.querySelector('.view-mobile')).toBeInTheDocument();
    expect(screen.getByTestId('day-agenda')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /星期一 1 堂/ })).toBeInTheDocument();
});
