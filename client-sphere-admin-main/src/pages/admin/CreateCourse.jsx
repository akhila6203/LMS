import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StepHeader from "../../components/coursecomponents/StepHeader";
import CourseDrawer from "../../components/coursecomponents/CourseDrawer";
// import CourseTable from "../../components/coursecomponents/CourseTable";
import { getCourses } from "../../utils/storage";

export default function CreateCourse() {
  const [step, setStep] = useState(1);
  const [showDrawer, setShowDrawer] = useState(true);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    setCourses(getCourses());
  }, []);

  return (
    <div className="p-6 bg-gray-80 min-h-screen">

      {/* STEPPER */}
      <StepHeader step={step} />

      {/* DRAWER */}
      {showDrawer && (
        <>
          <CourseDrawer
            step={step}
            setStep={setStep}
            onClose={() => {
              setShowDrawer(false);
              navigate("/courses");
            }}
            initialData={formData} 
          />
        </>
      )}
    </div>
  );
}

