import { PERIODS } from "./schedule";

export const ANY = '不限';

export const CAMPUS = [ANY, '蘭潭校區', '民雄校區', '新民校區', '林森校區', 'ecourse 線上'];

export const EDUCATION_LEVEL = [ANY, '大學部', '碩士班', '碩專班', '博士班', '進學班'];

export const DAY = [ANY, '一', '二', '三', '四', '五', '六', '日'];

export const CLASS_TIME = [ANY, ...PERIODS.map(period => period.code)];

export const GRADE = [ANY, '1', '2', '3', '4', '5'];

export const COURSE_TYPE = [
    ANY,
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
];

export const DEPARTMENTS = [
    ANY,
    '農藝系', '木設系', '景觀系', '應數系', '土木系', '電機系', '食科系', '生資系', '生化系',
    '森林系', '動科系', '應化系博班', '應化系碩班', '土木系碩班', '食科系碩班', '植醫系碩班',
    '園藝系', '生農系', '電物系', '應化系', '生機系', '資工系', '機械系', '植醫系',
    '農學博學程', '農藝系碩班', '園藝系碩班', '木設系碩班', '生機系碩班', '水生系', '微藥系',
    '農管進學程', '農院全英碩', '森林系碩班', '生農系碩班', '電物光電碩', '機能系碩班',
    '生化系碩班', '電機系碩班', '動科系碩班', '景觀系碩班', '獸醫系', '資工系碩班',
    '生科全英碩', '生資系碩班', '水生系碩班', '微藥系碩班', '體健休系', '土木碩專班',
    '食科系博班', '資工系博班', '應數系碩班', '食科碩專班', '生化碩專班', '農學碩專班',
    '生機碩專班', '外語系', '藝術系', '音樂系', '輔諮系', '輔諮系碩班', '應歷系碩班',
    '數位系', '應用歷史系', '教育系', '特教系', '幼教系', '中文系', '師院國際碩',
    '體健休系碩', '應歷系碩專', '中文系碩班', '特教系碩班', '輔諮碩專班', '幼教系碩班',
    '音樂系碩班', '數位系碩班', '外語系碩班', '教育系博班', '教研碩班', '數理碩班',
    '藝術系碩班', '教研碩專', '教政碩班', '教政碩專', '幼研碩專班', '體健休碩專',
    '中研專班', '數理碩專', '企管系博班', '企管系碩班', '行銷所碩班', '生管系', '應經系',
    '企管系', '資管系', '財金系', '行銷觀光系', '獸醫系碩班', '生管系碩班', '全英文學程',
    '觀光所碩班', '資管系碩班', '財金系碩班', '觀光所博班', '獸醫臨床碩', '管院碩專班',
];

export const FILTER_FIELDS = [
    { key: 'campus', label: '校區', options: CAMPUS },
    { key: 'educationLevel', label: '上課學制', options: EDUCATION_LEVEL },
    { key: 'department', label: '上課系所', options: DEPARTMENTS },
    { key: 'courseType', label: '課程類別', options: COURSE_TYPE },
    { key: 'grade', label: '適用年級', options: GRADE },
    { key: 'day', label: '星期', options: DAY },
    { key: 'startClass', label: '開始節次', options: CLASS_TIME },
    { key: 'endClass', label: '結束節次', options: CLASS_TIME },
];

export function activeFilters(filters) {
    return FILTER_FIELDS
        .filter(field => filters[field.key] && filters[field.key] !== ANY)
        .map(field => ({ ...field, value: filters[field.key] }));
}
