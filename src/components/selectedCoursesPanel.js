import CurriculumTableRow from "./curriculumTableRow"

function SelectedCoursesPanel({ userSelectedCourses, onDeleteCourse }) {

    const handleDeleteCourse = (deletingCourse) => {
        const newSelectedCourses = [...userSelectedCourses]
        onDeleteCourse(newSelectedCourses.filter(course => course !== deletingCourse))
    }

    return (
        <div className="offcanvas offcanvas-start" data-bs-scroll="true" tabIndex="-1" id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title fs-3" id="offcanvasWithBothOptionsLabel">已選擇的課程</h5>

                <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">

                <table className="table table-striped">
                    <tbody>
                        <tr>
                            <th>校區</th>
                            <th>上課系所</th>
                            <th>課程名稱</th>
                            <th>老師</th>
                            <th>學分數</th>
                            <th>上課時間</th>
                            <th>移除</th>
                        </tr>
                        {userSelectedCourses.map(course => <CurriculumTableRow key={course['開課系號'] + course['開課序號'] + course['永久課號'] + '2'} course={course} onUserSelect={handleDeleteCourse} isDisabled={false}/>)}
                        
                    </tbody>
                </table>
                {userSelectedCourses.length === 0 ? <span>你還沒有選擇課程</span> : ""}

            </div>
        </div>

    )
}

export default SelectedCoursesPanel