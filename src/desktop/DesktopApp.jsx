import './desktop.css';
import Announcement from "./announcement";
import CourseSelectionMenu from "./courseSelectionMenu";
import TimeTable from "./timeTable";
import SelectedCoursesPanel from './selectedCoursesPanel';
import Toast from '../shared/toast';
import Footer from '../shared/footer';
import { useGlobalData } from '../hooks/useGlobalData';

export default function DesktopApp() {
    const { toast, dismissToast, addCourse, restoreCourses } = useGlobalData();

    function onToastAction(action) {
        if (action.type === 'undo') {
            addCourse(action.course);
        } else if (action.type === 'undoClear') {
            restoreCourses(action.courses);
        }
    }

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
            <Footer />
            <Toast toast={toast} onDismiss={dismissToast} onAction={onToastAction} />
        </div>
    );
}
