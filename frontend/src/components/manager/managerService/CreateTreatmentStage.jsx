import React, { useContext, useEffect, useState } from "react";
import InputCustom from "../../Input/InputCustom";
import { managerService } from "../../../service/manager.service";
import { NotificationContext } from "../../../App";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { path } from "../../../common/path";

const CreateTreatmentStage = ({
  initialStages,
  onStagesChange,
  onBack,
  onSubmit,
}) => {
  const [treatmentStagesList, setTreatmentStagesList] = useState(
    initialStages || []
  );
  const [currentOrderIndex, setCurrentOrderIndex] = useState(
    initialStages?.length + 1 || 0
  );

  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    if (!initialStages || initialStages.length === 0) {
      const defaultStage = {
        name: "Khám tổng quát",
        description: "Tiến hành kiểm tra sức khoẻ tổng quát trước điều trị.",
        expectedDayRange: "1-2 ngày",
        orderIndex: 0,
      };

      const initial = [defaultStage];
      setTreatmentStagesList(initial);
      setCurrentOrderIndex(1); // set bước tiếp theo
      onStagesChange(initial); // cập nhật wrapper nếu cần
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      expectedDayRange: "",
      orderIndex: currentOrderIndex,
    },
    onSubmit: (values) => {
      if (!values.name || !values.description || !values.orderIndex) {
        showNotification("Vui lòng điền đầy đủ thông tin stage", "error");
        return;
      }

      const stage = {
        name: values.name,
        description: values.description,
        expectedDayRange: values.expectedDayRange,
        orderIndex: Number(values.orderIndex),
      };

      const updated = [...treatmentStagesList, stage];
      setTreatmentStagesList(updated);
      onStagesChange(updated); // 👈 truyền lại wrapper
      setCurrentOrderIndex((prev) => prev + 1);

      // Reset form
      formik.resetForm({
        values: {
          name: "",
          description: "",
          expectedDayRange: "",
          orderIndex: currentOrderIndex + 1,
        },
      });
    },
  });
  const handleRemoveStage = (idx) => {
    const updated = treatmentStagesList.filter((_, i) => i !== idx);
    setTreatmentStagesList(updated);
    onStagesChange(updated); // 👈 cập nhật wrapper khi xóa
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded px-10 py-8 mt-10">
      <h2 className="text-2xl font-bold mb-8 text-center">
        Tạo liệu trình điều trị
      </h2>
      <form onSubmit={formik.handleSubmit}>
        <InputCustom
          labelContent="Tên tiến trình điều trị"
          placeholder="Nhập tên tiến trình"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.name}
          touched={formik.touched.name}
        />

        <InputCustom
          labelContent="Miêu tả tiến trình điều trị"
          placeholder="Nhập miêu tả tiến trình"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.description}
          touched={formik.touched.description}
        />
        <InputCustom
          labelContent="Thời gian dự kiến"
          placeholder="Nhập thời gian dự kiến"
          name="expectedDayRange"
          value={formik.values.expectedDayRange}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.expectedDayRange}
          touched={formik.touched.expectedDayRange}
        />

        <InputCustom
          labelContent="Bước điều trị"
          name="orderIndex"
          placeholder="Nhập bước hiện tại"
          typeInput="number"
          value={formik.values.orderIndex}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.orderIndex}
          touched={formik.touched.orderIndex}
        />

        <div className="flex gap-4 justify-end mt-6">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            + Thêm Stage
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Gửi tất cả
          </button>
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Quay lại
          </button>
        </div>
      </form>
      {treatmentStagesList.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Danh sách stage đã thêm:
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Tên tiến trình</th>
                  <th className="border px-4 py-2 text-left">Bước</th>
                  <th className="border px-4 py-2 text-left">Miêu tả</th>
                  <th className="border px-4 py-2 text-left">
                    Thời gian dự kiến
                  </th>
                  <th className="border px-4 py-2 text-left w-20">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {treatmentStagesList.map((stage, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{stage.name}</td>
                    <td className="border px-4 py-2">{stage.orderIndex}</td>
                    <td className="border px-4 py-2">{stage.description}</td>
                    <td className="border px-4 py-2">
                      {stage.expectedDayRange}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(idx)}
                        className="text-red-600 hover:text-red-800"
                        title="Xoá stage này"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTreatmentStage;
