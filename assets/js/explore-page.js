const journey = document.getElementById("journey");
const dialog = document.getElementById("chat-dialog");
const menu = document.getElementById("journey-menu");
const menuButton = document.querySelector(".menu-button");
const progress = document.querySelector(".progress");
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const scrollBehavior = () =>
  prefersReducedMotion.matches ? "instant" : "smooth";
let previousFocus;
function openChat() {
  if (dialog.open) return;
  previousFocus = document.activeElement;
  dialog.showModal();
  document.getElementById("chat-input").focus();
}
function closeChat() {
  dialog.close();
}
document
  .querySelectorAll("[data-open-chat], [data-prompt]")
  .forEach((button) => button.addEventListener("click", openChat));
document.querySelector(".close-chat").addEventListener("click", closeChat);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      closeChat();
  }
});
dialog.addEventListener("close", () =>
  previousFocus?.focus({ preventScroll: true }),
);
menuButton.addEventListener("click", () => {
  menu.hidden = !menu.hidden;
  menuButton.setAttribute("aria-expanded", String(!menu.hidden));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menu.hidden) {
    menu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.focus();
  }
});
document.querySelectorAll('a[href^="#"]').forEach((link) =>
  link.addEventListener("click", (event) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (!section) return;
    event.preventDefault();
    journey.scrollTo({ left: section.offsetLeft, behavior: scrollBehavior() });
    menu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
  }),
);
const move = (direction) =>
  journey.scrollBy({
    left: direction * journey.clientWidth * 0.75,
    behavior: scrollBehavior(),
  });
document.getElementById("previous").addEventListener("click", () => move(-1));
document.getElementById("next").addEventListener("click", () => move(1));
journey.addEventListener("keydown", (event) => {
  if (event.target !== journey) return;
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    move(event.key === "ArrowRight" ? 1 : -1);
  }
});
journey.addEventListener(
  "wheel",
  (event) => {
    if (journey.classList.contains("discover-page") || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY))
      return;
    event.preventDefault();
    journey.scrollLeft +=
      event.deltaY *
      (event.deltaMode === 1
        ? 20
        : event.deltaMode === 2
          ? journey.clientWidth
          : 1);
  },
  { passive: false },
);
let drag;
journey.addEventListener("pointerdown", (event) => {
  if (
    journey.classList.contains("discover-page") || event.pointerType !== "mouse" ||
    event.button !== 0 ||
    event.target.closest("button,a,input")
  )
    return;
  drag = { x: event.clientX, scroll: journey.scrollLeft, id: event.pointerId };
  journey.setPointerCapture(event.pointerId);
  journey.classList.add("dragging");
});
journey.addEventListener("pointermove", (event) => {
  if (drag) journey.scrollLeft = drag.scroll - (event.clientX - drag.x);
});
function stopDrag() {
  drag = null;
  journey.classList.remove("dragging");
}
journey.addEventListener("pointerup", stopDrag);
journey.addEventListener("pointercancel", stopDrag);
journey.addEventListener("lostpointercapture", stopDrag);
function updateProgress() {
  const max = journey.scrollWidth - journey.clientWidth;
  const amount = max > 0 ? journey.scrollLeft / max : 0;
  progress.firstElementChild.style.width = `${amount * 100}%`;
  progress.setAttribute("aria-valuenow", String(Math.round(amount * 100)));
  document.getElementById("previous").disabled = journey.scrollLeft < 2;
  document.getElementById("next").disabled = journey.scrollLeft >= max - 2;
}
journey.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();
document.querySelectorAll("[data-hotel]").forEach((button) =>
  button.addEventListener("click", () => {
    const image = document.getElementById(button.dataset.hotel);
    image.src = button.dataset.image;
    image.alt = `${button.textContent} — lưu trú tham khảo`;
    button.parentElement.querySelectorAll("button").forEach((option) => {
      option.classList.toggle("selected", option === button);
      option.setAttribute("aria-pressed", String(option === button));
    });
  }),
);

