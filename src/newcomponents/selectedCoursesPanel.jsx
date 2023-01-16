import { useGlobalData } from "../hooks/useGlobalData";

export default function SelectedCoursesPanel() {
    const { userSelectedCourses, setUserSelectedCourses } = useGlobalData();
    const totalCredit = userSelectedCourses.reduce((prev, current) => prev + parseInt(current.學分數, 10), 0)

    function onRemove(courseData) {
        setUserSelectedCourses(userSelectedCourses.filter(course => course !== courseData))
    }

    function onRemoveAll() {
        const isConfirmed = window.confirm('確定清空所有課程？');
        if (isConfirmed) {
            setUserSelectedCourses([]);
        }
    }

    return (
        <>
            <div className='relative-wrapper'>
                <button className='btn edit-btn blur-background shadow-none' data-bs-toggle="modal" data-bs-target="#selected-courses-modal">
                    <div className='cnt-div'>
                        {userSelectedCourses.length}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-bookmark-star" viewBox="0 0 16 16">
                        <path d="M7.84 4.1a.178.178 0 0 1 .32 0l.634 1.285a.178.178 0 0 0 .134.098l1.42.206c.145.021.204.2.098.303L9.42 6.993a.178.178 0 0 0-.051.158l.242 1.414a.178.178 0 0 1-.258.187l-1.27-.668a.178.178 0 0 0-.165 0l-1.27.668a.178.178 0 0 1-.257-.187l.242-1.414a.178.178 0 0 0-.05-.158l-1.03-1.001a.178.178 0 0 1 .098-.303l1.42-.206a.178.178 0 0 0 .134-.098L7.84 4.1z" />
                        <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z" />
                    </svg>
                </button>
            </div>
            <div id="selected-courses-modal" className="modal" tabIndex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content border-0 rounded">
                        <div className="modal-header">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-bookmark-star" viewBox="0 0 16 16">
                                <path d="M7.84 4.1a.178.178 0 0 1 .32 0l.634 1.285a.178.178 0 0 0 .134.098l1.42.206c.145.021.204.2.098.303L9.42 6.993a.178.178 0 0 0-.051.158l.242 1.414a.178.178 0 0 1-.258.187l-1.27-.668a.178.178 0 0 0-.165 0l-1.27.668a.178.178 0 0 1-.257-.187l.242-1.414a.178.178 0 0 0-.05-.158l-1.03-1.001a.178.178 0 0 1 .098-.303l1.42-.206a.178.178 0 0 0 .134-.098L7.84 4.1z" />
                                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z" />
                            </svg>
                            <h5 className="fw-bold m-1">已選擇的課程</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="mt-3 mb-3">
                            <div className="float-start ms-3">已選擇 {userSelectedCourses.length} 堂課，共 {totalCredit} 學分</div>
                            <button type="button" className="btn btn-danger float-end w-25 fw-bold" onClick={onRemoveAll}>
                                清空
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                </svg>
                            </button>
                        </div>

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
                                        <th>移除</th>
                                    </tr>
                                    {userSelectedCourses.map(course => 
                                        <tr key={course.開課系號 + course.開課序號 + course.永久課號 + '2'}>
                                            <td>
                                                <div className={
                                                    course.校區 === "蘭潭校區" ? "badge rounded-pill bg-primary" :
                                                    course.校區 === "民雄校區" ? "badge rounded-pill bg-secondary" :
                                                    course.校區 === "新民校區" ? "badge rounded-pill bg-success" :
                                                    course.校區 === "林森校區" ? "badge rounded-pill bg-warning" : 
                                                    course.校區 === "ecourse 線上" ? "badge rounded-pill badge bg-dark" : ""
                                                }>
                                                    {course.校區}
                                                </div>
                                            </td>
                                            <td>
                                                {
                                                    course.適用年級 === "1" ? "一":
                                                    course.適用年級 === "2" ? "二":
                                                    course.適用年級 === "3" ? "三":
                                                    course.適用年級 === "4" ? "四":
                                                    "五"
                                                }
                                            </td>
                                            <td>
                                                {course.上課系所.length !== 1 ? course.上課系所 : "不限"}
                                            </td>
                                            <td>
                                                {course.教學大綱.length !== 0 ? <a className="text-decoration-none" href={course.教學大綱} target="_blank" rel="noreferrer">{course.課程名稱}</a> : course.課程名稱}
                                            </td>
                                            <td>
                                                <a className="text-decoration-none" href={"https://www.google.com/search?q="+course.授課老師+"+嘉義大學+dcard+%7C+ptt"} target="_blank" rel="noreferrer">
                                                    {course.授課老師}
                                                </a>
                                            </td>
                                            <td>{course.學分數}</td>
                                            <td>{course.上課時間.map((courseTime, index) => {
                                                return (
                                                    <div key={"badge " + index} className="badge bg-primary">
                                                        {courseTime.星期 + " " + courseTime.開始節次 + '~' + courseTime.結束節次}
                                                    </div>
                                                )
                                            })}</td>
                                            <td>
                                                <input className="form-check-input" type="checkbox" value="" onChange={() => onRemove(course)} />
                                            </td>
                                        </tr>
                                    )}

                                </tbody>
                            </table>
                            {userSelectedCourses.length === 0 ? <span>你還沒有選擇課程</span> : ""}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}