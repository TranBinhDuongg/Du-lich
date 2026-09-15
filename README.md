# Tripmate AI

Website du lịch Việt Nam dùng HTML, CSS và JavaScript.

## Chạy dự án

- `npm run dev`: mở http://127.0.0.1:4173/
- `npm run build`: tạo bản tĩnh trong `dist/`.
- `npm test`: kiểm tra tạo lịch trình và dữ liệu giữa các trang.

## Cấu trúc

- `index.html`: khám phá toàn màn hình và menu địa điểm.
- `plan.html`, `chat.html`, `saved.html`: ba trang chức năng.
- `workspace.html`: chuyển tiếp đường dẫn cũ.
- `assets/css/`: các stylesheet đang sử dụng.
- `assets/js/`: hiệu ứng, menu, chatbot và xử lý lịch trình.
- `assets/images/`: sáu ảnh địa điểm Việt Nam đang sử dụng.
- `assets/fonts/`: phông chữ cục bộ.
- `data/`: danh mục địa điểm và danh sách ảnh nguồn DLDT.
- `docs/destinations.md`: thông tin địa điểm đã tổng hợp.
- `tests/`: kiểm thử chức năng.
- `build.js`, `server.js`: dựng trang và máy chủ xem trước.

## Dữ liệu và giới hạn

Lịch trình đã lưu dùng localStorage; bản nháp chuyển trang dùng sessionStorage. Không đổi khóa lưu trữ khi tổ chức lại tệp.
Chatbot là bản demo theo kịch bản; giá trong lịch trình là dự toán minh họa.
Ảnh Việt Nam lấy từ bộ tư liệu người dùng cung cấp và ảnh Hạ Long có sẵn.
Hiệu ứng khám phá và một phần CSS được phát triển từ tài nguyên tham khảo Travelshift. Không còn phụ thuộc proxy website Travelshift để chạy.

Các bản thiết kế cũ, ảnh nước ngoài không dùng, log và script sửa một lần đã được dọn. Thư mục tư liệu gốc trong Downloads không bị thay đổi.

Bộ tạo lịch trình hiện có 10 điểm đến và 120 hoạt động mẫu, gồm sáu điểm bổ sung: Hội An, Hà Giang – Đồng Văn, Cao Bằng, Huế, Lý Sơn và Cần Thơ. Chi phí là dữ liệu mô phỏng, không phải báo giá hay giá vé xác minh. Lịch trình được xếp theo sở thích; chưa tối ưu tuyến đường và giờ mở cửa, có thể lặp hoạt động khi chọn nhiều ngày.

## Phân chia HTML, CSS và JavaScript

- HTML ở thư mục gốc: cấu trúc và nội dung từng trang.
- assets/css/: giao diện; page-transition.css dành riêng cho hoạt ảnh chuyển trang.
- assets/js/: xử lý tương tác; workspace-redirect.js chuyển tiếp đường dẫn cũ.
- workspace.css và workspace.js dùng chung cho tạo lịch trình, chatbot và đã lưu để tránh lặp mã.
- route.css và route.js dành cho trang mở hành trình (route.html).
- Các giá trị động như độ dài thanh ngân sách và màu cảnh được JavaScript cập nhật khi dữ liệu thay đổi.

