import Dropdown from "./dropdown"
import { useGlobalData } from "../hooks/useGlobalData"

export default function SearchComponent({ displaySettings, setDisplaySettings }) {
    const { filters, setFilters, } = useGlobalData();

    const CAMPUS = ['不限' ,'蘭潭校區', '民雄校區', '新民校區', '林森校區', 'ecourse 線上']
    const DAY = ['不限', '一', '二', '三', '四', '五', '六', '日']
    const CLASS_TIME = ['不限', '1', '2', '3', '4', 'F', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D']
    const GRADE = ['不限', '1', '2', '3', '4', '5']
    const COURSE_TYPE = [
        '不限',
        '專業選修課程',
        '專業必修課程',
        '通識教育必修選項：基礎程式設計',
        '通識教育必修科目',
        '通識教育必修選項：英文',
        '通識教育必修選項：體育',
        '通識教育必修選項：大學國文',
        '通識教育選修選項：通識領域課程',
        '校訂選修',
        '教育學程必修科目：教育實踐課程',
        '共同選修',
        '其他選修',
        '教育學程必修科目：教育方法課程',
        '教育學程必修科目：專門課程',
        '教育學程必修科目：教育基礎課程',
        '通識教育選修選項：通識網路課程',
    ]

    const DEPARTMENTS = [
        '不限',
        '農藝系',
        '木設系',
        '景觀系',
        '應數系',
        '土木系',
        '電機系',
        '食科系',
        '生資系',
        '生化系',
        '森林系',
        '動科系',
        '應化系博班',
        '應化系碩班',
        '土木系碩班',
        '食科系碩班',
        '植醫系碩班',
        '園藝系',
        '生農系',
        '電物系',
        '應化系',
        '生機系',
        '資工系',
        '機械系',
        '植醫系',
        '農學博學程',
        '農藝系碩班',
        '園藝系碩班',
        '木設系碩班',
        '生機系碩班',
        '水生系',
        '微藥系',
        '農管進學程',
        '農院全英碩',
        '森林系碩班',
        '生農系碩班',
        '電物光電碩',
        '機能系碩班',
        '生化系碩班',
        '電機系碩班',
        '動科系碩班',
        '景觀系碩班',
        '獸醫系',
        '資工系碩班',
        '生科全英碩',
        '生資系碩班',
        '水生系碩班',
        '微藥系碩班',
        '體健休系',
        '土木碩專班',
        '食科系博班',
        '資工系博班',
        '應數系碩班',
        '食科碩專班',
        '生化碩專班',
        '農學碩專班',
        '生機碩專班',
        '外語系',
        '藝術系',
        '音樂系',
        '輔諮系',
        '輔諮系碩班',
        '應歷系碩班',
        '數位系',
        '應用歷史系',
        '教育系',
        '特教系',
        '幼教系',
        '中文系',
        '師院國際碩',
        '體健休系碩',
        '應歷系碩專',
        '中文系碩班',
        '特教系碩班',
        '輔諮碩專班',
        '幼教系碩班',
        '音樂系碩班',
        '數位系碩班',
        '外語系碩班',
        '教育系博班',
        '教研碩班',
        '數理碩班',
        '藝術系碩班',
        '教研碩專',
        '教政碩班',
        '教政碩專',
        '幼研碩專班',
        '體健休碩專',
        '中研專班',
        '數理碩專',
        '企管系博班',
        '企管系碩班',
        '行銷所碩班',
        '生管系',
        '應經系',
        '企管系',
        '資管系',
        '財金系',
        '行銷觀光系',
        '獸醫系碩班',
        '生管系碩班',
        '全英文學程',
        '觀光所碩班',
        '資管系碩班',
        '財金系碩班',
        '觀光所博班',
        '獸醫臨床碩',
        '管院碩專班',
    ]
    const EDUCATION_LEVEL = ['博士班', '大學部', '碩士班', '碩專班', '進學班']

    function onCampusSelected(value) {
        setFilters({ ...filters, campus: value })
    }

    function onDepartmentSelected(value) {
        setFilters({ ...filters, department: value })
    }

    function onEducationLevelSelected(value) {
        setFilters({ ...filters, educationLevel: value })
    }

    function onGradeSelected(value) {
        setFilters({ ...filters, grade: value })
    }

    function onCourseTypeSelected(value) {
        setFilters({ ...filters, courseType: value })
    }

    function onDaySelected(value) {
        setFilters({ ...filters, day: value })
    }

    function onStartClassSelected(value) {
        setFilters({ ...filters, startClass: value })
    }

    function onEndClassSelected(value) {
        setFilters({ ...filters, endClass: value })
    }

    function onKeywordChanged(value) {
        setDisplaySettings({ ...displaySettings, keyword: value })
    }

    function onShowConflictedCheckChange(value) {
        setDisplaySettings({ ...displaySettings, isShowedConflictedCourses: value })
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