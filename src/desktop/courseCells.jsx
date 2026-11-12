// 課程清單與已選課程 Modal 共用的表格儲存格內容

const CAMPUS_BADGE_CLASS = {
    '蘭潭校區': 'bg-primary',
    '民雄校區': 'bg-secondary',
    '新民校區': 'bg-success',
    // 黃底配白字幾乎看不到，改用深色字
    '林森校區': 'bg-warning text-dark',
    'ecourse 線上': 'bg-dark',
};

const GRADE_TEXT = { '1': '一', '2': '二', '3': '三', '4': '四' };

export function CampusBadge({ campus }) {
    const variant = CAMPUS_BADGE_CLASS[campus];
    return (
        <div className={variant ? `badge rounded-pill ${variant}` : ''}>
            {campus}
        </div>
    );
}

export function gradeText(grade) {
    return GRADE_TEXT[grade] ?? '五';
}

export function departmentText(department) {
    return department.length !== 1 ? department : '不限';
}

export function ClassTimeBadges({ classTimes }) {
    return classTimes.map((classTime, index) => (
        <div key={'badge ' + index} className="badge bg-primary">
            {classTime.星期 + ' ' + classTime.開始節次 + '~' + classTime.結束節次}
        </div>
    ));
}
