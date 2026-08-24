import { DAYS, PERIODS } from '../lib/schedule';

export const EXPORT_FILE_NAME = '選課結果.png';

export default function TimetableSheet({ occupancy, showTeacher, showClassroom, sheetRef }) {
    return (
        <div className="timetable-sheet" ref={sheetRef} data-testid="timetable-export-root">
            <table className="timetable-sheet-grid">
                <thead>
                    <tr>
                        <th scope="col" className="timetable-sheet-corner">節\日</th>
                        {DAYS.map(day => <th key={day} scope="col">星期{day}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {PERIODS.map((period, index) => (
                        <tr key={period.code}>
                            <th scope="row" className="timetable-sheet-period">
                                第 {period.code} 節<br />{period.start} ~ {period.end}
                            </th>
                            {DAYS.map(day => {
                                const course = occupancy[`${day}-${index}`];
                                return (
                                    <td
                                        key={day}
                                        data-testid={`sheet-slot-${day}-${index}`}
                                        data-state={course ? 'occupied' : 'free'}
                                    >
                                        {course ? (
                                            <>
                                                <span className="timetable-sheet-course">{`【${course.課程名稱}】`}</span>
                                                {showTeacher ? <><br />{course.授課老師}</> : null}
                                                {showClassroom ? <><br />{course.上課教室}</> : null}
                                            </>
                                        ) : null}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
