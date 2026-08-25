import { useGlobalData, useCourseDatas } from "../hooks/useGlobalData";
import { courseKey } from "../lib/schedule";
import { teacherReviewUrl } from "../lib/searchLinks";

export default function CourseSelectionTable({ displaySettings }) {
    const { isSelected, findConflictWith, addCourse } = useGlobalData();
    const { data, isFetching, error } = useCourseDatas();
    const courseDatas = data?.result ?? [];
    const displayedCourses = courseDatas.filter(course => {
        if (isSelected(course)) {
            return false
        }
        if (!displaySettings.isShowedConflictedCourses && findConflictWith(course)) {
            return false
        }
        if (displaySettings.keyword !== '' && course.課程名稱.indexOf(displaySettings.keyword) === -1) {
            return false
        }

        return true
    });

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
                        !error && displayedCourses.map(courseData => {
                            return (
                                <CourseSelectionTableRow key={courseKey(courseData)} courseData={courseData} isDisabled={Boolean(findConflictWith(courseData))} onSelected={addCourse}  />
                            )
                        })
                    }
                </tbody>
            </table>
            {isFetching && !data ?
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
            {!error && data !== undefined && !isFetching && displayedCourses.length === 0 ? <span className="fs-3">查無結果</span> : ""}
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
                {courseData.教學大綱.length !== 0 ? <a className="text-decoration-none" href={courseData.教學大綱} target="_blank" rel="noreferrer">{"【" + courseData.上課學制 + "】" + courseData.課程名稱}</a> : "【" + courseData.上課學制 + "】" + courseData.課程名稱}
            </td>
            <td>
                <a className="text-decoration-none" href={teacherReviewUrl(courseData.授課老師)} target="_blank" rel="noreferrer">
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