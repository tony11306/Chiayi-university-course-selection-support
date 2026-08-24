import { useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useGlobalData } from "../hooks/useGlobalData";
import { useIsMobile } from "../hooks/useIsMobile";
import { ANY, FILTER_FIELDS, activeFilters } from "../lib/filterOptions";
import FilterFields from "./filterFields";

export default function SearchComponent({ displaySettings, setDisplaySettings }) {
    const { filters, setFilters } = useGlobalData();
    const isMobile = useIsMobile();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const active = activeFilters(filters);

    function onFilterChange(key, value) {
        setFilters(current => ({ ...current, [key]: value }));
    }

    function clearFilter(key) {
        onFilterChange(key, ANY);
    }

    function clearAllFilters() {
        setFilters(current => {
            const cleared = { ...current };
            for (const field of FILTER_FIELDS) cleared[field.key] = ANY;
            return cleared;
        });
    }

    const fields = <FilterFields filters={filters} onFilterChange={onFilterChange} />;

    return (
        <div className="course-search">
            <input
                className="search-bar rounded-pill border-0 shadow-sm"
                value={displaySettings.keyword}
                onChange={event => setDisplaySettings(s => ({ ...s, keyword: event.target.value }))}
                placeholder="課名、系所、老師、學制"
                aria-label="搜尋課程"
            />

            {/* 篩選條件原本收在 details 裡，收起來之後使用者根本不知道自己還套著什麼 */}
            <div className="filter-chips">
                {active.map(field => (
                    <button
                        type="button"
                        key={field.key}
                        className="filter-chip"
                        aria-label={`移除篩選 ${field.label}：${field.value}`}
                        onClick={() => clearFilter(field.key)}
                    >
                        {field.label} {field.value}
                        <span className="filter-chip-remove" aria-hidden="true">×</span>
                    </button>
                ))}

                {isMobile && (
                    <button
                        type="button"
                        className="filter-chip filter-chip-open"
                        onClick={() => setIsSheetOpen(true)}
                    >
                        篩選
                        {active.length > 0 ? <span className="filter-chip-count">{active.length}</span> : null}
                    </button>
                )}

                {active.length > 0 && (
                    <button type="button" className="btn btn-link btn-sm shadow-none filter-clear-all" onClick={clearAllFilters}>
                        清除全部條件
                    </button>
                )}
            </div>

            <div className="form-check form-switch conflict-switch">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="flexSwitchCheckChecked"
                    checked={!displaySettings.isShowedConflictedCourses}
                    onChange={() => setDisplaySettings(s => ({
                        ...s,
                        isShowedConflictedCourses: !s.isShowedConflictedCourses,
                    }))}
                />
                <label className="form-check-label" htmlFor="flexSwitchCheckChecked">隱藏衝堂的課</label>
            </div>

            {isMobile ? (
                <Offcanvas
                    show={isSheetOpen}
                    onHide={() => setIsSheetOpen(false)}
                    placement="bottom"
                    className="filter-sheet"
                >
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title as="h2" className="h6 mb-0">篩選條件</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        {fields}
                        <button
                            type="button"
                            className="btn btn-dark w-100 mt-3 filter-sheet-done"
                            onClick={() => setIsSheetOpen(false)}
                        >
                            看結果
                        </button>
                    </Offcanvas.Body>
                </Offcanvas>
            ) : fields}
        </div>
    );
}
