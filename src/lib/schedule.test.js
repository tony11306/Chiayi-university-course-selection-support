import { describe, expect, test } from 'vitest';
import {
    PERIODS,
    DAYS,
    periodIndex,
    courseSlots,
    buildOccupancy,
    findConflict,
    visibleDays,
    visiblePeriods,
    totalCredits,
    buildAgenda,
    courseKey,
} from './schedule';

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

describe('PERIODS', () => {
    test('有 14 節，代碼依照學校的順序排列', () => {
        expect(PERIODS).toHaveLength(14);
        expect(PERIODS.map(p => p.code)).toEqual(
            ['1', '2', '3', '4', 'F', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D']
        );
    });

    test('第 C 節在 20:55 結束，不會和第 D 節重疊', () => {
        const c = PERIODS.find(p => p.code === 'C');
        const d = PERIODS.find(p => p.code === 'D');
        expect(c.end).toBe('20:55');
        expect(c.end < d.start).toBe(true);
    });

    test('DAYS 是星期一到六', () => {
        expect(DAYS).toEqual(['一', '二', '三', '四', '五', '六']);
    });
});

describe('periodIndex', () => {
    test('把節次代碼轉成連續的索引', () => {
        expect(periodIndex('1')).toBe(0);
        expect(periodIndex('4')).toBe(3);
        expect(periodIndex('F')).toBe(4);
        expect(periodIndex('5')).toBe(5);
        expect(periodIndex('D')).toBe(13);
    });

    test('未知代碼回傳 -1', () => {
        expect(periodIndex('Z')).toBe(-1);
    });
});

describe('courseSlots', () => {
    test('展開單一時段為每一節的 slot key', () => {
        expect(courseSlots(makeCourse())).toEqual(['一-1', '一-2', '一-3']);
    });

    test('展開跨越午休的時段', () => {
        const course = makeCourse({ 上課時間: [{ 星期: '四', 開始節次: 'F', 結束節次: '5' }] });
        expect(courseSlots(course)).toEqual(['四-4', '四-5']);
    });

    test('一門課有多個上課時段時全部展開', () => {
        const course = makeCourse({
            上課時間: [
                { 星期: '一', 開始節次: '5', 結束節次: '6' },
                { 星期: '三', 開始節次: '3', 結束節次: '3' },
            ],
        });
        expect(courseSlots(course)).toEqual(['一-5', '一-6', '三-2']);
    });

    test('沒有上課時間時回傳空陣列', () => {
        expect(courseSlots(makeCourse({ 上課時間: [] }))).toEqual([]);
        expect(courseSlots(makeCourse({ 上課時間: undefined }))).toEqual([]);
    });
});

describe('buildOccupancy 與 findConflict', () => {
    const dataStructure = makeCourse();
    const calculus = makeCourse({
        永久課號: 'MA101',
        課程名稱: '微積分(二)',
        學分數: '4',
        上課時間: [
            { 星期: '一', 開始節次: '5', 結束節次: '6' },
            { 星期: '三', 開始節次: '3', 結束節次: '4' },
        ],
    });

    test('每一節都指回佔用它的那門課', () => {
        const occupancy = buildOccupancy([dataStructure]);
        expect(occupancy['一-1']).toBe(dataStructure);
        expect(occupancy['一-3']).toBe(dataStructure);
        expect(occupancy['一-4']).toBeUndefined();
    });

    test('沒有重疊時 findConflict 回傳 null', () => {
        const occupancy = buildOccupancy([dataStructure]);
        expect(findConflict(calculus, occupancy)).toBeNull();
    });

    test('重疊時回傳造成衝堂的那門課', () => {
        const occupancy = buildOccupancy([dataStructure, calculus]);
        const programming = makeCourse({
            永久課號: 'CS100',
            課程名稱: '程式設計(一)',
            上課時間: [{ 星期: '三', 開始節次: '2', 結束節次: '4' }],
        });
        expect(findConflict(programming, occupancy)).toBe(calculus);
    });

    test('只有部分節次重疊也算衝堂', () => {
        const occupancy = buildOccupancy([calculus]);
        const chemistry = makeCourse({
            永久課號: 'CH100',
            課程名稱: '生活中的化學',
            上課時間: [{ 星期: '三', 開始節次: '4', 結束節次: '6' }],
        });
        expect(findConflict(chemistry, occupancy)).toBe(calculus);
    });

    test('同一天但節次不相鄰不算衝堂', () => {
        const occupancy = buildOccupancy([dataStructure]);
        const evening = makeCourse({
            永久課號: 'CS900',
            上課時間: [{ 星期: '一', 開始節次: 'A', 結束節次: 'C' }],
        });
        expect(findConflict(evening, occupancy)).toBeNull();
    });

    test('空課表不會衝堂', () => {
        expect(findConflict(dataStructure, buildOccupancy([]))).toBeNull();
    });
});

describe('visibleDays 與 visiblePeriods', () => {
    test('預設只顯示週一到週五、第 1～8 節（含午間 F）', () => {
        expect(visibleDays({})).toEqual(['一', '二', '三', '四', '五']);
        expect(visiblePeriods({}).map(p => p.code))
            .toEqual(['1', '2', '3', '4', 'F', '5', '6', '7', '8']);
    });

    test('空課表也是預設範圍', () => {
        expect(visibleDays(buildOccupancy([]))).toEqual(['一', '二', '三', '四', '五']);
        expect(visiblePeriods(buildOccupancy([]))).toHaveLength(9);
    });

    test('選到週六的課才把星期六長出來', () => {
        const occupancy = buildOccupancy([makeCourse({
            上課時間: [{ 星期: '六', 開始節次: '2', 結束節次: '3' }],
        })]);
        expect(visibleDays(occupancy)).toEqual(['一', '二', '三', '四', '五', '六']);
    });

    test('第八節以後有課，節次列往外長到那一節為止', () => {
        const occupancy = buildOccupancy([makeCourse({
            上課時間: [{ 星期: '二', 開始節次: 'A', 結束節次: 'B' }],
        })]);
        expect(visiblePeriods(occupancy).map(p => p.code)).toHaveLength(12);
        expect(visiblePeriods(occupancy).at(-1).code).toBe('B');
    });

    test('中間的節次照樣連續，不會跳過沒課的列', () => {
        const occupancy = buildOccupancy([makeCourse({
            上課時間: [{ 星期: '三', 開始節次: 'D', 結束節次: 'D' }],
        })]);
        const codes = visiblePeriods(occupancy).map(p => p.code);
        expect(codes[codes.length - 1]).toBe('D');
        expect(codes.slice(0, 9)).toEqual(['1', '2', '3', '4', 'F', '5', '6', '7', '8']);
    });
});

describe('totalCredits', () => {
    test('把字串學分數加總', () => {
        const courses = [makeCourse({ 學分數: '3' }), makeCourse({ 學分數: '4' })];
        expect(totalCredits(courses)).toBe(7);
    });

    test('0 學分與數字型別都算得出來', () => {
        expect(totalCredits([makeCourse({ 學分數: '0' }), makeCourse({ 學分數: 2 })])).toBe(2);
    });

    test('學分數缺漏時當 0', () => {
        expect(totalCredits([makeCourse({ 學分數: '' })])).toBe(0);
        expect(totalCredits([])).toBe(0);
    });
});

describe('buildAgenda', () => {
    const morning = makeCourse({ 課程名稱: '資料結構', 上課時間: [{ 星期: '一', 開始節次: '2', 結束節次: '4' }] });
    const afternoon = makeCourse({
        永久課號: 'MA101',
        課程名稱: '微積分(二)',
        上課時間: [{ 星期: '一', 開始節次: '5', 結束節次: '6' }],
    });

    test('連續的同一門課合併成一個區塊', () => {
        const blocks = buildAgenda([morning], '一');
        expect(blocks).toEqual([
            { type: 'course', course: morning, startIndex: 1, endIndex: 3 },
        ]);
    });

    test('兩門課之間的空堂會產生 gap 區塊', () => {
        const blocks = buildAgenda([morning, afternoon], '一');
        expect(blocks.map(b => b.type)).toEqual(['course', 'gap', 'course']);
        expect(blocks[1]).toEqual({ type: 'gap', startIndex: 4, endIndex: 4 });
    });

    test('不會在第一堂之前或最後一堂之後補空堂', () => {
        const blocks = buildAgenda([afternoon], '一');
        expect(blocks).toHaveLength(1);
        expect(blocks[0].type).toBe('course');
    });

    test('那天沒有課時回傳空陣列', () => {
        expect(buildAgenda([morning], '六')).toEqual([]);
        expect(buildAgenda([], '一')).toEqual([]);
    });

    test('只取指定那天的課', () => {
        const twoDays = makeCourse({
            課程名稱: '線性代數',
            上課時間: [
                { 星期: '二', 開始節次: '3', 結束節次: '4' },
                { 星期: '四', 開始節次: '3', 結束節次: '3' },
            ],
        });
        expect(buildAgenda([twoDays], '四')).toEqual([
            { type: 'course', course: twoDays, startIndex: 2, endIndex: 2 },
        ]);
    });
});

describe('courseKey', () => {
    test('用開課系號、開課序號、永久課號組成穩定的 key', () => {
        expect(courseKey(makeCourse())).toBe('CS-01-CS101');
    });

    test('不同課程不會撞 key', () => {
        const a = makeCourse({ 開課序號: '01' });
        const b = makeCourse({ 開課序號: '02' });
        expect(courseKey(a)).not.toBe(courseKey(b));
    });
});
