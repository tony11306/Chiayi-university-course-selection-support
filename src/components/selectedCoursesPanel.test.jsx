import { afterEach, beforeEach, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectedCoursesPanel from './selectedCoursesPanel';
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

function renderPanel({ courses = [makeCourse()], width = DESKTOP_WIDTH } = {}) {
    window.innerWidth = width;
    return renderWithStore(<SelectedCoursesPanel />, { courses });
}

beforeEach(() => {
    localStorage.clear();
});

afterEach(() => {
    window.innerWidth = DESKTOP_WIDTH;
});

test('桌機保留書籤按鈕，上面標示已選數量', () => {
    renderPanel({ courses: [makeCourse()] });
    expect(screen.getByRole('button', { name: /已選擇的課程/ })).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
});

test('桌機點書籤按鈕會開啟清單', async () => {
    renderPanel();
    await userEvent.click(screen.getByRole('button', { name: /已選擇的課程/ }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '移除 資料結構' })).toBeInTheDocument();
});

test('手機不渲染那顆靠 hover 滑出來的書籤按鈕', () => {
    renderPanel({ width: MOBILE_WIDTH });
    expect(screen.queryByRole('button', { name: /已選擇的課程/ })).not.toBeInTheDocument();
});
