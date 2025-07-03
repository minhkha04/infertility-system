import React, { useContext, useEffect, useState } from "react";
import { NotificationContext } from "../../../App";
import { managerService } from "../../../service/manager.service";
import { path } from "../../../common/path";
import { useFormik } from "formik";
import { Link, Navigate, useNavigate } from "react-router-dom";
import InputCustom from "../../Input/InputCustom";

const CreateTreatmentService = () => {
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [treatmentType, setTreatmentType] = useState([]);

  useEffect(() => {
    const fetchTreatmentType = async (page = 0) => {
      try {
        const res = await managerService.getAllTreatmentType();
        setTreatmentType(res.data.result.content || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTreatmentType();
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      treatmentTypeId: "",
      name: "",
      description: "",
      price: "",
      duration: "",
    },
    onSubmit: async (values) => {
      try {
        const res = await managerService.createService(values);
        showNotification("Tạo dịch vụ thành công", "success");
      } catch (error) {
        managerService.createTreatService(values).then((res) => {
          console.log(res);
          showNotification("Tạo dịch vụ thành công", "success");
          setTimeout(() => {
            navigate(path.managerServices);
            window.location.reload();
          }, 1000);
        });
      }
    },
  });

  const { handleSubmit, handleChange, handleBlur, values, errors, touched } =
    formik;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded px-10 py-8 mt-10">
      <h2 className="text-2xl font-bold mb-8 text-center">Tạo dịch vụ</h2>

      <form onSubmit={handleSubmit}>
        {/* Ẩn select, hoặc chỉ hiển thị tên loại điều trị nếu muốn confirm */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Loại điều trị
          </label>
          <select
            name="treatmentTypeId"
            value={values.treatmentTypeId}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Chọn loại điều trị --</option>
            {treatmentType.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {touched.treatmentTypeId && errors.treatmentTypeId && (
            <div className="text-red-500 text-sm mt-1">
              {errors.treatmentTypeId}
            </div>
          )}
        </div>

        <InputCustom
          labelContent="Tên dịch vụ điều trị"
          placeholder="Nhập tên dịch vụ"
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.name}
          touched={touched.name}
        />

        <InputCustom
          labelContent="Miêu tả dịch vụ điều trị"
          placeholder="Nhập miêu tả dịch vụ"
          name="description"
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.description}
          touched={touched.description}
        />

        <InputCustom
          labelContent="Giá tiền"
          name="price"
          placeholder="Nhập giá tiền"
          typeInput="number"
          value={values.price}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.price}
          touched={touched.price}
        />

        <InputCustom
          labelContent="Thời gian điều trị của dịch vụ"
          name="duration"
          placeholder="Nhập thời gian (tháng)"
          typeInput="number"
          value={values.duration}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.duration}
          touched={touched.duration}
        />
        <button>
          <Link
            to={path.managerServices}
            className="text-blue-500 hover:underline duration-300"
          >
            Trở lại trang dịch vụ
          </Link>
        </button>
        <div className="flex gap-4 justify-end mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Xác nhận
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTreatmentService;
