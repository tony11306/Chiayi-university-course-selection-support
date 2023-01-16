import axios from 'axios'

const BASE_URL = 'https://ncyu-courseapi.azurewebsites.net'

export async function getCourseDatas({campus, day, educationLevel, startClass, endClass, grade, department, courseType}) {
    return axios.get(BASE_URL + '/course_selection', {
        params: {
            校區: campus,
            星期: day,
            開始節次: startClass,
            結束節次: endClass,
            適用年級: grade,
            課程類別: courseType,
            上課系所: department,
            上課學制: educationLevel
        }
    })
}