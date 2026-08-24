import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalDataProvider, useGlobalData } from './useGlobalData';

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
    學分數: '4',
    上課時間: [{ 星期: '一', 開始節次: '5', 結束節次: '6' }],
});

let store;

function Probe() {
    store = useGlobalData();
    return (
        <div>
            <span data-testid="count">{store.userSelectedCourses.length}</span>
            <span data-testid="credits">{store.totalCredits}</span>
            <span data-testid="slot-1-1">{store.occupancy['一-1']?.課程名稱 ?? '-'}</span>
            <span data-testid="toast">{store.toast ? store.toast.title : '-'}</span>
        </div>
    );
}

function renderStore() {
    return render(
        <GlobalDataProvider>
            <Probe />
        </GlobalDataProvider>
    );
}

beforeEach(() => {
    localStorage.clear();
    store = undefined;
});

test('addCourse 會加入課程並更新學分與 occupancy 查表', () => {
    renderStore();
    expect(screen.getByTestId('count')).toHaveTextContent('0');

    act(() => store.addCourse(dataStructure));

    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('credits')).toHaveTextContent('3');
    expect(screen.getByTestId('slot-1-1')).toHaveTextContent('資料結構');
});

test('同一門課不會被加入兩次', () => {
    renderStore();
    act(() => store.addCourse(dataStructure));
    act(() => store.addCourse({ ...dataStructure }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
});

test('isSelected 認得已選的課', () => {
    renderStore();
    expect(store.isSelected(dataStructure)).toBe(false);
    act(() => store.addCourse(dataStructure));
    expect(store.isSelected({ ...dataStructure })).toBe(true);
});

test('removeCourse 移除指定的課', () => {
    renderStore();
    act(() => store.addCourse(dataStructure));
    act(() => store.addCourse(calculus));
    expect(screen.getByTestId('credits')).toHaveTextContent('7');

    act(() => store.removeCourse(dataStructure));

    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('credits')).toHaveTextContent('4');
    expect(screen.getByTestId('slot-1-1')).toHaveTextContent('-');
});

test('clearCourses 清空，restoreCourses 可以還原', () => {
    renderStore();
    act(() => store.addCourse(dataStructure));
    act(() => store.addCourse(calculus));

    let cleared;
    act(() => { cleared = store.clearCourses(); });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(cleared).toHaveLength(2);

    act(() => store.restoreCourses(cleared));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('credits')).toHaveTextContent('7');
});

test('findConflictWith 找出撞到的課', () => {
    renderStore();
    act(() => store.addCourse(dataStructure));

    const programming = makeCourse({
        永久課號: 'CS100',
        課程名稱: '程式設計(一)',
        上課時間: [{ 星期: '一', 開始節次: '3', 結束節次: '5' }],
    });
    expect(store.findConflictWith(programming)).toEqual(dataStructure);
    expect(store.findConflictWith(calculus)).toBeNull();
});

test('已選課程寫進 localStorage，重新掛載後還在', () => {
    const { unmount } = renderStore();
    act(() => store.addCourse(dataStructure));
    expect(JSON.parse(localStorage.getItem('userSelectedCourses'))).toHaveLength(1);

    unmount();
    renderStore();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
});

test('showToast 與 dismissToast 控制提示', async () => {
    renderStore();
    expect(screen.getByTestId('toast')).toHaveTextContent('-');

    act(() => store.showToast({ title: '已加入 資料結構' }));
    expect(screen.getByTestId('toast')).toHaveTextContent('已加入 資料結構');

    act(() => store.dismissToast());
    expect(screen.getByTestId('toast')).toHaveTextContent('-');
});

test('每次 showToast 都會換一個 id，讓提示重新出現', () => {
    renderStore();
    act(() => store.showToast({ title: '第一則' }));
    const first = store.toast.id;
    act(() => store.showToast({ title: '第二則' }));
    expect(store.toast.id).not.toBe(first);
});

test('activeTab 預設是課表，可以切換', async () => {
    renderStore();
    expect(store.activeTab).toBe('timetable');
    act(() => store.setActiveTab('search'));
    expect(store.activeTab).toBe('search');
});

test('previewCourse 可以設定與清除', () => {
    renderStore();
    expect(store.previewCourse).toBeNull();
    act(() => store.setPreviewCourse(calculus));
    expect(store.previewCourse).toEqual(calculus);
    act(() => store.setPreviewCourse(null));
    expect(store.previewCourse).toBeNull();
});

test('加入課程時會清掉預覽', () => {
    renderStore();
    act(() => store.setPreviewCourse(dataStructure));
    act(() => store.addCourse(dataStructure));
    expect(store.previewCourse).toBeNull();
});

test('selectedDay 預設是今天，星期日退回星期一', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-26T09:00:00'));
    renderStore();
    expect(store.selectedDay).toBe('三');
    vi.useRealTimers();
});

test('setSelectedDay 會切換日期並回到單日檢視', () => {
    renderStore();
    act(() => store.setTimetableView('week'));
    expect(store.timetableView).toBe('week');

    act(() => store.setSelectedDay('五'));
    expect(store.selectedDay).toBe('五');
    expect(store.timetableView).toBe('day');
});

test('timetableView 預設是單日', () => {
    renderStore();
    expect(store.timetableView).toBe('day');
});
