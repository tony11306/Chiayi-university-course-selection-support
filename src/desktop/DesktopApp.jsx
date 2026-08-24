import './desktop.css';
import Announcement from "./announcement";
import CourseSelectionMenu from "./courseSelectionMenu";
import TimeTable from "./timeTable";
import SelectedCoursesPanel from './selectedCoursesPanel';

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
