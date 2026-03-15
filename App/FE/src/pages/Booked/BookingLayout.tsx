import { useState, useEffect } from "react";
import Step1Form from "./sections/Step1Form";
import Step2Menu from "./sections/Step2Menu";
import Step3Table from "./sections/Step3Table";
import Step4Review from "./sections/Step4Review";
import { useNavigate } from "react-router";

export default function BookingLayout() {
  const navigate = useNavigate();

  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("booking_step");
    return savedStep ? parseInt(savedStep) : 1;
  });

  const [bookingData, setBookingData] = useState(() => {
    const savedData = localStorage.getItem("booking_data");
    return savedData
      ? JSON.parse(savedData)
      : {
          booking_time: "",
          number_of_people: 1,
          notes: "",
          items: [],
          table_id: null,
          table_number: "",
        };
  });

  useEffect(() => {
    localStorage.setItem("booking_step", step.toString());
    localStorage.setItem("booking_data", JSON.stringify(bookingData));
  }, [step, bookingData]);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateData = (newData: any) => {
    setBookingData((prev: any) => ({ ...prev, ...newData }));
  };

  const handleFinalFinish = (finalData: any) => {
    localStorage.removeItem("booking_step");
    localStorage.removeItem("booking_data");

    navigate("/payment-customer", {
      state: {
        ...finalData,
        is_booking_via_online: true,
      },
    });
  };

  return (
    <div className="min-h-screen dark:bg-neutral-900 pb-20">
      <div className="sticky top-0 z-50 dark:bg-neutral-900/80 backdrop-blur-md border-b p-4">
        <div className="max-w-md mx-auto flex flex-col gap-3 items-center justify-between">
          <div className="flex gap-2 w-full">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? "bg-red-600" : "bg-zinc-200 dark:bg-neutral-800"}`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-zinc-500 dark:text-red-500">
            Step {step} of 4
          </span>
        </div>
      </div>

      <div className="mt-6 px-4">
        {step === 1 && (
          <Step1Form
            data={bookingData}
            onNext={(val: any) => {
              updateData(val);
              nextStep();
            }}
          />
        )}

        {step === 2 && (
          <Step2Menu
            data={bookingData}
            onNext={(items: any) => {
              updateData({ items });
              nextStep();
            }}
            onSkip={() => nextStep()}
            onBack={prevStep}
          />
        )}

        {step === 3 && (
          <Step3Table
            data={bookingData}
            onBack={prevStep}
            onUpdateData={updateData}
            onNext={nextStep}
          />
        )}

        {step === 4 && (
          <Step4Review
            data={bookingData}
            onBack={prevStep}
            onConfirm={handleFinalFinish}
          />
        )}
      </div>
    </div>
  );
}
