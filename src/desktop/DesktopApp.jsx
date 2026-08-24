import './desktop.css';
import Announcement from "./announcement";
import CourseSelectionMenu from "./courseSelectionMenu";
import TimeTable from "./timeTable";
import SelectedCoursesPanel from './selectedCoursesPanel';

/**
 * 桌機版沿用改版前的版面與樣式，一字不動 —— 手機版是另一支獨立的畫面
 * （src/mobile），兩邊只共用 store 與 src/lib 的節次／衝堂邏輯。
 *
 * 樣式都掛在 .view-desktop 底下，所以改手機的 CSS 不可能漏過來。
 */
export default function DesktopApp() {
    return (
        <div className="view-desktop">
            <Announcement />
            <div className="row mt-5">
                <div className="col mb-2">
                    <TimeTable />
                </div>
                <div className="col">
                    <CourseSelectionMenu />
                </div>
            </div>
            <SelectedCoursesPanel />
        </div>
    );
}
