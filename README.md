# Điện Thoại Store

Dự án website bán điện thoại gồm 2 phần:

- `web`: giao diện người dùng bằng React + TypeScript + Vite
- `server`: backend API bằng Node.js + Express + TypeScript

Mục tiêu của dự án là xây dựng một nền tảng bán hàng điện thoại, phụ kiện và danh mục sản phẩm với kiến trúc rõ ràng, dễ mở rộng.

## Kiến trúc backend

Backend được tổ chức theo mô hình:

- `Controller` → nhận request, validate cơ bản, gọi service, trả response
- `Service` → xử lý business logic chính
- `Model` → thao tác database

## Cấu trúc `server`

```text
server/
├── src/
│   ├── config/          # Cấu hình ứng dụng và database
│   ├── controllers/     # Nhận request, validate cơ bản, gọi service
│   ├── middlewares/     # Middleware xử lý lỗi, bảo vệ route
│   ├── models/          # Tầng thao tác dữ liệu/database
│   ├── routes/          # Khai báo các endpoint
│   ├── services/        # Xử lý business logic
│   ├── app.ts           # Cấu hình Express app
│   └── server.ts        # Điểm khởi chạy server
├── package.json
└── tsconfig.json
```

## Cấu trúc `web`

```text
web/
├── src/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

## Tính năng chính

### Web
- Trang chủ giới thiệu sản phẩm nổi bật
- Danh sách sản phẩm với lọc, tìm kiếm, sắp xếp
- Chi tiết sản phẩm
- Giỏ hàng, wishlist, checkout
- Khu vực auth và admin

### Server
- API cho auth, users, products, categories
- Tách lớp rõ ràng controller / service / model
- Dễ thay thế mock data bằng database thật

## Chạy dự án

### Web

```bash
cd web
npm install
npm run dev
```

### Server

```bash
cd server
npm install
npm run dev
```

## Build

### Web

```bash
cd web
npm run build
```

### Server

```bash
cd server
npm run build
```

## Ghi chú

- Dự án được chia tách rõ giữa frontend và backend để dễ phát triển và triển khai.
- Backend hiện đang dùng dữ liệu mô phỏng cho một số module, có thể thay bằng database thật sau.
- Cấu trúc hiện tại phù hợp để mở rộng thêm `brands`, `orders`, `cart`, `users` và các module thương mại điện tử khác.
