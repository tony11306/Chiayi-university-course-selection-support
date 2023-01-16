import { useGlobalData } from "../hooks/useGlobalData";

export default function CourseSelectionTable({ displaySettings }) {

    const { courseDatas, userSelectedCourses, setUserSelectedCourses, loading, error } = useGlobalData();
    const displayedCourses = courseDatas ? courseDatas.filter(course => {
        if (userSelectedCourses.some(userSelectedCourse => userSelectedCourse.開課系號 + userSelectedCourse.開課序號 + userSelectedCourse.永久課號 === course.開課系號 + course.開課序號 + course.永久課號)) {
            return false
        }
        if (displaySettings.isShowedConflictedCourses === false && isOverlapWithUserSelectedCourses(course)) {
            return false
        }
        if (displaySettings.keyword !== '' && course.課程名稱.indexOf(displaySettings.keyword) === -1) {
            return false
        }

        return true
    }) : [];

    function isOverlap(course1, course2) {

        const CLASS_MAP = {
            '1': 1,
            '2': 2,
            '3': 3,
            '4': 4,
            'F': 5,
            '5': 6,
            '6': 7,
            '7': 8,
            '8': 9,
            '9': 10,
            'A': 11,
            'B': 12,
            'C': 13,
            'D': 14
        }
        for (let i = 0; i < course1['上課時間'].length; ++i) {
            for (let j = 0; j < course2['上課時間'].length; ++j) {
                if (course1['上課時間'][i]['星期'] === course2['上課時間'][j]['星期']) {
                    if (CLASS_MAP[course1['上課時間'][i]['開始節次']] <= CLASS_MAP[course2['上課時間'][j]['結束節次']] && CLASS_MAP[course2['上課時間'][j]['開始節次']] <= CLASS_MAP[course1['上課時間'][i]['結束節次']]) {
                        return true
                    }
                }
            }
        }

        return false;
    }

    function isOverlapWithUserSelectedCourses(course) {
        for (let i = 0; i < userSelectedCourses.length; ++i) {
            if (isOverlap(course, userSelectedCourses[i])) {
                return true
            }
        }
        return false
    }

    function onSelected(courseData) {
        setUserSelectedCourses([...userSelectedCourses, courseData])
    }

    return (
        <div className="table-wrapper-scroll-y custom-scrollbar">
            <table className="table table-striped non-border align-middle table-first-row-white">
                <tbody>
                    <tr className="position-sticky top-0 blur-background">
                        <th>校區</th>
                        <th>年級</th>
                        <th>上課系所</th>
                        <th>課程名稱</th>
                        <th>老師</th>
                        <th>學分數</th>
                        <th>上課時間</th>
                        <th>選擇</th>
                    </tr>
                    {
                        !loading && !error && displayedCourses.map((courseData, index) => {
                            return (
                                <CourseSelectionTableRow key={index} courseData={courseData} isDisabled={isOverlapWithUserSelectedCourses(courseData)} onSelected={onSelected}  />
                            )
                        })
                    }
                </tbody>
            </table>
            {loading ?
                <div>
                    <div className="spinner-grow" role="status">
                        <span className="visually-hidden">正在載入資料...</span>
                    </div>
                    <span className="fs-3 ms-3">載入中...</span>
                    <br />
                    <span className="text-muted">(若載入時間很長，通常代表後端在從休眠到起床)</span>
                </div>
                : ""}
            {error ? <span className="fs-3">發生錯誤</span> : ""}
            {!error && !loading && displayedCourses.length === 0 ? <span className="fs-3">查無結果</span> : ""}
        </div>
    )
}

function CourseSelectionTableRow({ courseData, isDisabled, onSelected }) {
    return (
        <tr className={isDisabled ? "conflict-warning" : ""}>
            <td>
                <div className={
                    courseData.校區 === "蘭潭校區" ? "badge rounded-pill bg-primary" :
                    courseData.校區 === "民雄校區" ? "badge rounded-pill bg-secondary" :
                    courseData.校區 === "新民校區" ? "badge rounded-pill bg-success" :
                    courseData.校區 === "林森校區" ? "badge rounded-pill bg-warning" : 
                    courseData.校區 === "ecourse 線上" ? "badge rounded-pill badge bg-dark" : ""
                }>
                    {courseData.校區}
                </div>
            </td>
            <td>
                {
                    courseData.適用年級 === "1" ? "一":
                    courseData.適用年級 === "2" ? "二":
                    courseData.適用年級 === "3" ? "三":
                    courseData.適用年級 === "4" ? "四":
                    "五"
                }
            </td>
            <td>
                {courseData.上課系所.length !== 1 ? courseData.上課系所 : "不限"}
            </td>
            <td>
                {courseData.教學大綱.length !== 0 ? <a className="text-decoration-none" href={courseData.教學大綱} target="_blank">{courseData.課程名稱}</a> : courseData.課程名稱}
            </td>
            <td>
                <a className="text-decoration-none" href={"https://www.google.com/search?q="+courseData.授課老師+"+嘉義大學+dcard+%7C+ptt"} target="_blank">
                    {courseData.授課老師}
                </a>
            </td>
            <td>{courseData.學分數}</td>
            <td>{courseData.上課時間.map((courseTime, index) => {
                return (
                    <div key={"badge " + index} className="badge bg-primary">
                        {courseTime.星期 + " " + courseTime.開始節次 + '~' + courseTime.結束節次}
                    </div>
                )
            })}</td>
            <td>
                <input className="form-check-input" type="checkbox" value="" checked={false} onChange={() => onSelected(courseData)} disabled={isDisabled} />
            </td>
        </tr>
    )
}