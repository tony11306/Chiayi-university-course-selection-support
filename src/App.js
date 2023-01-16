import './App.css';
import Announcement from "./newcomponents/announcement";
import CourseSelectionMenu from "./newcomponents/courseSelectionMenu";
import TimeTable from "./newcomponents/timeTable";
import SelectedCoursesPanel from './newcomponents/selectedCoursesPanel';
import { GlobalDataProvider } from './hooks/useGlobalData';

export default function App() {
  return (
    <div className="App">
      <Announcement />
      <GlobalDataProvider>
        <div className='row  mt-5'>
          <div className='col mb-2'>
            <TimeTable />
          </div>
          <div className='col'>
            <CourseSelectionMenu />
          </div>
        </div>
        <SelectedCoursesPanel />
      </GlobalDataProvider>
    </div>
  );
}
