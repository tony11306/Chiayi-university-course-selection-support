/**
 * 課表與衝堂的純邏輯。
 *
 * 抽出來的用意有兩個：一是節次代碼（1 2 3 4 F 5 6 7 8 9 A B C D）的對應表原本
 * 在 timeTable.jsx 和 courseSelectionTable.jsx 各寫一份，容易走鐘；二是衝堂判斷
 * 原本是每一列 render 都跑一次 O(課程數 × 已選數)，改成先建 occupancy 再查表。
 */

export const PERIODS = [
    { code: '1', start: '08:10', end: '09:00' },
    { code: '2', start: '09:10', end: '10:00' },
    { code: '3', start: '10:10', end: '11:00' },
    { code: '4', start: '11:10', end: '12:00' },
    { code: 'F', start: '12:10', end: '13:00' },
    { code: '5', start: '13:20', end: '14:10' },
    { code: '6', start: '14:20', end: '15:10' },
    { code: '7', start: '15:20', end: '16:10' },
    { code: '8', start: '16:20', end: '17:10' },
    { code: '9', start: '17:20', end: '18:10' },
    { code: 'A', start: '18:30', end: '19:15' },
    { code: 'B', start: '19:20', end: '20:05' },
    // 原本寫 21:55，會和第 D 節的 21:00 重疊，是筆誤
    { code: 'C', start: '20:10', end: '20:55' },
    { code: 'D', start: '21:00', end: '21:45' },
];

export const DAYS = ['一', '二', '三', '四', '五', '六'];

const PERIOD_INDEX = PERIODS.reduce((map, period, index) => {
    map[period.code] = index;
    return map;
}, {});

export function periodIndex(code) {
    const index = PERIOD_INDEX[code];
    return index === undefined ? -1 : index;
}

export function courseKey(course) {
    return `${course.開課系號}-${course.開課序號}-${course.永久課號}`;
}

/** 把一門課的上課時間展開成 `星期-節次索引` 的 slot key 陣列。 */
export function courseSlots(course) {
    const slots = [];
    for (const classTime of course.上課時間 ?? []) {
        const start = periodIndex(classTime.開始節次);
        const end = periodIndex(classTime.結束節次);
        if (start === -1 || end === -1) continue;
        for (let index = start; index <= end; ++index) {
            slots.push(`${classTime.星期}-${index}`);
        }
    }
    return slots;
}

/** slot key 對應到佔用它的課程，衝堂判斷只要查表。 */
export function buildOccupancy(courses) {
    const occupancy = {};
    for (const course of courses) {
        for (const slot of courseSlots(course)) {
            occupancy[slot] = course;
        }
    }
    return occupancy;
}

/** 回傳第一門和 course 撞到的課，沒撞到回傳 null。 */
export function findConflict(course, occupancy) {
    for (const slot of courseSlots(course)) {
        if (occupancy[slot]) return occupancy[slot];
    }
    return null;
}

export function totalCredits(courses) {
    return courses.reduce((sum, course) => {
        const credit = Number.parseInt(course.學分數, 10);
        return sum + (Number.isNaN(credit) ? 0 : credit);
    }, 0);
}

/**
 * 某一天的直式議程：連續的同一門課合併成一個區塊，課與課之間的空堂補 gap 區塊。
 * 第一堂之前和最後一堂之後不補，避免整天被無意義的空堂撐長。
 */
export function buildAgenda(courses, day) {
    const occupancy = buildOccupancy(courses);
    const slots = PERIODS.map((_, index) => occupancy[`${day}-${index}`] ?? null);

    const firstIndex = slots.findIndex(Boolean);
    if (firstIndex === -1) return [];
    const lastIndex = slots.reduce((last, course, index) => (course ? index : last), -1);

    const blocks = [];
    let index = firstIndex;
    while (index <= lastIndex) {
        const course = slots[index];
        let end = index;
        while (end + 1 <= lastIndex && slots[end + 1] === course) ++end;
        blocks.push(course
            ? { type: 'course', course, startIndex: index, endIndex: end }
            : { type: 'gap', startIndex: index, endIndex: end });
        index = end + 1;
    }
    return blocks;
}
