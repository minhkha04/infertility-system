import React, { useContext, useState } from "react";
import CreateTreatmentStage from "./CreateTreatmentStage";
import CreateTreatmentService from "./CreateTreatmentService";
import CreateTreatmentType from "./CreateTreatmentType";
import { Layout, Modal } from "antd";
import ManagerSidebar from "../ManagerSidebar";

import Step1 from "./CreateTreatmentType";
import Step2 from "./CreateTreatmentStage";
import { managerService } from "../../../service/manager.service";
import { NotificationContext } from "../../../App";
import { useNavigate } from "react-router-dom";
import { path } from "../../../common/path";

const RenderCreateTreatment = ({ isOpen, onClose }) => {
  const { showNotification } = useContext(NotificationContext);
  const [step, setStep] = useState(1);
  const [treatmentData, setTreatmentData] = useState({
    name: "",
    description: "",
    treatmentStages: [],
  });
  const [createdTypeId, setCreatedTypeId] = useState(null);
  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const updateTreatmentService = (typeData) => {
    setTreatmentData((prev) => ({ ...prev, ...typeData }));
    nextStep();
  };

  const updateStages = (stages) => {
    setTreatmentData((prev) => ({ ...prev, treatmentStages: stages }));
  };

  const submitTreatmentAndStages = async () => {
    try {
      const res = await managerService.createTreatService(treatmentData);
      showNotification(
        "Tạo liệu trình dịch vụ điều trị thành công!",
        "success"
      );
      onClose();
    } catch (err) {
      console.error("Lỗi tạo loại điều trị:", err);
      showNotification(err.response.data.message, "error");
      console.log(treatmentData);
    }
  };
  return (
    <Modal
      title="Tạo dịch vụ điều trị"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      {step === 1 && (
        <Step1 defaultValues={treatmentData} onNext={updateTreatmentService} />
      )}
      {step === 2 && (
        <Step2
          initialStages={treatmentData.treatmentStages}
          onStagesChange={updateStages}
          onBack={prevStep}
          onSubmit={submitTreatmentAndStages}
        />
      )}
    </Modal>
  );
};

export default RenderCreateTreatment;
