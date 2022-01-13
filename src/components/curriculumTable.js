import html2canvas from 'html2canvas'
import { useState } from 'react'
function CurriculumTable({ courses }) {

    const [isShowTeacherButtonOn, setIsShowTeacherButtonOn] = useState(false)

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

        html2canvas(table).then(canvas => {
            const img = canvas.toDataURL('image/png')
            downloadURI(img, "選課結果.png")
        })
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
        <div className="table-responsive shadow-sm  curriculum-table">
            <div className="form-check form-switch float-start">
                <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" onChange={()=>setIsShowTeacherButtonOn(!isShowTeacherButtonOn)}/>
                    <label className="form-check-label" for="flexSwitchCheckDefault" >顯示授課老師</label>
            </div>
            <button type="button" className="btn btn-success float-end" onClick={onExportButtonClick}>輸出為 png 圖片</button>
            <table className="table fs-6 table-bordered table-borderless" id='rendered-table'>
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
                            <tr >
                                <td>{row['nThClassText']}<br />{row['classTime']}</td>
                                {
                                    courseTdValues[index].map((courseTdValue, index2) =>
                                        <td key={'col0' + index2} className={courseTdValue ? "used-course-td" : "unused-course-td"}>
                                            {courseTdValue ? "【" + courseTdValue['課程名稱'] + "】" : ""}
                                            <br />
                                            {isShowTeacherButtonOn ? courseTdValue['授課老師'] : ""}
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