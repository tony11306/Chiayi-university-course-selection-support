import './App.css';
import Announcement from "./components/announcement";
import CourseSelectionMenu from "./components/courseSelectionMenu";
import TimeTable from "./components/timeTable";
import SelectedCoursesPanel from './components/selectedCoursesPanel';
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
