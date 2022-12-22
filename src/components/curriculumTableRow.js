import React, {useState} from "react"

function CourseDataRow({ course, onUserSelect, isDisabled }) {
    const eduType = course['上課學制']
    const campus = course['校區']
    const courseName = '【' + eduType + '】' + course['課程名稱']
    const teacher = course['授課老師']
    const departmentTake = course['上課系所']
    const courseOutlineURL = course['教學大綱']
    const courseTime = course['上課時間']
    const credit = course['學分數']
    const grade = course['適用年級'] === '1' ? '一' :
    course['適用年級'] === '2' ? '二' :
    course['適用年級'] === '3' ? '三' :
    course['適用年級'] === '4' ? '四' :
    '五'

    return (
        <React.Fragment>
            <tr className={(isDisabled ? "conflict-warning" : "")}>
                <td>
                    <div className={
                        campus === "蘭潭校區" ? "badge rounded-pill bg-primary" :
                            campus === "民雄校區" ? "badge rounded-pill bg-secondary" :
                                campus === "新民校區" ? "badge rounded-pill bg-success" :
                                    campus === "林森校區" ? "badge rounded-pill bg-warning" : 
                                        campus === "ecourse 線上" ? "badge rounded-pill badge bg-dark" : ""
                    }>
                        {campus}
                    </div>
                </td>
                <td>{grade}</td>
                <td>{departmentTake.length !== 1 ? departmentTake : "不限"}</td>
                <td>{courseOutlineURL.length !== 0 ?
                    <a className="text-decoration-none" href={courseOutlineURL} target="_blank">
                        {courseName}
                    </a>
                    : courseName}</td>
                <td>
                    <a className="text-decoration-none" href={"https://www.google.com/search?q="+teacher+"+嘉義大學+dcard+%7C+ptt"} target="_blank">
                        {teacher}
                    </a>
                </td>
                <td>{credit}</td>
                <td>{courseTime.map((singleCourseTime, index) => {
                    return (
                        <div key={"badge " + index} className="badge bg-primary">
                            {singleCourseTime['星期'] + " " + singleCourseTime['開始節次'] + '~' + singleCourseTime['結束節次']}
                        </div>
                    )
                })}</td>
                <td>
                    <input className="form-check-input" type="checkbox" value="" onChange={() => onUserSelect(course)} disabled={isDisabled} />
                </td>

            </tr>
        </React.Fragment>
    )
}

export default CourseDataRow
