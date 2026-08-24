import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MiniTimetable from './miniTimetable';
import { buildOccupancy } from '../lib/schedule';

function makeCourse(overrides = {}) {
    return {
        開課系號: 'CS',
        開課序號: '01',
        永久課號: 'CS101',
        課程名稱: '資料結構',
        學分數: '3',
        上課時間: [{ 星期: '一', 開始節次: '2', 結束節次: '4' }],
        ...overrides,
    };
}

const dataStructure = makeCourse();
const calculus = makeCourse({
    永久課號: 'MA101',
    課程名稱: '微積分(二)',
    學分數: '4',
    上課時間: [{ 星期: '三', 開始節次: '3', 結束節次: '4' }],
});

function renderMini(props = {}) {
    const courses = props.courses ?? [dataStructure];
    return render(
        <MiniTimetable
            courses={courses}
            occupancy={buildOccupancy(courses)}
            onOpenTimetable={() => {}}
            {...props}
        />
    );
}

const slot = (day, index) => screen.getByTestId(`mini-slot-${day}-${index}`);

test('畫出 6 天 × 14 節的格子', () => {
    renderMini();
    expect(screen.getAllByTestId(/^mini-slot-/)).toHaveLength(84);
});

test('已選課程佔用的節次標成 occupied，其餘是 free', () => {
    renderMini();
    expect(slot('一', 1)).toHaveAttribute('data-state', 'occupied');
    expect(slot('一', 2)).toHaveAttribute('data-state', 'occupied');
    expect(slot('一', 3)).toHaveAttribute('data-state', 'occupied');
    expect(slot('一', 0)).toHaveAttribute('data-state', 'free');
    expect(slot('二', 1)).toHaveAttribute('data-state', 'free');
});

test('顯示已選門數與總學分', () => {
    renderMini({ courses: [dataStructure, calculus] });
    expect(screen.getByText(/2 門/)).toBeInTheDocument();
    expect(screen.getByText(/7 學分/)).toBeInTheDocument();
});

test('預覽一門不衝堂的課，它的節次標成 preview', () => {
    renderMini({ previewCourse: calculus });
    expect(slot('三', 2)).toHaveAttribute('data-state', 'preview');
    expect(slot('三', 3)).toHaveAttribute('data-state', 'preview');
    expect(slot('一', 1)).toHaveAttribute('data-state', 'occupied');
});

test('預覽一門會衝堂的課，撞到的節次標成 conflict', () => {
    const programming = makeCourse({
        永久課號: 'CS100',
        課程名稱: '程式設計(一)',
        上課時間: [{ 星期: '一', 開始節次: '3', 結束節次: '5' }],
    });
    renderMini({ previewCourse: programming });
    // 一-2、一-3 撞到資料結構；一-4、一-5 是空的
    expect(slot('一', 2)).toHaveAttribute('data-state', 'conflict');
    expect(slot('一', 3)).toHaveAttribute('data-state', 'conflict');
    expect(slot('一', 4)).toHaveAttribute('data-state', 'preview');
    expect(slot('一', 5)).toHaveAttribute('data-state', 'preview');
});

test('預覽時顯示課名圖例，沒預覽時顯示操作提示', () => {
    const { unmount } = renderMini();
    expect(screen.getByText(/輕觸課程卡/)).toBeInTheDocument();
    unmount();

    renderMini({ previewCourse: calculus });
    expect(screen.getByText('微積分(二)')).toBeInTheDocument();
    expect(screen.queryByText(/輕觸課程卡/)).not.toBeInTheDocument();
});

test('預覽衝堂的課時，圖例會標明衝堂', () => {
    const programming = makeCourse({
        永久課號: 'CS100',
        課程名稱: '程式設計(一)',
        上課時間: [{ 星期: '一', 開始節次: '3', 結束節次: '5' }],
    });
    renderMini({ previewCourse: programming });
    expect(screen.getByText(/衝堂/)).toBeInTheDocument();
});

test('點縮圖會開啟完整課表', async () => {
    const onOpenTimetable = vi.fn();
    renderMini({ onOpenTimetable });
    await userEvent.click(screen.getByRole('button', { name: /完整課表/ }));
    expect(onOpenTimetable).toHaveBeenCalledTimes(1);
});

test('可以收起與展開，收起後不畫格子', async () => {
    renderMini();
    await userEvent.click(screen.getByRole('button', { name: '收起' }));
    expect(screen.queryAllByTestId(/^mini-slot-/)).toHaveLength(0);

    await userEvent.click(screen.getByRole('button', { name: '展開' }));
    expect(screen.getAllByTestId(/^mini-slot-/)).toHaveLength(84);
});

test('剛加入的課會標記出來，讓使用者看到課表變了', () => {
    renderMini({ courses: [dataStructure, calculus], highlightCourse: calculus });
    expect(slot('三', 2)).toHaveAttribute('data-highlight', 'true');
    expect(slot('一', 1)).not.toHaveAttribute('data-highlight', 'true');
});

test('沒有選課時仍然畫出空的格子當作提示', () => {
    renderMini({ courses: [] });
    expect(screen.getAllByTestId(/^mini-slot-/)).toHaveLength(84);
    expect(screen.getByText(/0 門/)).toBeInTheDocument();
});
