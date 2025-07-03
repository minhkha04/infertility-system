# Service APIs Documentation

## 🔧 Tối ưu hóa đã thực hiện:

### 1. ✅ Loại bỏ trùng lặp API:
- Xóa `registerTreatmentService()` khỏi `service.service.js` (giữ lại trong `treatment.service.js`)
- Xóa `confirmAppointmentChange()` khỏi `doctor.service.js` (giữ lại trong `treatment.service.js`)
- Xóa `getTreatmentRecordById()` trùng lặp trong `treatment.service.js`

### 2. ✅ Sửa lỗi URL trùng lặp:
- Sửa tất cả API endpoints từ `api/v1/` thành `v1/` (base URL đã có `/api/`)
- Thêm fallback cho API mới -> API cũ -> Mock data

### 3. ✅ Thêm debug logging và error handling:
- Logging chi tiết cho tất cả API calls
- Validation cho customerId
- Error handling tốt hơn với fallback

### 4. ✅ Xử lý dữ liệu test:
- Cho phép sử dụng test customer ID `customer-uuid-5678`
- Thêm mock data fallback khi API thất bại
- Thông báo cho user biết đang dùng dữ liệu demo

## 📊 Trạng thái hiện tại:

### ✅ Hoạt động:
- API `/v1/users/myInfo` - trả về dữ liệu test
- Validation customerId - hoạt động đúng
- Fallback system - hoạt động đúng
- Mock data - sẵn sàng

### 🔍 Cần kiểm tra:
- API `/v1/treatment-records` - có thể chưa tồn tại
- API `/treatment-records/find-all/customer/{id}` - API cũ
- Dữ liệu thật từ backend

## 🚀 API Endpoints hiện tại:

#### treatment.service.js (Customer APIs):
- `registerTreatmentService()` - POST `v1/treatment-records/register`
- `getTreatmentRecords()` - GET `v1/treatment-records` (fallback: API cũ + mock data)
- `getTreatmentRecordById()` - GET `v1/treatment-records/{id}` (fallback: API cũ + mock data)
- `updateCd1Date()` - PUT `v1/treatment-records/{id}/cd1`
- `cancelTreatmentRecord()` - DELETE `v1/treatment-records/{id}/cancel`

#### service.service.js (Public APIs):
- `getPublicServices()` - GET `v1/public/services`
- `getPublicServiceById()` - GET `v1/public/services/{id}`

#### doctor.service.js (Doctor APIs):
- `getAllDoctors()` - GET `v1/public/doctors`
- `getDoctorById()` - GET `v1/public/doctors/{id}`
- `getAvailableDoctors()` - GET `v1/doctors/available`
- `getDoctorScheduleById()` - GET `v1/doctors/schedules/{id}`

#### auth.service.js (Auth APIs):
- `getMyInfo()` - GET `v1/users/myInfo` (async/await fixed)
- `signIn()` - POST `v1/auth/login`
- `signUp()` - POST `v1/auth/sign-up`

## 🐛 Debug Guide:

1. **Mở Developer Tools → Console**
2. **Xem logs có prefix:**
   - `🔍` - API calls và responses
   - `⚠️` - Warnings và fallbacks
   - `❌` - Errors
3. **Kiểm tra Network tab** để xem HTTP requests
4. **Mock data sẽ hiển thị** nếu cả 2 API đều thất bại

## 📝 Ghi chú:
- Hệ thống hiện tại sử dụng dữ liệu test `customer-uuid-5678`
- Mock data được tạo để test UI khi API chưa sẵn sàng
- Fallback system đảm bảo UI luôn hoạt động

Thư mục service đóng vai trò các setup axios trong dự án các file thực hiện nhiệm vụ chứa các xử lí API trong dự án