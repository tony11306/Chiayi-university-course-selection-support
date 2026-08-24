import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import DayAgenda from './dayAgenda';

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
    永久課號: 'MA101',
    課程名稱: '微積分(二)',
    授課老師: '李國賢',
    上課教室: '理學院 B201',
    學分數: '4',
    上課時間: [{ 星期: '一', 開始節次: '5', 結束節次: '6' }],
});

function renderAgenda(props = {}) {
    return render(
        <DayAgenda
            courses={props.courses ?? [dataStructure]}
            day={props.day ?? '一'}
            showTeacher={props.showTeacher ?? false}
            showClassroom={props.showClassroom ?? false}
            {...props}
        />
    );
}

test('列出當天的課，含節次範圍與起訖時間', () => {
    renderAgenda();
    expect(screen.getByText('資料結構')).toBeInTheDocument();
    expect(screen.getByText('第 2–4 節')).toBeInTheDocument();
    expect(screen.getByText('09:10')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
});

test('只有一節的課不顯示範圍', () => {
    const single = makeCourse({ 上課時間: [{ 星期: '一', 開始節次: '3', 結束節次: '3' }] });
    renderAgenda({ courses: [single] });
    expect(screen.getByText('第 3 節')).toBeInTheDocument();
});

test('兩堂課之間顯示空堂', () => {
    renderAgenda({ courses: [dataStructure, calculus] });
    expect(screen.getByText(/空堂/)).toBeInTheDocument();
    expect(screen.getByText(/第 F 節/)).toBeInTheDocument();
});

test('那天沒有課時顯示空狀態', () => {
    renderAgenda({ day: '六' });
    expect(screen.getByText(/星期六沒有課/)).toBeInTheDocument();
    expect(screen.queryByText('資料結構')).not.toBeInTheDocument();
});

test('預設不顯示老師與教室', () => {
    renderAgenda();
    expect(screen.queryByText(/王偉倫/)).not.toBeInTheDocument();
    expect(screen.queryByText(/工程館 A203/)).not.toBeInTheDocument();
});

test('打開開關後顯示老師與教室', () => {
    renderAgenda({ showTeacher: true, showClassroom: true });
    expect(screen.getByText(/王偉倫/)).toBeInTheDocument();
    expect(screen.getByText(/工程館 A203/)).toBeInTheDocument();
});

test('有教學大綱時課名是連結', () => {
    const withSyllabus = makeCourse({ 教學大綱: 'https://example.com/syllabus' });
    renderAgenda({ courses: [withSyllabus] });
    const link = screen.getByRole('link', { name: '資料結構' });
    expect(link).toHaveAttribute('href', 'https://example.com/syllabus');
    expect(link).toHaveAttribute('target', '_blank');
});

test('沒有教學大綱時課名不是連結', () => {
    renderAgenda();
    expect(screen.queryByRole('link', { name: '資料結構' })).not.toBeInTheDocument();
    expect(screen.getByText('資料結構')).toBeInTheDocument();
});

test('顯示校區與學分', () => {
    renderAgenda();
    expect(screen.getByText('蘭潭校區')).toBeInTheDocument();
    expect(screen.getByText('3 學分')).toBeInTheDocument();
});

test('一門課一天上兩段時會各自出現', () => {
    const twice = makeCourse({
        課程名稱: '實驗課',
        上課時間: [
            { 星期: '一', 開始節次: '2', 結束節次: '3' },
            { 星期: '一', 開始節次: '7', 結束節次: '8' },
        ],
    });
    renderAgenda({ courses: [twice] });
    expect(screen.getAllByText('實驗課')).toHaveLength(2);
});
