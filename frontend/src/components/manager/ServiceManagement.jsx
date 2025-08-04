import React, { useContext, useEffect, useState } from "react";
import { NotificationContext } from "../../App";
import { managerService } from "../../service/manager.service";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "../../index.scss";
import { Button, Image, Modal, Popconfirm } from "antd";
import RenderCreateTreatment from "./managerService/RenderCreateTreatment";

const ServiceManagement = () => {
  // ===== CONTEXT =====
  const { showNotification } = useContext(NotificationContext); // Context hiển thị thông báo

  // ===== STATE MANAGEMENT =====
  // State quản lý services
  const [treatmentService, setTreatmentService] = useState([]); // Danh sách treatment services
  const [searchQuery, setSearchQuery] = useState(""); // Query tìm kiếm
  const [selectedService, setSelectedService] = useState(null); // Service được chọn
  const [editedService, setEditedService] = useState(null); // Service đang chỉnh sửa

  // State quản lý modals
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal edit service
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); // Modal upload image
  const [isCreateServiceModalOpen, setIsCreateServiceModalOpen] =
    useState(false); // Modal tạo service
  const [isTreatmentTypeModalOpen, setIsTreatmentTypeModalOpen] =
    useState(false); // Modal treatment stages

  // State quản lý image upload
  const [selectedFile, setSelectedFile] = useState(null); // File được chọn
  const [preview, setPreview] = useState(null); // Preview image
  const [uploadingImage, setUploadingImage] = useState(false); // Loading state upload

  // State quản lý treatment stages
  const [treatmentStages, setTreatmentStages] = useState([]); // Danh sách treatment stages
  const [selectedServiceId, setSelectedServiceId] = useState(); // Service ID cho stages
  const [editingStageId, setEditingStageId] = useState(null); // Stage đang edit
  const [editName, setEditName] = useState(""); // Tên stage đang edit
  const [editDescription, setEditDescription] = useState(""); // Mô tả stage đang edit

  // State quản lý pagination
  const [currentPage, setCurrentPage] = useState(0); // Trang hiện tại (0-based)
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang

  // ===== API FUNCTION: FETCH TREATMENT SERVICES =====
  // Hàm lấy danh sách treatment services với pagination
  const fetchTreatmentService = async (page = 0) => {
    try {
      const res = await managerService.getTreatmentService(page, 10); // Gọi API với pagination
      setTreatmentService(res.data.result.content); // Set danh sách services
      setTotalPages(res.data.result.totalPages); // Set total pages
      setCurrentPage(page); // Set current page
    } catch (error) {
      showNotification("Lỗi khi tải dịch vụ", "error");
    }
  };

  // ===== API FUNCTION: FETCH TREATMENT STAGES =====
  // Hàm lấy danh sách treatment stages của một service
  const fetchTreatmentStage = async (serviceId) => {
    try {
      const res = await managerService.getTreatmentStages(serviceId); // Gọi API lấy stages
      setTreatmentStages(res.data.result || []); // Set treatment stages
    } catch (error) {
      console.log(error);
      showNotification("Lỗi khi lấy liệu trình", "error");
    }
  };

  // ===== HANDLER: VIEW TREATMENT STAGES =====
  // Hàm xử lý xem treatment stages của một service
  const handleViewTreatmentStage = async (serviceId) => {
    setSelectedServiceId(serviceId); // Set selected service ID
    await fetchTreatmentStage(serviceId); // Load stages
  };

  // ===== USEEFFECT: INITIAL DATA LOAD =====
  // useEffect này chạy khi component mount để load services
  useEffect(() => {
    fetchTreatmentService(); // Load services khi component mount
  }, []);

  // ===== HANDLER: TOGGLE SERVICE STATUS =====
  // Hàm xử lý enable/disable service
  const handleStatusChange = async (id) => {
    try {
      const service = treatmentService.find((service) => service.id === id);

      if (!service.isRemove) {
        await managerService.deleteTreatmentService(id); // Disable service
        showNotification("Dịch vụ đã được tắt", "success");
      } else {
        await managerService.restoreTreatmentService(id); // Enable service
        showNotification("Dịch vụ đã được khôi phục", "success");
      }

      await fetchTreatmentService(); // Refresh services list
    } catch (error) {
      showNotification(error.response.data.message);
    }
  };

  // ===== API FUNCTION: GET SERVICE DETAIL =====
  // Hàm lấy chi tiết service và mở modal edit
  const getTreatmentServiceDetail = async (serviceId) => {
    try {
      const res = await managerService.getTreatmentServiceDetail(serviceId); // Gọi API lấy chi tiết
      setSelectedService(res.data.result); // Set service được chọn
      setEditedService({ ...res.data.result }); // Set service cho edit
      setIsModalOpen(true); // Mở modal edit
    } catch (error) {
      console.log(error);
    }
  };

  // ===== HANDLER: EDIT SERVICE CHANGE =====
  // Hàm xử lý thay đổi input trong form edit service
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" || name === "duration") {
      setEditedService((prev) => ({
        ...prev,
        [name]: value.replace(/\D/g, ""), // Chỉ cho phép số cho price và duration
      }));
    } else {
      setEditedService((prev) => ({
        ...prev,
        [name]: value, // Update field thường
      }));
    }
  };

  // ===== API FUNCTION: UPDATE SERVICE =====
  // Hàm cập nhật service
  const updateTreatmentService = async () => {
    try {
      const res = await managerService.updateTreatmentService(
        editedService.id,
        editedService
      ); // Gọi API update service

      setTreatmentService((prev) =>
        prev.map(
          (service) =>
            service.id === editedService.id ? editedService : service // Update service trong state
        )
      );
      showNotification("Cập nhật dịch vụ thành công", "success");
      setIsModalOpen(false); // Đóng modal
    } catch (error) {
      console.log(error);
      showNotification(error.response.data.message, "error");
    }
  };

  // ===== HANDLER: SEARCH CHANGE =====
  // Hàm xử lý thay đổi search query
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value); // Update search query
  };

  // ===== FILTER FUNCTION =====
  // Hàm filter services theo search query
  const filteredServices = treatmentService.filter(
    (service) => service.name.toLowerCase().includes(searchQuery.toLowerCase()) // Filter theo tên service
  );

  // ===== HANDLER: CLOSE MODAL =====
  // Hàm đóng modal edit và reset state
  const closeModal = () => {
    setIsModalOpen(false); // Đóng modal
    setSelectedService(null); // Clear selected service
    setEditedService(null); // Clear edited service
  };

  // ===== HANDLER: SELECT FILE =====
  // Hàm xử lý chọn file upload image
  const handleSelectFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file); // Set selected file

    // Tạo preview image
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreview(reader.result); // Set preview base64
    };
  };

  // ===== API FUNCTION: UPLOAD IMAGE =====
  // Hàm upload image cho service
  const handleUploadImg = async () => {
    if (!selectedFile || !selectedService?.id) return;
    setUploadingImage(true); // Start loading

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await managerService.uploadImgService(
        selectedService.id,
        formData
      ); // Gọi API upload

      setTreatmentService((prev) => ({
        ...prev,
        ImgUrl: res.data.result.coverImageUrl, // Update image URL
      }));
      window.location.reload(); // Reload page để cập nhật UI
      showNotification("Upload hình thành công", "success");

      // Reset state
      setSelectedFile(null);
      setIsUploadModalOpen(false);
      setPreview(null);
    } catch (err) {
      console.log(err);
      console.log(formData);
      console.log("id", selectedService.id);
      console.log(selectedFile);
    } finally {
      setUploadingImage(false); // End loading
    }
  };

  // ===== HANDLER: OPEN TREATMENT TYPE MODAL =====
  // Hàm mở modal quản lý treatment stages
  const handleOpenTreatmentTypeModal = () => {
    setIsTreatmentTypeModalOpen(true); // Mở modal
    setSelectedTypeId(null); // Reset selected type
    setTreatmentStages([]); // Clear stages
  };

  // ===== API FUNCTION: UPDATE TREATMENT STAGE =====
  // Hàm cập nhật treatment stage
  const updateTreatmentStage = async (stageId, updatedFields) => {
    try {
      await managerService.updateTreatmentStage(stageId, updatedFields); // Gọi API update stage
      showNotification("Cập nhật liệu trình thành công", "success");

      // Reload stages sau khi update
      fetchTreatmentStage(selectedServiceId);
    } catch (error) {
      showNotification(error.response.data.message, "error");
    }
  };

  // ===== RENDER MAIN COMPONENT =====
  return (
    <div className="container mx-auto px-4 py-6">
      {/* ===== HEADER SECTION ===== */}
      {/* Phần header với search và action buttons */}
      <div className="mb-4 flex justify-between items-center">
        {/* Search input */}
        <div className="">
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchQuery}
            onChange={handleSearchChange} // Handler search change
            className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {/* Button xem treatment stages */}
          <button
            onClick={() => {
              setIsTreatmentTypeModalOpen(true); // Mở modal treatment stages
              setSelectedServiceId(null); // Reset selected service
              setTreatmentStages([]); // Clear stages
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-600"
          >
            <EyeOutlined />
            <span> Xem phương pháp điều trị</span>
          </button>

          {/* Button tạo service mới */}
          <button
            onClick={() => setIsCreateServiceModalOpen(true)} // Mở modal tạo service
            className="bg-green-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-green-600"
          >
            <PlusOutlined />
            <span> Tạo dịch vụ điều trị</span>
          </button>
        </div>
      </div>

      {/* ===== SERVICES TABLE SECTION ===== */}
      {/* Bảng hiển thị danh sách treatment services */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto">
          {/* Table header */}
          <thead className="bg-gray-200 text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">Hình ảnh</th>
              <th className="px-6 py-3 text-left">Tên dịch vụ</th>
              <th className="px-6 py-3 text-left">Giá</th>
              <th className="px-6 py-3 text-left">Thời gian điều trị</th>
              <th className="px-6 py-3 text-left">Trạng thái</th>
              <th className="px-6 py-3 text-left">Thao tác</th>
            </tr>
          </thead>

          {/* Table body */}
          <tbody>
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <tr key={service.id} className="border-t hover:bg-gray-50">
                  {/* Service image */}
                  <td className="px-6 py-4">
                    <Image
                      width={60}
                      height={40}
                      src={service.coverImageUrl || "/images/default-blog.jpg"}
                      fallback="/images/default-blog.jpg"
                      style={{ objectFit: "cover", borderRadius: "4px" }}
                    />
                  </td>

                  {/* Service name */}
                  <td className="px-6 py-4">{service.name}</td>

                  {/* Service price */}
                  <td className="px-6 py-4">
                    {service.price.toLocaleString()} VNĐ
                  </td>

                  {/* Treatment duration */}
                  <td className="px-6 py-4">{service.duration} tháng</td>

                  {/* Status toggle */}
                  <td className="px-6 py-4">
                    <label className="relative inline-block w-[110px] h-[36px] select-none">
                      <input
                        type="checkbox"
                        checked={!service.isRemove}
                        onChange={() => handleStatusChange(service.id)} // Toggle service status
                        className="sr-only peer"
                      />

                      {/* Background toggle */}
                      <div
                        className="
      w-full h-full rounded-full
      transition-colors duration-300
      peer-checked:bg-green-500
      bg-red-100
    "
                      ></div>

                      {/* Label text - Căn giữa */}
                      <span
                        className="
      absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
      text-sm font-semibold pointer-events-none
      text-red-600 peer-checked:text-white
    "
                      >
                        {service.isRemove ? "Tắt" : "Hoạt động"}
                      </span>

                      {/* Toggle dot */}
                      <div
                        className="
      absolute top-1/2 w-[26px] h-[26px] bg-white rounded-full shadow
      -translate-y-1/2 transition-all duration-300
      left-[6px] peer-checked:left-[calc(100%-32px)]
    "
                      ></div>
                    </label>
                  </td>

                  {/* Action buttons */}
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {/* View detail button */}
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
                        onClick={() => getTreatmentServiceDetail(service.id)} // Xem chi tiết service
                      >
                        <EyeOutlined />
                        <span> Xem</span>
                      </button>

                      {/* Update image button */}
                      <button
                        className="bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600"
                        onClick={() => {
                          setSelectedService(service); // Set service để upload
                          setIsUploadModalOpen(true); // Mở modal upload
                        }}
                      >
                        Cập nhật hình
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // Empty state
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                  Không có dịch vụ nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Custom pagination controls */}
        <div className="flex justify-end mt-4">
          <Button
            disabled={currentPage === 0} // Disable nếu ở trang đầu
            onClick={() => fetchTreatmentService(currentPage - 1)}
            className="mr-2"
          >
            Trang trước
          </Button>
          <span className="px-4 py-1 bg-gray-100 rounded text-sm">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <Button
            disabled={currentPage + 1 >= totalPages} // Disable nếu ở trang cuối
            onClick={() => fetchTreatmentService(currentPage + 1)}
            className="ml-2"
          >
            Trang tiếp
          </Button>
        </div>
      </div>

      {/* ===== CREATE SERVICE MODAL =====*/}
      {/* Component modal tạo service mới */}
      <RenderCreateTreatment
        isOpen={isCreateServiceModalOpen}
        onClose={() => {
          setIsCreateServiceModalOpen(false); // Đóng modal
          fetchTreatmentService(); // Reload danh sách sau khi tạo
        }}
      />

      {/* ===== TREATMENT STAGES MODAL ===== */}
      {/* Modal hiển thị và quản lý treatment stages */}
      <Modal
        title="Danh sách dịch vụ điều trị"
        open={isTreatmentTypeModalOpen}
        onCancel={() => {
          setIsTreatmentTypeModalOpen(false); // Đóng modal
          setSelectedServiceId(null); // Clear selected service
          setTreatmentStages([]); // Clear stages
        }}
        footer={null} // Custom footer
        width={1000}
        style={{ top: 200 }}
        styles={{ body: { maxHeight: "75vh", overflowY: "auto" } }}
        destroyOnClose
      >
        {treatmentService.length === 0 ? (
          // Empty state
          <p className="text-gray-500 text-center py-4">
            Không có dịch vụ nào.
          </p>
        ) : (
          // Services table với stages
          <table className="min-w-full table-auto border border-gray-200 rounded-md overflow-hidden">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="text-left px-4 py-2 w-1/4">Tên dịch vụ</th>
                <th className="text-left px-4 py-2">Mô tả</th>
                <th className="text-left px-4 py-2 w-40">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white text-gray-800">
              {treatmentService
                .filter((s) => !selectedServiceId || s.id === selectedServiceId) // Filter theo selected service
                .map((service) => (
                  <React.Fragment key={service.id}>
                    {/* Service row */}
                    <tr className="border-t hover:bg-blue-50">
                      <td className="px-4 py-3 font-semibold text-orange-700">
                        {service.name}
                      </td>
                      <td className="px-4 py-3 whitespace-pre-line">
                        {service.description}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewTreatmentStage(service.id)} // Xem stages của service
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Xem liệu trình
                        </button>
                      </td>
                    </tr>

                    {/* Expandable stages section */}
                    {selectedServiceId === service.id &&
                      treatmentStages.length > 0 && (
                        <tr className="bg-blue-50">
                          <td colSpan={3} className="px-4 pb-3 pt-0">
                            <div className="mt-2">
                              <h5 className="font-semibold mb-2 text-gray-700">
                                Các liệu trình:
                              </h5>
                              <ul className="list-disc pl-6 text-sm text-gray-800 space-y-1">
                                {treatmentStages.map((stage) => (
                                  <li key={stage.id}>
                                    {editingStageId === stage.id ? (
                                      // Edit mode
                                      <div className="space-y-1">
                                        <input
                                          type="text"
                                          value={editName}
                                          onChange={
                                            (e) => setEditName(e.target.value) // Update edit name
                                          }
                                          className="border p-1 w-full"
                                        />
                                        <textarea
                                          value={editDescription}
                                          onChange={
                                            (e) =>
                                              setEditDescription(e.target.value) // Update edit description
                                          }
                                          className="border p-1 w-full"
                                        />
                                        <div className="space-x-2 mt-1">
                                          {/* Save button */}
                                          <button
                                            onClick={() =>
                                              updateTreatmentStage(stage.id, {
                                                serviceId: selectedServiceId,
                                                name: editName,
                                                description: editDescription,
                                                expectedDayRange:
                                                  stage.expectedDayRange,
                                                orderIndex: stage.orderIndex,
                                              })
                                            }
                                            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-1 rounded-md shadow-sm"
                                          >
                                            Lưu
                                          </button>
                                          {/* Cancel button */}
                                          <button
                                            onClick={
                                              () => setEditingStageId(null) // Cancel edit
                                            }
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium px-4 py-1 rounded-md shadow-sm"
                                          >
                                            Hủy
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      // View mode
                                      <div>
                                        <span className="font-medium text-blue-700">
                                          {stage.name}
                                        </span>{" "}
                                        – {stage.description}
                                        <button
                                          onClick={() => {
                                            setEditingStageId(stage.id); // Start editing
                                            setEditName(stage.name); // Set edit name
                                            setEditDescription(
                                              stage.description
                                            ); // Set edit description
                                          }}
                                          className="ml-2 text-blue-600 text-sm underline"
                                        >
                                          Chỉnh sửa
                                        </button>
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>

                              {/* Back to services button */}
                              <button
                                onClick={() => {
                                  setSelectedServiceId(null); // Clear selected service
                                  setTreatmentStages([]); // Clear stages
                                }}
                                className="mt-2 text-sm underline text-blue-600"
                              >
                                ← Quay lại danh sách dịch vụ
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        )}
      </Modal>

      {/* ===== UPLOAD IMAGE MODAL ===== */}
      {/* Modal upload image cho service */}
      {isUploadModalOpen && (
        <Modal
          title={`Cập nhật ảnh cho service`}
          open={isUploadModalOpen}
          onCancel={() => {
            setIsUploadModalOpen(false); // Đóng modal
            setSelectedFile(null); // Clear selected file
            setPreview(null); // Clear preview
          }}
          footer={null} // Custom footer
          destroyOnHidden
        >
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Ảnh service</h3>

            {/* Image preview */}
            <img
              src={preview || selectedService?.image || "/default-blog.jpg"}
              alt="Avatar Preview"
              className="w-32 h-32 rounded-full object-cover border mx-auto mb-4"
            />

            {/* File input */}
            <label
              htmlFor="fileInput"
              className="cursor-pointer bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 transition inline-block"
            >
              Chọn ảnh
            </label>
            <input
              type="file"
              id="fileInput"
              onChange={handleSelectFile} // Handle file selection
              className="hidden"
            />

            <p className="text-sm text-gray-600 mt-2">
              {selectedFile ? selectedFile.name : "Chưa chọn ảnh nào"}
            </p>

            {/* Upload button */}
            <Button
              type="primary"
              loading={uploadingImage} // Loading state
              disabled={!selectedFile} // Disable nếu chưa chọn file
              onClick={handleUploadImg} // Upload image
              className="mt-3"
            >
              {uploadingImage ? "Đang upload..." : "Lưu ảnh"}
            </Button>
          </div>
        </Modal>
      )}

      {/* ===== EDIT SERVICE MODAL ===== */}
      {/* Modal chỉnh sửa thông tin service */}
      {isModalOpen && selectedService && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-2/3 md:w-1/2">
            <h2 className="text-xl font-semibold mb-4">Chi tiết dịch vụ</h2>
            <div className="flex gap-8">
              {/* Left Section: Display static info */}
              <div className="flex-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Người tạo
                  </label>
                  <input
                    type="text"
                    value={editedService.createdBy}
                    readOnly // Read-only field
                    className="mt-1 p-2 w-full border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Thời gian điều trị
                  </label>
                  <input
                    name="duration"
                    type="text"
                    value={editedService.duration.toLocaleString() + " Tháng"}
                    onChange={handleEditChange} // Handle duration change
                    className="mt-1 p-2 w-full border rounded-md"
                  />
                </div>
              </div>

              {/* Right Section: Editable fields */}
              <div className="flex-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Tên dịch vụ
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editedService.name}
                    onChange={handleEditChange} // Handle name change
                    className="mt-1 p-2 w-full border rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Giá
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={editedService.price.toLocaleString() + " VNĐ"}
                    onChange={handleEditChange} // Handle price change
                    className="mt-1 p-2 w-full border rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Description field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Mô tả
              </label>
              <textarea
                name="description"
                value={editedService.description}
                onChange={handleEditChange} // Handle description change
                className="mt-1 p-2 w-full border rounded-md"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
                onClick={closeModal} // Close modal
              >
                Đóng
              </button>

              {/* Update button với confirmation */}
              <Popconfirm
                title="Bạn có chắc muốn sửa những gì đã thay đổi không?"
                onConfirm={() => updateTreatmentService()} // Confirm update
                okText="Sửa"
                cancelText="Huỷ"
              >
                <button className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-600">
                  Sửa
                </button>
              </Popconfirm>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== EXPORT COMPONENT =====
export default ServiceManagement;
