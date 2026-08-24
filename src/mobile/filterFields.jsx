import { ANY, FILTER_FIELDS } from "../lib/filterOptions";

const CHIP_FIELDS = new Set(['campus', 'educationLevel', 'grade', 'day', 'startClass', 'endClass']);

export default function FilterFields({ filters, onFilterChange }) {
    return (
        <div className="filter-fields">
            {FILTER_FIELDS.map(field => (
                <div
                    className="filter-field"
                    key={field.key}
                    data-active={filters[field.key] !== ANY || undefined}
                >
                    {CHIP_FIELDS.has(field.key) ? (
                        <>
                            <span className="filter-field-label" id={`filter-${field.key}-label`}>
                                {field.label}
                            </span>
                            <div className="chip-group" role="group" aria-labelledby={`filter-${field.key}-label`}>
                                {field.options.map(option => (
                                    <button
                                        type="button"
                                        key={option}
                                        className="chip"
                                        aria-pressed={filters[field.key] === option}
                                        onClick={() => onFilterChange(field.key, option)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
