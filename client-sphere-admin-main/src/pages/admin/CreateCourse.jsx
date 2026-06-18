import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepHeader from "../../components/coursecomponents/StepHeader";
import CourseDrawer from "../../components/coursecomponents/CourseDrawer";

export default function CreateCourse() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-80 min-h-screen">
      <StepHeader step={step} />

      <CourseDrawer
        key="new-course"
        step={step}
        setStep={setStep}
        onClose={() => navigate("/courses")}
        initialData={{}}
      />
    </div>
  );
}
