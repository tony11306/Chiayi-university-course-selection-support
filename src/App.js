import './App.css';
import { useState, useEffect } from "react";
import CurriculumTable from './components/curriculumTable';
import CourseSelectionMenu from './components/courseSelectionMenu';
import Cookies from 'js-cookie';

function App() {

  const [userSelectedCourses, setUserSelectedCourses] = useState(localStorage.getItem('userSelectedCourses') === null ? [] : JSON.parse(localStorage.getItem('userSelectedCourses')))

  useEffect(() => {
    localStorage.setItem('userSelectedCourses', JSON.stringify(userSelectedCourses))
  }, [userSelectedCourses])

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
