import React, { useContext, useEffect, useState } from "react";
import InputCustom from "../../Input/InputCustom";
import { managerService } from "../../../service/manager.service";
import { useFormik } from "formik";
import { NotificationContext } from "../../../App";
import { Link, useNavigate } from "react-router-dom";
import { path } from "../../../common/path";
import * as yup from "yup";

const CreateTreatmentType = ({ defaultValues, onNext }) => {
  const { showNotification } = useContext(NotificationContext);
  const [treatmentType, setTreatmentType] = useState([]);
  const [isReuse, setIsReuse] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const {
    handleSubmit,
    handleChange,
    values,
    errors,
    touched,
    handleBlur,
    setValues,
  } = useFormik({
    initialValues: defaultValues,
    onSubmit: (values) => {
      onNext(values);
    },
    validationSchema: yup.object({
      name: yup
        .string()
        .trim("Vui lòng không để trống hoặc khoảng trắng")
        .required("Vui lòng không để trống hoặc khoảng trắng"),
      description: yup
        .string()
        .trim("Vui lòng không để trống hoặc khoảng trắng")
        .required("Vui lòng không để trống hoặc khoảng trắng"),
      price: yup
        .string()
        .trim("Vui lòng không để trống hoặc khoảng trắng")
        .required("Vui lòng không để trống hoặc khoảng trắng"),

      duration: yup
        .string()
        .trim("Vui lòng không để trống hoặc khoảng trắng")
        .required("Vui lòng không để trống hoặc khoảng trắng"),
    }),
  });

  useEffect(() => {
    if (selectedId) {
      const selected = treatmentType.find((item) => item.id === selectedId);
      if (selected) {
        setValues({
          name: selected.name,
          description: selected.description,
          price: selected.price,
          duration: selected.duration,
        });
      }
    }
  }, [selectedId]);

  return (
    <div className="">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded px-10 py-8 mt-10">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Tạo dịch vụ điều trị
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <InputCustom
            name={"name"}
            onChange={handleChange}
            value={values.name}
            placeholder={"Hãy nhập tên phương pháp điều trị"}
            labelContent={"Tên phương pháp"}
            error={errors.name}
            touched={touched.name}
            onBlur={handleBlur}
          />
          <InputCustom
            name={"description"}
            onChange={handleChange}
            value={values.description}
            placeholder={"Hãy viết miêu tả"}
            labelContent={"Miêu tả"}
            error={errors.description}
            touched={touched.description}
            onBlur={handleBlur}
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

          <div>
            <button
              type="submit"
              className="inline-block w-full bg-blue-500 text-white py-2 px-5 rounded-md"
            >
              Tiếp tục
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTreatmentType;
