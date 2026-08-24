import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseCard from './courseCard';

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

const course = makeCourse();

test('顯示課名、學制、老師、系所與年級', () => {
    render(<CourseCard course={course} variant="add" onAction={() => {}} />);
    expect(screen.getByText('資料結構')).toBeInTheDocument();
    expect(screen.getByText(/大學部/)).toBeInTheDocument();
    expect(screen.getByText(/王偉倫/)).toBeInTheDocument();
    expect(screen.getByText(/資工系/)).toBeInTheDocument();
    expect(screen.getByText(/二年級/)).toBeInTheDocument();
});

test('顯示校區、學分與上課時間', () => {
    render(<CourseCard course={course} variant="add" onAction={() => {}} />);
    expect(screen.getByText('蘭潭校區')).toBeInTheDocument();
    expect(screen.getByText('3 學分')).toBeInTheDocument();
    expect(screen.getByText('一 2~4')).toBeInTheDocument();
});

test('只有一節的時段不顯示範圍', () => {
    const single = makeCourse({ 上課時間: [{ 星期: '四', 開始節次: '3', 結束節次: '3' }] });
    render(<CourseCard course={single} variant="add" onAction={() => {}} />);
    expect(screen.getByText('四 3')).toBeInTheDocument();
});

test('老師連到 Google 搜尋評價', () => {
    render(<CourseCard course={course} variant="add" onAction={() => {}} />);
    const link = screen.getByRole('link', { name: '王偉倫' });
    expect(link.getAttribute('href')).toContain('google.com/search');
    expect(link.getAttribute('href')).toContain('%E7%8E%8B%E5%81%89%E5%80%AB');
});

test('有教學大綱時課名是連結', () => {
    const withSyllabus = makeCourse({ 教學大綱: 'https://example.com/s' });
    render(<CourseCard course={withSyllabus} variant="add" onAction={() => {}} />);
    expect(screen.getByRole('link', { name: '資料結構' })).toHaveAttribute('href', 'https://example.com/s');
});

test('加入用的是按鈕，不是 16px 的勾選框', async () => {
    const onAction = vi.fn();
    render(<CourseCard course={course} variant="add" onAction={onAction} />);
    const button = screen.getByRole('button', { name: '加入 資料結構' });
    expect(button.tagName).toBe('BUTTON');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    await userEvent.click(button);
    expect(onAction).toHaveBeenCalledWith(course);
});

test('衝堂時停用加入並說明撞到哪一門', () => {
    const conflict = makeCourse({ 永久課號: 'MA101', 課程名稱: '微積分(二)' });
    render(<CourseCard course={course} variant="add" conflictWith={conflict} onAction={() => {}} />);
    expect(screen.getByRole('button', { name: /加入/ })).toBeDisabled();
    expect(screen.getByText(/和「微積分\(二\)」衝堂/)).toBeInTheDocument();
});

test('移除變體用的按鈕會回呼 onAction', async () => {
    const onAction = vi.fn();
    render(<CourseCard course={course} variant="remove" onAction={onAction} />);
    await userEvent.click(screen.getByRole('button', { name: '移除 資料結構' }));
    expect(onAction).toHaveBeenCalledWith(course);
});

test('showClassroom 會把上課教室帶進 meta，已選清單需要它', () => {
    render(<CourseCard course={course} variant="remove" onAction={() => {}} showClassroom />);
    expect(screen.getByText(/工程館 A203/)).toBeInTheDocument();
    expect(screen.getByText(/王偉倫/)).toBeInTheDocument();
});

test('預設不顯示上課教室', () => {
    render(<CourseCard course={course} variant="add" onAction={() => {}} />);
    expect(screen.queryByText(/工程館 A203/)).not.toBeInTheDocument();
});
