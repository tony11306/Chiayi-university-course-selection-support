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
