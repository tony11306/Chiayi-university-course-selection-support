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

export function buildOccupancy(courses) {
    const occupancy = {};
    for (const course of courses) {
        for (const slot of courseSlots(course)) {
            occupancy[slot] = course;
        }
    }
    return occupancy;
}

export function findConflict(course, occupancy) {
    for (const slot of courseSlots(course)) {
        if (occupancy[slot]) return occupancy[slot];
    }
    return null;
}

// 課表預設只顯示週一～五、第 1～8 節（含午間 F），
// 選到週六或更晚的課時，範圍才往外長。
export const BASE_DAY_COUNT = 5;
export const BASE_PERIOD_COUNT = 9;

export function visibleDays(occupancy) {
    let count = BASE_DAY_COUNT;
    for (const key of Object.keys(occupancy ?? {})) {
        const dayIndex = DAYS.indexOf(key.split('-')[0]);
        if (dayIndex >= count) count = dayIndex + 1;
    }
    return DAYS.slice(0, Math.min(count, DAYS.length));
}

export function visiblePeriods(occupancy) {
    let count = BASE_PERIOD_COUNT;
    for (const key of Object.keys(occupancy ?? {})) {
        const index = Number.parseInt(key.split('-')[1], 10);
        if (!Number.isNaN(index) && index >= count) count = index + 1;
    }
    return PERIODS.slice(0, Math.min(count, PERIODS.length));
}

export function totalCredits(courses) {
    return courses.reduce((sum, course) => {
        const credit = Number.parseInt(course.學分數, 10);
        return sum + (Number.isNaN(credit) ? 0 : credit);
    }, 0);
}

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
