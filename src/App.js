import './App.css';
import { useState, useEffect } from "react";
import CurriculumTable from './components/curriculumTable';
import CourseSelectionMenu from './components/courseSelectionMenu';

function App() {

  const [userSelectedCourses, setUserSelectedCourses] = useState([])

  return (
    <div className="App">
      <div className='row  mt-5'>
        <div className='col'>
          <CurriculumTable courses={userSelectedCourses}/>
        </div>
        <div className='col'>
          <CourseSelectionMenu setCourseSelected={setUserSelectedCourses} userSelectedCourses={userSelectedCourses} />
        </div>
      </div>
    </div>
  );
}

export default App;
