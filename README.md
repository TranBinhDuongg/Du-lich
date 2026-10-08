# Tripmate AI với Gemini

Tạo lịch trình, trò chuyện và chỉnh chuyến đi dùng chung **một API key Gemini**. Key chỉ được đọc bởi máy chủ, không gửi xuống trình duyệt.

Toàn bộ máy chủ và API Gemini nằm trong `server.js`: phục vụ website, gọi Gemini, kiểm tra phản hồi và xử lý lỗi. Phần gửi yêu cầu của giao diện nằm trong `assets/js/workspace.js`, không còn file `gemini-client.js` riêng. `.env` chỉ chứa cấu hình và API key; `server.test.js` là file kiểm tra.

## Chạy trên Windows hoặc máy khác

1. Cài Node.js phiên bản 22 trở lên.
2. Chép toàn bộ dự án. Tạo file `.env` từ `.env.example`.
3. Điền API key vào `GEMINI_API_KEY`. Có thể đổi `GEMINI_MODEL` thành model tài khoản của bạn được phép sử dụng.
4. Nhấp đúp `start-tripmate.cmd` trên Windows, hoặc mở terminal trong thư mục dự án và chạy `npm start`.
5. Mở **http://localhost:3000**. Không mở trực tiếp file HTML hoặc dùng Live Server để gọi Gemini.

Không cần cài thư viện thêm. Máy chạy cần có Internet. `.env` không được đưa lên Git; người nhận `.env` có thể sử dụng hạn mức của key đó. Dự án mặc định chỉ lắng nghe trên máy cục bộ.

Máy chủ tự khởi động lại khi bạn lưu thay đổi trong `.env` hoặc `server.js`. Nếu thấy lỗi xác thực, sao chép key chính xác bằng nút Copy key trong Google AI Studio, thay giá trị `GEMINI_API_KEY` và lưu file. Nếu key mới vẫn bị từ chối, kiểm tra quyền truy cập Gemini của key trong Google AI Studio.

## Đưa ứng dụng lên web

`https://www.perusi.io.vn` hiện được phục vụ bởi Vercel. `api/gemini.mjs` cung cấp endpoint `/api/gemini` trên Vercel và dùng chung logic với máy chủ local. Sau khi Vercel triển khai commit mới từ GitHub:

1. Mở Vercel Dashboard, chọn project gắn với `www.perusi.io.vn`, vào **Settings > Environment Variables**.
2. Thêm `GEMINI_API_KEY` với giá trị key của bạn cho môi trường **Production**. Không lưu key trong GitHub.
3. Chọn **Redeploy** để Vercel nhận biến mới. Mở lại `https://www.perusi.io.vn/api/gemini`; GET sẽ trả `405` (endpoint chỉ nhận POST), không còn `404`.

Nếu project Vercel chưa kết nối repo này, hãy import `TranBinhDuongg/Du-lich` vào đúng project đang gắn domain rồi triển khai lại.

Ứng dụng cần máy chủ Node.js để gọi Gemini an toàn; GitHub Pages chỉ phục vụ tệp tĩnh nên không chạy được API này. Repo đã có `render.yaml` để triển khai thành web service trên Render:

1. Đẩy mã nguồn lên GitHub.
2. Trên Render, chọn **New > Blueprint**, kết nối repo `TranBinhDuongg/Du-lich` và tạo Blueprint từ `render.yaml` ở thư mục gốc.
3. Nhập `GEMINI_API_KEY` khi Render yêu cầu, rồi tạo dịch vụ. Render sẽ tự build và triển khai ứng dụng.
4. Mở URL `onrender.com` của dịch vụ. Mỗi lần đẩy commit mới lên GitHub, Render tự triển khai lại.

Không đưa Gemini API key vào mã nguồn hoặc commit `.env`; hãy lưu key trong biến môi trường của dịch vụ Render. `GEMINI_MODEL` có thể đổi trong cùng phần cấu hình nếu tài khoản dùng model khác.

## Ba chức năng

- **Tạo lịch trình**: chọn tuyến tham khảo hoặc chọn điểm đến, số ngày, sở thích, ngân sách và yêu cầu thêm. Nhấn “Tạo lịch trình với Gemini”. Bản mẫu hiện trước khi tạo chỉ là tham khảo từ danh mục.
- Lịch trình AI mới bao gồm khởi hành và quay về, phương tiện/thời gian đi lại, ăn sáng/trưa/tối, tham quan, nghỉ ngơi và chỗ ngủ từng đêm. Nhập nơi khởi hành, ngày đi, phương tiện và loại lưu trú để cá nhân hóa. Mỗi hoạt động hiển thị địa điểm, hướng dẫn và dự toán riêng. Các quán và khách sạn là gợi ý cần xác nhận; nếu chưa có tên cơ sở đáng tin cậy, AI nêu khu vực và tiêu chí lựa chọn.
- **Chatbot**: hỏi tự do về du lịch, hoặc chọn chuyến đi để hỏi/chỉnh từng ngày. Chỉnh bằng AI tạo bản nháp; nhấn “Lưu hành trình” để cập nhật chuyến đi đã lưu. Đổi số ngày và ngân sách tại trang tạo lịch trình.
- **Lịch trình của tôi**: xem chi tiết, mở cuộc trò chuyện để chỉnh bằng AI, lưu và xóa. Giá AI là dự toán, cần xác nhận với đơn vị dịch vụ.

Lịch trình lưu trong trình duyệt, không tự đi theo thư mục dự án. Trước khi chuyển máy, nhấn **Xuất lịch trình** ở trang lịch trình đã lưu; trên máy mới nhấn **Nhập lịch trình** và chọn file JSON. Chuyến đi trùng ID được giữ nguyên, không ghi đè; tối đa 50 chuyến đi. Hội thoại và bản nháp thuộc phiên trình duyệt, không được xuất.

## Kiểm tra

Chạy `npm test` để kiểm tra máy chủ, xử lý phản hồi Gemini và dự toán. Các bài kiểm tra dùng phản hồi giả lập, không tiêu tốn hạn mức. Gọi Gemini thực tế phụ thuộc API key, hạn mức và quyền truy cập model.

Tham khảo API chính thức: https://ai.google.dev/api/generate-content
