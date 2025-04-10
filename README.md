# NovelRead - Website Đọc Truyện Chữ

Dự án NovelRead là một ứng dụng web cho phép người dùng đọc và dịch truyện chữ. Dự án được xây dựng sử dụng MERN Stack (MongoDB, Express, React, Node.js).

## Tính năng chính

- Hệ thống đăng nhập/đăng ký người dùng
- Quản lý truyện và chương
- Phân loại truyện theo thể loại
- Hệ thống dịch truyện (thủ công và tự động)
- Tìm kiếm và lọc truyện
- Bookmark truyện yêu thích
- Theo dõi lịch sử đọc
- Dashboard admin để quản lý nội dung

## Cấu trúc dự án

- `/client`: Frontend sử dụng React
- `/server`: Backend sử dụng Node.js và Express
- `/server/uploads`: Thư mục lưu trữ hình ảnh và tệp tải lên

## Cài đặt

### Yêu cầu

- Node.js v14.0.0 hoặc mới hơn
- MongoDB v4.0.0 hoặc mới hơn
- NPM v6.0.0 hoặc mới hơn

### Backend

```bash
# Đi đến thư mục server
cd server

# Cài đặt các phụ thuộc
npm install

# Tạo file .env và cấu hình
# Xem file .env.example để biết các biến môi trường cần thiết

# Chạy server ở chế độ development
npm run dev

# Chạy server ở chế độ production
npm start
```

### Frontend

```bash
# Đi đến thư mục client
cd client

# Cài đặt các phụ thuộc
npm install

# Chạy ứng dụng ở chế độ development
npm run dev

# Build ứng dụng cho production
npm run build
```

## API Endpoints

### Xác thực

- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin người dùng hiện tại
- `PUT /api/auth/updatepassword` - Cập nhật mật khẩu
- `GET /api/auth/logout` - Đăng xuất

### Người dùng

- `GET /api/users` - Lấy tất cả người dùng (admin)
- `GET /api/users/:id` - Lấy người dùng theo ID (admin)
- `POST /api/users` - Tạo người dùng mới (admin)
- `PUT /api/users/:id` - Cập nhật người dùng (admin)
- `DELETE /api/users/:id` - Xóa người dùng (admin)

### Truyện

- `GET /api/stories` - Lấy tất cả truyện
- `GET /api/stories/:id` - Lấy truyện theo ID
- `POST /api/stories` - Tạo truyện mới
- `PUT /api/stories/:id` - Cập nhật truyện
- `DELETE /api/stories/:id` - Xóa truyện

### Chương

- `GET /api/stories/:storyId/chapters` - Lấy tất cả chương của một truyện
- `GET /api/chapters/:id` - Lấy chương theo ID
- `POST /api/stories/:storyId/chapters` - Tạo chương mới
- `PUT /api/chapters/:id` - Cập nhật chương
- `DELETE /api/chapters/:id` - Xóa chương

### Thể loại

- `GET /api/categories` - Lấy tất cả thể loại
- `GET /api/categories/:id` - Lấy thể loại theo ID
- `GET /api/categories/:id/stories` - Lấy tất cả truyện thuộc một thể loại
- `POST /api/categories` - Tạo thể loại mới (admin)
- `PUT /api/categories/:id` - Cập nhật thể loại (admin)
- `DELETE /api/categories/:id` - Xóa thể loại (admin)

### Bản dịch

- `GET /api/chapters/:chapterId/translations` - Lấy tất cả bản dịch của một chương
- `GET /api/translations/:id` - Lấy bản dịch theo ID
- `POST /api/chapters/:chapterId/translations` - Tạo bản dịch mới
- `PUT /api/translations/:id` - Cập nhật bản dịch
- `DELETE /api/translations/:id` - Xóa bản dịch
- `POST /api/chapters/:chapterId/machine-translate` - Dịch tự động một chương

## Tác giả

- Rokuko with AIAI

## Giấy phép

Dự án này được cấp phép theo giấy phép [ISC](LICENSE). 
