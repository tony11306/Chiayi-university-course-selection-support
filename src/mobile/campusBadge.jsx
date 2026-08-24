// 校區色票原本在 courseSelectionTable 和 selectedCoursesPanel 各寫一串三元運算，
// 抽出來一份，順便把 Bootstrap 的 bg-primary/secondary 換成同一組協調的顏色。
const CAMPUS_VARIANT = {
    '蘭潭校區': 'lantan',
    '民雄校區': 'minhsiung',
    '新民校區': 'xinmin',
    '林森校區': 'linsen',
    'ecourse 線上': 'online',
};

export default function CampusBadge({ campus }) {
    if (!campus) return null;
    return (
        <span className="course-pill course-pill-campus" data-campus={CAMPUS_VARIANT[campus] ?? 'other'}>
            {campus}
        </span>
    );
}
