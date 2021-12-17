function CurriculumTableRow({ course, onUserSelect, isDisabled }) {
    const campus = course['校區']
    const courseName = course['課程名稱']
    const teacher = course['授課老師']
    const departmentTake = course['上課系所']
    const courseOutlineURL = course['教學大綱']
    const courseTime = course['上課時間']

    const courseNameWithOutline = (
        <a href={courseOutlineURL} target="_blank" style={{textDecoration: "none"}}>
            {courseName}
        </a>
    )

    const courseTimeMap = (singleCourseTime, index) => {
        return (
            
            <div key={"badge " + index} className="badge bg-primary">
                {singleCourseTime['星期'] + " " + singleCourseTime['開始節次'] + '~' + singleCourseTime['結束節次']}
            </div>
        )
        
    }

    return (
        <tr className={isDisabled ? "bg-warning" : ""}>
            <td>
                <div className={
                    campus === "蘭潭校區" ? "badge rounded-pill bg-primary" :
                        campus === "民雄校區" ? "badge rounded-pill bg-secondary" :
                            campus === "新民校區" ? "badge rounded-pill bg-success" :
                                campus === "林森校區" ? "badge rounded-pill bg-warning" : ""
                }>
                    {campus}
                </div>
            </td>
            <td>{departmentTake.length != 1 ? departmentTake : "不限"}</td>
            <td>{courseOutlineURL.length !== 0 ? courseNameWithOutline : courseName}</td>
            <td>{teacher}</td>
            <td>{courseTime.map(courseTimeMap)}</td>
            <td>
                <input className="form-check-input" type="checkbox" value="" onChange={() => onUserSelect(course)} disabled={isDisabled}/>
            </td>
        </tr>
    )
}

export default CurriculumTableRow