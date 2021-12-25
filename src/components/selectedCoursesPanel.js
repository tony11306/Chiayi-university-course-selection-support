import CurriculumTableRow from "./curriculumTableRow"

function SelectedCoursesPanel({ userSelectedCourses, onDeleteCourse }) {

    const handleDeleteCourse = (deletingCourse) => {
        const newSelectedCourses = [...userSelectedCourses]
        onDeleteCourse(newSelectedCourses.filter(course => course !== deletingCourse))
    }

    const deleteAllCourses = () => {
        const isConfirm = window.confirm('確定清空所有課程？')
        if(!isConfirm) {
            return
        }
        onDeleteCourse([])
    }

    return (
        <div className="offcanvas offcanvas-start" data-bs-scroll="true" tabIndex="-1" id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title fs-3" id="offcanvasWithBothOptionsLabel">已選擇的課程</h5>

                <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">

                <button type="button" className="btn btn-danger float-end" onClick={deleteAllCourses}>
                    清空
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                    </svg>
                </button>
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
                        {userSelectedCourses.map(course => <CurriculumTableRow key={course['開課系號'] + course['開課序號'] + course['永久課號'] + '2'} course={course} onUserSelect={handleDeleteCourse} isDisabled={false} />)}

                    </tbody>
                </table>
                {userSelectedCourses.length === 0 ? <span>你還沒有選擇課程</span> : ""}

            </div>
        </div>

    )
}

export default SelectedCoursesPanel