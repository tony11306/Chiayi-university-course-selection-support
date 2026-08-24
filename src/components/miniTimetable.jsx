import { useMemo, useState } from "react";
import { DAYS, PERIODS, courseSlots, totalCredits } from "../lib/schedule";

// 只標幾個節次當作縱向的定位點，14 個全標在這個尺寸下反而看不清
const PERIOD_MARKERS = { 0: '1', 4: 'F', 5: '5', 9: '9', 12: 'C' };

/**
 * 找課時常駐在清單上方的課表縮圖。
 *
 * 桌機版的課表和清單並排，勾一門課馬上看得到它落在哪；手機改成分頁之後
 * 這條回饋會斷掉，這個縮圖就是把它補回來 —— 加課當下格子會亮起來，
 * 還沒加之前也可以先預覽位置與衝堂。
 */
export default function MiniTimetable({
    courses,
    occupancy,
    previewCourse = null,
    highlightCourse = null,
    onOpenTimetable,
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const previewSlots = useMemo(
        () => new Set(previewCourse ? courseSlots(previewCourse) : []),
        [previewCourse]
    );
    const highlightSlots = useMemo(
        () => new Set(highlightCourse ? courseSlots(highlightCourse) : []),
        [highlightCourse]
    );
    const hasConflict = useMemo(
        () => [...previewSlots].some(slot => occupancy[slot]),
        [previewSlots, occupancy]
    );

    const credits = totalCredits(courses);

    function slotState(slot) {
        if (previewSlots.has(slot)) return occupancy[slot] ? 'conflict' : 'preview';
        return occupancy[slot] ? 'occupied' : 'free';
    }

    return (
        <div className="mini-timetable mb-3">
            <div className="mini-timetable-head">
                <span className="fw-medium">課表預覽</span>
                <span className="mini-timetable-count">
                    {courses.length} 門 · {credits} 學分
                </span>
                <button
                    type="button"
                    className="btn btn-link btn-sm mini-timetable-toggle shadow-none"
                    onClick={() => setIsCollapsed(collapsed => !collapsed)}
                >
                    {isCollapsed ? '展開' : '收起'}
                </button>
            </div>

            {!isCollapsed && (
                <>
                    <button
                        type="button"
                        className="mini-timetable-grid"
                        onClick={onOpenTimetable}
                        aria-label={`已選 ${courses.length} 門課，共 ${credits} 學分，開啟完整課表`}
                    >
                        <span className="mini-timetable-corner" aria-hidden="true" />
                        {DAYS.map(day => (
                            <span key={`head-${day}`} className="mini-timetable-day" aria-hidden="true">
                                {day}
                            </span>
                        ))}
                        {PERIODS.map((period, index) => (
                            <Row
                                key={period.code}
                                index={index}
                                slotState={slotState}
                                highlightSlots={highlightSlots}
                            />
                        ))}
                    </button>

                    {previewCourse ? (
                        <div className="mini-timetable-legend">
                            <span>
                                <i className="mini-timetable-swatch" data-state="occupied" aria-hidden="true" />
                                已選
                            </span>
                            <span>
                                <i
                                    className="mini-timetable-swatch"
                                    data-state={hasConflict ? 'conflict' : 'preview'}
                                    aria-hidden="true"
                                />
                                {previewCourse.課程名稱}
                                {hasConflict ? '（衝堂）' : ''}
                            </span>
                        </div>
                    ) : (
                        <p className="mini-timetable-hint">
                            輕觸課程卡預覽它會落在哪一格，輕觸縮圖看完整課表。
                        </p>
                    )}
                </>
            )}
        </div>
    );
}

function Row({ index, slotState, highlightSlots }) {
    return (
        <>
            <span className="mini-timetable-period" aria-hidden="true">
                {PERIOD_MARKERS[index] ?? ''}
            </span>
            {DAYS.map(day => {
                const slot = `${day}-${index}`;
                return (
                    <span
                        key={slot}
                        data-testid={`mini-slot-${slot}`}
                        data-state={slotState(slot)}
                        data-highlight={highlightSlots.has(slot) ? 'true' : undefined}
                        className="mini-timetable-cell"
                    />
                );
            })}
        </>
    );
}
