import html2canvas from 'html2canvas'
import { useState } from 'react'
function CurriculumTable({ courses }) {

    const [isShowTeacherButtonOn, setIsShowTeacherButtonOn] = useState(false)
    const [isShowClassroomButtonOn, setIsShowClassroomButtonOn] = useState(false)

    const CLASSES_COUNT = 14
    const DAYS = 6
    const CHINESE_WORD_TO_NUMBER = {
        '一': 1,
        '二': 2,
        '三': 3,
        '四': 4,
        '五': 5,
        '六': 6,
        '日': 7,
    }
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
    const tableRowsConst = [
        { 'nThClassText': '第 1 節', 'classTime': '08:10 ~ 09:00' },
        { 'nThClassText': '第 2 節', 'classTime': '09:10 ~ 10:00' },
        { 'nThClassText': '第 3 節', 'classTime': '10:10 ~ 11:00' },
        { 'nThClassText': '第 4 節', 'classTime': '11:10 ~ 12:00' },
        { 'nThClassText': '第 F 節', 'classTime': '12:10 ~ 13:00' },
        { 'nThClassText': '第 5 節', 'classTime': '13:20 ~ 14:10' },
        { 'nThClassText': '第 6 節', 'classTime': '14:20 ~ 15:10' },
        { 'nThClassText': '第 7 節', 'classTime': '15:20 ~ 16:10' },
        { 'nThClassText': '第 8 節', 'classTime': '16:20 ~ 17:10' },
        { 'nThClassText': '第 9 節', 'classTime': '17:20 ~ 18:10' },
        { 'nThClassText': '第 A 節', 'classTime': '18:30 ~ 19:15' },
        { 'nThClassText': '第 B 節', 'classTime': '19:20 ~ 20:05' },
        { 'nThClassText': '第 C 節', 'classTime': '20:10 ~ 21:55' },
        { 'nThClassText': '第 D 節', 'classTime': '21:00 ~ 21:45' },
    ]

    const downloadURI = (uri, fileName) => {
        let link = document.createElement("a")
        link.href = uri.replace('image/png', 'image/octet-stream')
        link.download = fileName
        link.click()
    }

    const onExportButtonClick = () => {
        const isConfirm = window.confirm('確定下載「選課結果.png」？(可能需要等待幾秒)')
        if (!isConfirm) {
            return
        }
        const table = document.getElementById('rendered-table')
        const originalBackgroundImage = table.style.backgroundImage
        const originalBorderRadius = table.style.borderRadius
        const originalBackgroundColor = table.style.backgroundColor
        const originalWidth = table.style.width

        table.style.backgroundImage = "linear-gradient(to right top, rgb(235, 154, 133),rgb(148, 214, 235))"
        table.style.backgroundColor = "rgba(255,255,255, 0.3)"
        table.style.borderRadius = "30px"
        table.style.width = "800px"

        html2canvas(table, {backgroundColor: null}).then(canvas => {
            const img = canvas.toDataURL('image/png')
            downloadURI(img, "選課結果.png")
        })
        table.style.backgroundImage = originalBackgroundImage
        table.style.borderRadius = originalBorderRadius
        table.style.backgroundColor = originalBackgroundColor
        table.style.width = originalWidth
    }

    const courseTdValues = new Array(CLASSES_COUNT).fill(0).map(() => new Array(DAYS).fill(''))

    courses.forEach(course => {
        course['上課時間'].forEach(classTime => {
            const day = CHINESE_WORD_TO_NUMBER[classTime['星期']] - 1
            const start = CLASS_MAP[classTime['開始節次']] - 1
            const end = CLASS_MAP[classTime['結束節次']] - 1
            for (let i = start; i <= end; ++i) {
                courseTdValues[i][day] = course
            }
        })
    })

    return (
        <div className="table-responsive shadow-sm  curriculum-table rounded" id='rendered-table'>
            <div className="form-check form-switch float-start ms-3">
                <input className="form-check-input" data-onstyle="success" type="checkbox" id="flexSwitchCheckDefault" onChange={() => setIsShowTeacherButtonOn(!isShowTeacherButtonOn)} />
                <label className="form-check-label" htmlFor="flexSwitchCheckDefault" >顯示授課老師</label>
            </div>
            <div className="form-check form-switch float-start ms-3">
                <input className="form-check-input" data-onstyle="success" type="checkbox" id="flexSwitchCheckDefault" onChange={() => setIsShowClassroomButtonOn(!isShowClassroomButtonOn)} />
                <label className="form-check-label" htmlFor="flexSwitchCheckDefault" >顯示課堂教室</label>
            </div>
            <button type="button" className=" btn-icon-circle float-end border-0 shadow-none me-2" title="下載課表" onClick={onExportButtonClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-filetype-png" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2v-1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5Zm-3.76 8.132c.076.153.123.317.14.492h-.776a.797.797 0 0 0-.097-.249.689.689 0 0 0-.17-.19.707.707 0 0 0-.237-.126.96.96 0 0 0-.299-.044c-.285 0-.506.1-.665.302-.156.201-.234.484-.234.85v.498c0 .234.032.439.097.615a.881.881 0 0 0 .304.413.87.87 0 0 0 .519.146.967.967 0 0 0 .457-.096.67.67 0 0 0 .272-.264c.06-.11.091-.23.091-.363v-.255H8.82v-.59h1.576v.798c0 .193-.032.377-.097.55a1.29 1.29 0 0 1-.293.458 1.37 1.37 0 0 1-.495.313c-.197.074-.43.111-.697.111a1.98 1.98 0 0 1-.753-.132 1.447 1.447 0 0 1-.533-.377 1.58 1.58 0 0 1-.32-.58 2.482 2.482 0 0 1-.105-.745v-.506c0-.362.067-.678.2-.95.134-.271.328-.482.582-.633.256-.152.565-.228.926-.228.238 0 .45.033.636.1.187.066.348.158.48.275.133.117.238.253.314.407Zm-8.64-.706H0v4h.791v-1.343h.803c.287 0 .531-.057.732-.172.203-.118.358-.276.463-.475a1.42 1.42 0 0 0 .161-.677c0-.25-.053-.475-.158-.677a1.176 1.176 0 0 0-.46-.477c-.2-.12-.443-.179-.732-.179Zm.545 1.333a.795.795 0 0 1-.085.381.574.574 0 0 1-.238.24.794.794 0 0 1-.375.082H.788v-1.406h.66c.218 0 .389.06.512.182.123.12.185.295.185.521Zm1.964 2.666V13.25h.032l1.761 2.675h.656v-3.999h-.75v2.66h-.032l-1.752-2.66h-.662v4h.747Z" />
                </svg>
            </button>
            
            <table className="table fs-6 table-bordered table-borderless non-border">
                <tbody>
                    <tr>
                        <th>節\\日</th>
                        <th>星期一</th>
                        <th>星期二</th>
                        <th>星期三</th>
                        <th>星期四</th>
                        <th>星期五</th>
                        <th>星期六</th>
                    </tr>
                    {
                        tableRowsConst.map((row, index) =>
                            <tr key={'row0' + index}>
                                <td>{row['nThClassText']}<br />{row['classTime']}</td>
                                {
                                    courseTdValues[index].map((courseTdValue, index2) =>
                                        <td key={'col0' + index2} className={courseTdValue ? "used-course-td" : "unused-course-td"}>
                                            {courseTdValue ? "【" + courseTdValue['課程名稱'] + "】" : ""}
                                            <br />

                                            {isShowTeacherButtonOn ? <br/> : ""}
                                            {isShowTeacherButtonOn ? courseTdValue['授課老師'] : ""}
                                            {isShowClassroomButtonOn ? <br/> : ""}
                                            {isShowClassroomButtonOn ? courseTdValue['上課教室'] : ""}
                                        </td>
                                    )
                                }
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </div>
    )
}

export default CurriculumTable