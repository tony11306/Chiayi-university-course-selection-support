import { PERIODS, buildAgenda } from "../lib/schedule";
import CampusBadge from "./campusBadge";

function periodLabel(startIndex, endIndex) {
    const start = PERIODS[startIndex].code;
    if (startIndex === endIndex) return `第 ${start} 節`;
    return `第 ${start}–${PERIODS[endIndex].code} 節`;
}

export default function DayAgenda({ courses, day, showTeacher, showClassroom }) {
    const blocks = buildAgenda(courses, day);

    if (blocks.length === 0) {
        return (
            <div className="agenda-empty" data-testid="day-agenda">
                <span className="agenda-empty-title">星期{day}沒有課</span>
                <span className="text-muted">可以排點什麼，或者就這樣</span>
            </div>
        );
    }

    return (
        <ul className="agenda list-unstyled mb-0" data-testid="day-agenda">
            {blocks.map(block => (
                <li key={`${block.type}-${block.startIndex}`} className="agenda-row">
                    {block.type === 'gap' ? (
                        <div className="agenda-gap">
                            空堂 · {periodLabel(block.startIndex, block.endIndex)}
                            （{PERIODS[block.startIndex].start} – {PERIODS[block.endIndex].end}）
                        </div>
                    ) : (
                        <>
                            <div className="agenda-when">
                                <span className="agenda-period">{periodLabel(block.startIndex, block.endIndex)}</span>
                                <span className="agenda-time">{PERIODS[block.startIndex].start}</span>
                                <span className="agenda-time">{PERIODS[block.endIndex].end}</span>
                            </div>
                            <div className="agenda-card">
                                <div className="agenda-title">
                                    {block.course.教學大綱?.length > 0 ? (
                                        <a
                                            className="text-decoration-none"
                                            href={block.course.教學大綱}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {block.course.課程名稱}
                                        </a>
                                    ) : block.course.課程名稱}
                                </div>
                                <div className="agenda-meta">
                                    {[
                                        showTeacher ? block.course.授課老師 : null,
                                        showClassroom ? block.course.上課教室 : null,
                                        block.course.上課系所,
                                    ].filter(Boolean).join(' · ')}
                                </div>
                                <div className="course-pills">
                                    <CampusBadge campus={block.course.校區} />
                                    <span className="course-pill course-pill-credit">
                                        {block.course.學分數} 學分
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
}
