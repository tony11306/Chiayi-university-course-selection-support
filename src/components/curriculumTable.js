import html2canvas from 'html2canvas'
import { useState } from 'react'
function CurriculumTable({ courses }) {
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

    const downloadURI = (uri, fileName) => {
        let link = document.createElement("a")
        link.href = uri.replace('image/png', 'image/octet-stream')
        link.download = fileName
        link.click()
    }

    const onExportButtonClick = () => {
        const isConfirm = window.confirm('確定下載「選課結果.png」？(可能需要等待幾秒)')
        if(!isConfirm) {
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
                courseTdValues[i][day] = course['課程名稱']
            }
        })
    })

    return (
        <div className="table-responsive shadow-sm  curriculum-table">
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
                    <tr>
                        <td>第 1 節<br />08:10 ~ 09:00</td>
                        {courseTdValues[0].map((courseTdValue, index) => <td key={'row0' + index} className={courseTdValue ? "used-course-td" : "unused-course-td"}>{courseTdValue}</td>)}
                    </tr>
                    <tr>
                        <td>第 2 節<br />09:10 ~ 10:00</td>
                        {courseTdValues[1].map((courseTdValue, index) => <td key={'row1' + index} className={courseTdValue ? "used-course-td" : "unused-course-td"}>{courseTdValue}</td>)}
                    </tr>
                    <tr>
                        <td>第 3 節<br />10:10 ~ 11:00</td>
                        {courseTdValues[2].map((courseTdValue, index) => <td key={'row2' + index} className={courseTdValue ? "used-course-td" : "unused-course-td"}>{courseTdValue}</td>)}
                    </tr>
                    <tr>
                        <td>第 4 節<br />11:10 ~ 12:00</td>
                        {courseTdValues[3].map((courseTdValue, index) => <td key={'row3' + index} className={courseTdValue ? "used-course-td" : "unused-course-td"}>{courseTdValue}</td>)}
                    </tr>
                    <tr>
                        <td>第 F 節<br />12:10 ~ 13:00</td>
                        {courseTdValues[4].map((courseTdValue, index) => <td key={'row4' + index} className={courseTdValue ? "used-course-td" : "unused-course-td"}>{courseTdValue}</td>)}
                    </tr>
                    <tr>
                        <td>第 5 節<br />13:20 ~ 14:10</td>
                        {courseTdValues[5].map((courseTdValue, index) => <td key={'row5' + index} className={courseTdValue ? "used-course-td" : "unused-course-td"}>{courseTdValue}</td>)}
                    </tr>
                    <tr>
                        <td>第 6 節<br />14:20 ~ 15:10</td>
                        {courseTdValues[6].map((courseTdValue, index) => <td key={'row6' + index} className={courseTdValue ? "used-course-td" : "unused-course-td"}>{courseTdValue}</td>)}
                    </tr>
                    <tr>
                        <td>第 7 節<br />15:20 ~ 16:10</td>
                        {courseTdValues[7].map((courseTdValue, index) => <td key={'row7' + index} className={courseTdValue ? "used-course-td" : "unused-course-td"}>{courseTdValue}</td>)}
                    </tr>
                    <tr>
                        <td>第 8 節<br />16:20 ~ 17:10</td>
                        {courseTdValues[8].map((courseTdValue, index) => <td key={'row8' + index} className={courseTdValue ? "used-course-td" : "unused-course-td"}>{courseTdValue}</td>)}
                    </tr>
                    <tr>
                        <td>第 9 節<br />17:20 ~ 18:10</td>
                        {courseTdValues[9].map((courseTdValue, index) => <td key={'row9' + index} className={courseTdValue ? "used-course-td" : "unused-course-td"}>{courseTdValue}</td>)}
                    </tr>
                    <tr>
                        <td>第 A 節<br />18:30 ~ 19:15</td>
                        {courseTdValues[10].map((courseTdValue, index) => <td key={'rowA' + index} className={courseTdValue ? "used-course-td" : "unused-course-td"}>{courseTdValue}</td>)}
                    </tr>
                    <tr>
                        <td>第 B 節<br />19:20 ~ 20:05</td>
                        {courseTdValues[11].map((courseTdValue, index) => <td key={'rowB' + index} className={courseTdValue ? "used-course-td" : "unused-course-td"}>{courseTdValue}</td>)}
                    </tr>
                    <tr>
                        <td>第 C 節<br />20:10 ~ 21:55</td>
                        {courseTdValues[12].map((courseTdValue, index) => <td key={'rowC' + index} className={courseTdValue ? "used-course-td" : "unused-course-td"}>{courseTdValue}</td>)}
                    </tr>
                    <tr>
                        <td>第 D 節<br />21:00 ~ 21:45</td>
                        {courseTdValues[13].map((courseTdValue, index) => <td key={'rowD' + index} className={courseTdValue ? "used-course-td" : "unused-course-td"}>{courseTdValue}</td>)}
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default CurriculumTable