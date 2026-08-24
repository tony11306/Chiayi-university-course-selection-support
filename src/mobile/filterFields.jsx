import { FILTER_FIELDS } from "../lib/filterOptions";

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
