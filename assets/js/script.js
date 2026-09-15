const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const messages = document.getElementById("chat-messages");
const suggestions = document.getElementById("suggestions");
const sendButton = form.querySelector("button");
const initialMessage = messages.innerHTML;
let pendingReply;
let destination = "";
const normalize = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

function getReply(question) {
  if (window.TripMatePlanner) {
    const reply = window.TripMatePlanner.handle(question);
    if (reply !== null) return reply;
  }
  const q = normalize(question);
  if (/da nang|hoi an/.test(q)) destination = "danang";
  if (/visa|thi thuc|ho chieu/.test(q))
    return "Giấy tờ nhập cảnh phụ thuộc vào quốc tịch, điểm đến và thời gian lưu trú. Bản demo này không kiểm tra được quy định hiện hành. Bạn hãy tra cứu trên website chính thức của đại sứ quán hoặc lãnh sự quán trước khi đặt vé nhé.";
  if (/thoi tiet|nhiet do|hom nay|ngay mai/.test(q))
    return "Mình chưa kết nối dữ liệu thời tiết trực tiếp. Bạn nên kiểm tra dự báo cho đúng điểm đến và ngày khởi hành. Có thể mang thêm áo khoác nhẹ, ô gấp và giày thoải mái để dễ thay đổi kế hoạch.";
  if (/dat ve|dat phong|booking/.test(q))
    return "TripMate hiện chỉ gợi ý ý tưởng và chưa hỗ trợ đặt vé hay phòng. Khi chọn dịch vụ, hãy kiểm tra vị trí, tổng giá, điều kiện hủy và đánh giá gần đây trên nơi đặt chính thức.";
  if (/an gi|mon ngon|am thuc|do an/.test(q)) {
    const food = {
      danang:
        "Ở Đà Nẵng, bạn có thể khám phá mì Quảng, bánh tráng cuốn thịt heo và bún chả cá.",
    };
    return (
      (food[destination] ||
        "Bạn muốn khám phá ẩm thực các điểm đến Việt Nam? Cho mình biết điểm đến để nhận gợi ý phù hợp nhé.") +
      "\n\nNếu có dị ứng hoặc chế độ ăn riêng, nhớ hỏi rõ thành phần với nhà hàng."
    );
  }
  if (/ngan sach|chi phi|bao nhieu|gia tien|trieu/.test(q))
    return "Để phác thảo ngân sách, hãy chia thành: di chuyển, lưu trú, ăn uống, vé tham quan và khoản dự phòng. Giá thay đổi theo mùa nên mình chưa thể báo giá thực tế.\n\nBạn có thể bắt đầu bằng lịch trình mẫu cho Đà Nẵng, rồi kiểm tra giá từng dịch vụ theo ngày đi.";
  if (/thu gian|binh yen|nghi duong|goi y diem den/.test(q))
    return "Bạn có thể khám phá Hạ Long, Bản Giốc, Mã Pí Lèng, Hội An, Cầu Vàng và Lý Sơn. Mở trang Tạo lịch trình để lên kế hoạch nhé.";
  if (destination === "danang")
    return "Đà Nẵng là một khởi đầu thật đẹp! ☀️ Đây là lịch trình mẫu 3 ngày:\n\nNgày 1 · Biển Mỹ Khê → nghỉ ngơi → dạo sông Hàn buổi tối.\nNgày 2 · Bán đảo Sơn Trà → chùa Linh Ứng → khám phá món địa phương.\nNgày 3 · Ngũ Hành Sơn → phố cổ Hội An → trở về Đà Nẵng.\n\nHãy điều chỉnh theo sức khỏe, thời tiết và giờ mở cửa. Bạn muốn gợi ý món ngon hay cách chia ngân sách?";
  if (/xin chao|hello|chao|hi\b/.test(q))
    return "Chào bạn! 🌿 Mình là TripMate, người bạn lên ý tưởng du lịch. Bạn có thể hỏi “Đà Nẵng 3 ngày”, “Gợi ý điểm đến Việt Nam” để thử nhé.";
  if (/cam on/.test(q))
    return "Rất vui được đồng hành cùng bạn! 🌿 Khi muốn khám phá một điểm đến khác, cứ nhắn Đà Nẵng nhé.";
  return "Mình đã nhận được câu hỏi của bạn. Bản demo hiện hỗ trợ các kịch bản về Việt Nam, ẩm thực và chuẩn bị chuyến đi.\n\nBạn thử hỏi “Đà Nẵng 3 ngày” hoặc chọn một điểm đến bên dưới nhé. Mình chưa thể trả lời tự do như một dịch vụ AI đã kết nối.";
}

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  const label = document.createElement("span");
  label.className = "message-label";
  label.textContent = type === "user" ? "BẠN" : "TRIPMATE AI";
  const body = document.createElement("p");
  body.textContent = text;
  message.append(label, body);
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
}

function sendMessage(text) {
  const clean = text.trim().slice(0, 600);
  if (!clean || sendButton.disabled) return;
  addMessage(clean, "user");
  input.value = "";
  suggestions.hidden = true;
  sendButton.disabled = true;
  pendingReply = setTimeout(() => {
    addMessage(getReply(clean), "bot");
    sendButton.disabled = false;
    pendingReply = undefined;
  }, 450);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});
document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .getElementById("assistant")
      .scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "center",
      });
    sendMessage(button.dataset.prompt);
  });
});
document.getElementById("reset-chat").addEventListener("click", () => {
  clearTimeout(pendingReply);
  messages.innerHTML = initialMessage;
  suggestions.hidden = false;
  sendButton.disabled = false;
  destination = "";
  input.value = "";
  input.focus({ preventScroll: true });
});
document.getElementById("year").textContent = new Date().getFullYear();
