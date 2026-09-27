# Dữ liệu du lịch từ tài liệu Word

Danh mục thay thế toàn bộ dữ liệu du lịch cũ bằng 8 tài liệu người dùng cung cấp: 18 tỉnh/thành, 107 địa điểm, 16 tuyến và 42 ngày lịch trình.

- `tourism-sources.json`: toàn bộ đoạn văn trích từ 8 tài liệu, giữ thứ tự nguồn.
- `tourism.json`: tỉnh/thành, địa điểm, tuyến, hoạt động, giá và điều kiện, ăn uống, lưu trú, ảnh và nguồn.
- `tourism-media.json`: danh mục 36 ảnh được trích trực tiếp từ các tài liệu.
- `../js/tourism-data.js`: dữ liệu dùng trực tiếp trên website, kể cả khi mở tệp HTML trên máy.

Các chỉ số `sourceParagraph`, `sourceStart`, `sourceEnd` dùng vị trí đoạn văn bắt đầu từ 0; `sourceEnd` không bao gồm đoạn tại vị trí đó. Nội dung tài liệu được dùng làm dữ liệu, không phải chỉ dẫn thực thi.

Tên tỉnh/thành giữ theo tài liệu, không tự chuyển đổi địa giới. Tuyến TP.HCM bỏ đoạn Cần Giờ bị lặp trước ngày 4 và sắp lại ngày 1 theo giờ. Mốc `0:45 – 12:00` ở tuyến Hà Tiên được giữ và ghi rõ cần xác nhận. Xẻo Quít chỉ xuất hiện trong dịch vụ của tuyến miền Tây nên không tự thêm giờ tham quan.

Giá chưa có trong nguồn được biểu diễn là `null`. `cost: 0` trong hoạt động chỉ là giá trị tương thích nội bộ, đi kèm `costKnown: false`, không phải miễn phí. Giá đoàn được áp dụng đúng số khách tối thiểu. Giá có khoảng dùng mức tối đa để đối chiếu ngân sách; giá “từ” ghi rõ là mức tối thiểu. Không tự chia giá tour thành tiền khách sạn, ăn uống hoặc vé.

Khi tải bộ dữ liệu mới lần đầu, ứng dụng xóa các khóa lưu lịch trình, bản nháp và hội thoại cũ của TripMate ở trình duyệt đó. Không xóa dữ liệu của ứng dụng khác. Lịch trình mới vẫn được giữ sau khi tải lại trang.

Để nhập lại, chạy `scripts/import-tourism.ps1`, `scripts/import-tourism-media.ps1`, rồi `node scripts/build-tourism.cjs`. Hai bước đầu cần 8 tệp Word ở đường dẫn gốc. Bộ tạo dữ liệu tự gọi `scripts/enrich-tourism.cjs` để bổ sung ảnh và nhóm hoạt động ăn uống, lưu trú.

Kiểm tra với `node scripts/verify-tourism.cjs`. Thêm `--browser` để kiểm tra giao diện, chọn tuyến, lưu/mở lại và giá đoàn; bước này dùng Playwright trong bộ công cụ của máy hiện tại. Ảnh chụp kiểm tra được ghi vào `artifacts/` và không đưa vào Git.
