import { FILTER_FIELDS } from "../lib/filterOptions";

/**
 * 原生 select。原本是八個自製 Bootstrap dropdown，其中系所有 130 多項、
 * 選單限高 50vh 又沒有搜尋，手機上要滑很久；原生 select 會叫出系統選擇器，
 * 有首字跳轉、單手可用，也免費得到無障礙支援。
 */
export default function FilterFields({ filters, onFilterChange }) {
    return (
        <div className="filter-fields">
            {FILTER_FIELDS.map(field => (
                <div className="filter-field" key={field.key}>
                    <label htmlFor={`filter-${field.key}`}>{field.label}</label>
                    <select
                        id={`filter-${field.key}`}
                        value={filters[field.key]}
                        onChange={event => onFilterChange(field.key, event.target.value)}
                    >
                        {field.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            ))}
        </div>
    );
}
