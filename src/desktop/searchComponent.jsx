import Dropdown from "./dropdown"
import { useGlobalData } from "../hooks/useGlobalData"
import { CAMPUS, DAY, CLASS_TIME, GRADE, COURSE_TYPE, DEPARTMENTS, EDUCATION_LEVEL } from "../lib/filterOptions"

export default function SearchComponent({ displaySettings, setDisplaySettings }) {
    const { filters, setFilters, } = useGlobalData();

    function onCampusSelected(value) {
        setFilters(f => ({ ...f, campus: value }))
    }

    function onDepartmentSelected(value) {
        setFilters(f => ({ ...f, department: value }))
    }

    function onEducationLevelSelected(value) {
        setFilters(f => ({ ...f, educationLevel: value }))
    }

    function onGradeSelected(value) {
        setFilters(f => ({ ...f, grade: value }))
    }

    function onCourseTypeSelected(value) {
        setFilters(f => ({ ...f, courseType: value }))
    }

    function onDaySelected(value) {
        setFilters(f => ({ ...f, day: value }))
    }

    function onStartClassSelected(value) {
        setFilters(f => ({ ...f, startClass: value }))
    }

    function onEndClassSelected(value) {
        setFilters(f => ({ ...f, endClass: value }))
    }

    function onKeywordChanged(value) {
        setDisplaySettings(s => ({ ...s, keyword: value }))
    }

    function onShowConflictedCheckChange(value) {
        setDisplaySettings(s => ({ ...s, isShowedConflictedCourses: value }))
    }

    return (
        <div>

            <div className="mb-1">
                <input className="search-bar rounded-pill border-0 shadow-sm mt-3 w-75 ml-3" value={displaySettings.keyword} onChange={e => onKeywordChanged(e.target.value)} placeholder="課程關鍵字、系所、教授、上課學制"></input>
                <details>

                    <summary>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill" viewBox="0 0 16 16">
                            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z" />
                        </svg>
                        篩選器(建議使用)
                    </summary>
                    <div className="row">

                        <div className="btn-group btn-group-sm flex-wrap" role="group">
                            <Dropdown key="campus" dropdownName="校區" defaultValue={filters.campus} dropdownItems={CAMPUS} onSelected={onCampusSelected} />
                            <Dropdown key="education_level" dropdownName="上課學制" defaultValue={filters.educationLevel} dropdownItems={EDUCATION_LEVEL} onSelected={onEducationLevelSelected}/>
                            <Dropdown key="grade" dropdownName="適用年級" defaultValue={filters.grade} dropdownItems={GRADE} onSelected={onGradeSelected} />
                            <Dropdown key="course_type" dropdownName="課程類別" defaultValue={filters.courseType} dropdownItems={COURSE_TYPE} onSelected={onCourseTypeSelected} />
                        </div>
                        <div className="btn-group btn-group-sm flex-wrap">
                            <Dropdown key="department" dropdownName="上課系所" defaultValue={filters.department} dropdownItems={DEPARTMENTS} onSelected={onDepartmentSelected} />
                            <Dropdown key="day" dropdownName="星期" defaultValue={filters.day} dropdownItems={DAY} onSelected={onDaySelected} />
                            <Dropdown key="start_class" dropdownName="開始節次" defaultValue={filters.startClass} dropdownItems={CLASS_TIME} onSelected={onStartClassSelected} />
                            <Dropdown key="end_class" dropdownName="結束節次" defaultValue={filters.endClass} dropdownItems={CLASS_TIME} onSelected={onEndClassSelected} />

                        </div>
                        <div className="btn-group btn-group-sm  form-inline flex-wrap">
                            <div className="form-check form-switch offset-md-9 ">
                                <label className="form-check-label fs-5" htmlFor="flexSwitchCheckChecked">是否隱藏衝堂</label>
                                <input className="form-check-input" type="checkbox" id="flexSwitchCheckChecked" checked={!displaySettings.isShowedConflictedCourses} onChange={() => onShowConflictedCheckChange(!displaySettings.isShowedConflictedCourses)} />
                            </div>
                        </div>
                    </div>

                </details>
            </div>
        </div>
    )
}