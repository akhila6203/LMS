import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Step1 from "./Step1BasicInfo";
import Step2 from "./Step2Videos";
import Step3 from "./Step3Materials";
import Step4 from "./Step4Quiz";
import Step5 from "./Step5Preview";
import Step6 from "./Step6";
import { courseService } from "@/services/courseService";
import { buildCoursePayload } from "@/utils/buildCoursePayload";

export default function CourseDrawer({
  step,
  setStep,
  onClose,
  initialData = {},
}) {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(initialData || {});
  const [saving, setSaving] = useState(false);
  const DRAFT_KEY = "course_draft";

  useEffect(() => {
    const savedDraft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (savedDraft && Object.keys(savedDraft).length > 0) {
      setCourseData(savedDraft);
    } else {
      setCourseData(initialData || {});
    }
  }, [initialData]);

  const handleNext = async (stepData) => {
    const mergedVideos =
      stepData.videos !== undefined ? stepData.videos : courseData.videos || [];
    const mergedMaterials =
      stepData.materials !== undefined
        ? stepData.materials
        : courseData.materials || [];
    const mergedQuizzes =
      stepData.quizzes !== undefined
        ? stepData.quizzes
        : courseData.quizzes || [];

    const updated = {
      ...courseData,
      ...stepData,
      thumbnail:
        stepData.thumbnail !== undefined
          ? stepData.thumbnail
          : courseData.thumbnail,
      videos: mergedVideos,
      materials: mergedMaterials,
      quizzes: mergedQuizzes,
    };

    setCourseData(updated);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));

    if (step === 6) {
      setSaving(true);
      try {
        const payload = buildCoursePayload({
          ...updated,
          status: stepData.status || updated.status || "Draft",
        });

        await courseService.create(payload);

        localStorage.removeItem(DRAFT_KEY);
        alert("Course saved to database successfully!");
        navigate("/courses");
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Failed to save course. Check MySQL is running and tables exist."
        );
      } finally {
        setSaving(false);
      }
      return;
    }

    setStep((prev) => prev + 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            onNext={handleNext}
            data={courseData}
            setStep={setStep}
          />
        );
      case 2:
        return (
          <Step2 onNext={handleNext} data={courseData} setStep={setStep} />
        );
      case 3:
        return (
          <Step3 onNext={handleNext} data={courseData} setStep={setStep} />
        );
      case 4:
        return (
          <Step4 onNext={handleNext} data={courseData} setStep={setStep} />
        );
      case 5:
        return (
          <Step5 data={courseData} onNext={handleNext} setStep={setStep} />
        );
      case 6:
        return (
          <Step6
            onNext={handleNext}
            data={courseData}
            setStep={setStep}
            saving={saving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      <div className="p-6 flex-1 overflow-y-auto">{renderStep()}</div>
    </div>
  );
}
