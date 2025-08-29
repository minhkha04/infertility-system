// Lab Test Handler Functions for TreatmentStageDetails Component
import { treatmentService } from "./treatment.service";

export const createLabTestHandlers = (
  setLabTestStep,
  setShowLabTestModal,
  setLoadingLabTests,
  setLabTests,
  showNotification,
  setEditingLabTest,
  setShowAddLabTestModal,
  labTestForm,
  setLabTestTypes,
  setLoadingLabTestTypes
) => {
  // Hàm load danh sách loại xét nghiệm
  const loadLabTestTypes = async () => {
    setLoadingLabTestTypes(true);
    try {
      const response = await treatmentService.getLabTestTypes();
      const types = response?.data?.result || [];
      setLabTestTypes(types);
      console.log("✅ Loaded lab test types:", types);
    } catch (error) {
      console.error("❌ Error loading lab test types:", error);
      setLabTestTypes([]);
      showNotification("Không thể tải danh sách loại xét nghiệm", "warning");
    } finally {
      setLoadingLabTestTypes(false);
    }
  };

  // Hàm mở modal xem lab tests của step
  const handleShowLabTestModal = async (step) => {
    setLabTestStep(step);
    setShowLabTestModal(true);
    setLoadingLabTests(true);
    
    try {
      // Gọi API lấy lab tests của step
      const response = await treatmentService.getLabTestsByStepId(step.id);
      const tests = response?.data?.result || [];
      setLabTests(tests);
    } catch (error) {
      console.error("❌ Error fetching lab tests:", error);
      setLabTests([]);
    } finally {
      setLoadingLabTests(false);
    }
  };

  // Hàm tạo/cập nhật lab test 
  const handleLabTestSubmit = async (values, editingLabTest, labTestStep) => {
    try {
      if (editingLabTest) {
        // Update mode
        const updateData = {
          testName: values.testName,
          notes: values.notes,
          result: values.result,
        };
        
        const response = await treatmentService.updateLabTest(editingLabTest.id, updateData);
        
        if (response?.data?.code === 1000) {
          showNotification("Cập nhật xét nghiệm thành công", "success");
        } else {
          showNotification(response?.data?.message || "Cập nhật xét nghiệm thất bại", "error");
        }
      } else {
        // Create mode
        const labTestData = {
          treatmentStepId: labTestStep.id,
          testName: values.testName,
          notes: values.notes,
        };
        
        const response = await treatmentService.createLabTest(labTestData);
        
        if (response?.data?.code === 1000) {
          showNotification("Tạo xét nghiệm thành công", "success");
        } else {
          showNotification(response?.data?.message || "Tạo xét nghiệm thất bại", "error");
        }
      }
      
      // Reset and reload
      setEditingLabTest(null);
      setShowAddLabTestModal(false);
      labTestForm.resetFields();
      handleShowLabTestModal(labTestStep);
      
    } catch (error) {
      showNotification(error.response?.data?.message || "Thao tác thất bại", "error");
    }
  };

  // Hàm xóa lab test
  const handleDeleteLabTest = async (labTestId, labTestStep) => {
    try {
      const response = await treatmentService.deleteLabTest(labTestId);
      
      if (response?.data?.code === 1000) {
        showNotification("Xóa xét nghiệm thành công", "success");
        handleShowLabTestModal(labTestStep);
      } else {
        showNotification(response?.data?.message || "Xóa xét nghiệm thất bại", "error");
      }
    } catch (error) {
      showNotification(error.response?.data?.message || "Xóa xét nghiệm thất bại", "error");
    }
  };

  // Hàm mở modal thêm/sửa lab test
  const handleShowAddLabTestModal = async (labTest = null) => {
    setEditingLabTest(labTest);
    setShowAddLabTestModal(true);
    
    // Load lab test types khi mở modal
    await loadLabTestTypes();
    
    if (labTest) {
      // Edit mode - set tất cả fields bao gồm result
      labTestForm.setFieldsValue({
        testName: labTest.testName,
        notes: labTest.notes,
        result: labTest.result,
      });
    } else {
      // Add mode - chỉ reset fields, không set result
      labTestForm.resetFields();
    }
  };

  return {
    handleShowLabTestModal,
    handleLabTestSubmit,
    handleDeleteLabTest,
    handleShowAddLabTestModal,
    loadLabTestTypes,
  };
}; 