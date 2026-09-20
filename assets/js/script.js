const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const messages = document.getElementById("chat-messages");
const suggestions = document.getElementById("suggestions");
const sendButton = form.querySelector("button");
const initialMessage = messages.innerHTML;
const initialSuggestions = suggestions.cloneNode(true);
let pendingReply;
let sharedBot;
function getReply(question) {
  const E=window.TripPlannerEngine;
  sharedBot ||= window.TripMateChatbot.create(E);
  let plan=null;
  try { const state=JSON.parse(sessionStorage.getItem('tripmate.current-plan.v1')||'null'); if(state?.plan){E.validate(state.plan.input);E.costs(state.plan);plan=state.plan;} } catch {}
  const response=sharedBot.respond(plan,question);
  if(response.plan){
    try {sessionStorage.setItem('tripmate.current-plan.v1',JSON.stringify({plan:response.plan,dirty:true}));}
    catch {return 'Không thể giữ bản chỉnh sửa trên trình duyệt. Hãy mở trang Tạo lịch trình để thử lại.';}
  }
  suggestions.replaceChildren();
  (response.suggestions||[]).forEach(text=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',()=>sendMessage(text));suggestions.append(b);});
  suggestions.hidden=false;
  return response;
}

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  const label = document.createElement("span");
  label.className = "message-label";
  label.textContent = type === "user" ? "BẠN" : "TRIPMATE AI";
  const body = document.createElement("div");
  body.className = "chat-message-content";
  if (type === 'bot' && window.TripMateChatFormat) body.innerHTML = window.TripMateChatFormat.render(text);
  else body.textContent = text;
  message.append(label, body);
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
  return message;
}

function sendMessage(text) {
  const clean = text.trim().slice(0, 600);
  if (!clean || sendButton.disabled) return;
  addMessage(clean, "user");
  input.value = "";
  suggestions.hidden = true;
  sendButton.disabled = true;
  pendingReply = setTimeout(() => {
    try {
      const response = getReply(clean);
      const message = addMessage(typeof response === 'string' ? response : response.reply, "bot");
      for (const action of response.actions || []) {
        if (!/^plan\.html(?:\?destination=[\w%-]+)?$/.test(action.href)) continue;
        const link = document.createElement('a'); link.className = 'chat-action'; link.href = action.href; link.textContent = action.label; message.append(link);
      }
    } catch { addMessage('Mình chưa xử lý được yêu cầu. Bạn thử hỏi ngắn hơn nhé.', 'bot'); }
    finally { sendButton.disabled = false; pendingReply = undefined; suggestions.hidden = false; }
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
  suggestions.replaceChildren(...Array.from(initialSuggestions.children).map(node => node.cloneNode(true)));
  suggestions.querySelectorAll('button').forEach(button => button.addEventListener('click', () => sendMessage(button.textContent)));
  suggestions.hidden = false;
  sendButton.disabled = false;
  sharedBot?.reset();
  input.value = "";
  input.focus({ preventScroll: true });
});
document.getElementById("year").textContent = new Date().getFullYear();
