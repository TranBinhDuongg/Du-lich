(() => {
  "use strict";
  const E = window.TripPlannerEngine;
  const planner = document.getElementById("planner-dialog"),
    savedDialog = document.getElementById("saved-dialog"),
    form = document.getElementById("planner-form"),
    result = document.getElementById("plan-result");
  const feedback = document.getElementById("planner-feedback"),
    savedFeedback = document.getElementById("saved-feedback"),
    error = document.getElementById("planner-error");
  const key = "tripmate.saved-plans.v1";
  let activePlan = null,
    opener = null;
  const money = (n) => Math.round(n).toLocaleString("vi-VN") + " ₫";
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  // Interface effects stay enabled; old saved toggle preferences are ignored.
  const reduceMotion = { matches: false };
  document.documentElement.classList.add("interface-motion-on");
  document.documentElement.classList.remove("interface-motion-off");
  let budgetFrame = 0,
    lastBudget = null;
  const closeAnimations = new Map();
  function play(element, frames, options = {}) {
    if (!element || reduceMotion.matches || !element.animate) return null;
    return element.animate(frames, {
      duration: 380,
      easing: "cubic-bezier(.2,.8,.2,1)",
      ...options,
    });
  }
  function enterWorkspace(d) {
    play(
      d,
      [
        { opacity: 0, transform: "translateY(38px) scale(.96)" },
        { opacity: 1, transform: "translateY(0) scale(1)" },
      ],
      { duration: 520 },
    );
    d.querySelectorAll(".workspace-top,.planner-form,.plan-empty").forEach(
      (el, i) =>
        play(
          el,
          [
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { delay: i * 45, duration: 360, fill: "backwards" },
        ),
    );
  }
  function stopClosing(d) {
    const animation = closeAnimations.get(d);
    closeAnimations.delete(d);
    animation?.cancel();
  }
  function closeWorkspace(d) {
    if (!d.open || closeAnimations.has(d)) return;
    const animation = play(
      d,
      [
        { opacity: 1, transform: "translateY(0) scale(1)" },
        { opacity: 0, transform: "translateY(12px) scale(.985)" },
      ],
      { duration: 160, easing: "ease-in" },
    );
    if (!animation) {
      d.close();
      return;
    }
    closeAnimations.set(d, animation);
    animation.finished
      .then(() => {
        if (closeAnimations.get(d) === animation) {
          closeAnimations.delete(d);
          d.close();
        }
      })
      .catch(() => {});
  }
  function animateResult(before, fromBudget, toBudget) {
    const cards = [...result.querySelectorAll(".day-card")];
    cards.forEach((card, i) => {
      if (!before[i])
        play(
          card,
          [
            { opacity: 0, transform: "translateY(22px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { delay: Math.min(i * 90, 450), duration: 620, fill: "backwards" },
        );
      else if (before[i] !== card.innerHTML) {
        play(
          card,
          [
            {
              background: "#e7f2d8",
              transform: "translateX(9px)",
              opacity: 0.7,
            },
            { background: "#ffffff", transform: "translateX(0)", opacity: 1 },
          ],
          { duration: 750 },
        );
        card.querySelectorAll(".activity").forEach((row, j) =>
          play(
            row,
            [
              { opacity: 0.25, transform: "translateY(7px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 300, delay: j * 45, fill: "backwards" },
          ),
        );
      }
    });
    if (!before.length)
      play(result.querySelector(".result-heading"), [
        { opacity: 0, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0)" },
      ]);
    cancelAnimationFrame(budgetFrame);
    budgetFrame = 0;
    const total = result.querySelector(".budget-total strong");
    total.setAttribute("aria-label", money(toBudget));
    if (
      fromBudget !== null &&
      fromBudget !== toBudget &&
      !reduceMotion.matches
    ) {
      play(
        result.querySelector(".budget-summary"),
        [
          { boxShadow: "0 0 0 0 #6a9b5040" },
          { boxShadow: "0 0 0 8px #6a9b5000" },
        ],
        { duration: 650 },
      );
      const start = performance.now();
      const tick = (now) => {
        if (!total.isConnected) {
          budgetFrame = 0;
          return;
        }
        const t = Math.min(1, (now - start) / 850),
          ease = 1 - Math.pow(1 - t, 3);
        total.textContent = money(fromBudget + (toBudget - fromBudget) * ease);
        if (t < 1) budgetFrame = requestAnimationFrame(tick);
        else budgetFrame = 0;
      };
      budgetFrame = requestAnimationFrame(tick);
    }
  }
  function announce(el) {
    play(
      el,
      [
        { opacity: 0.3, transform: "translateY(5px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 280 },
    );
  }
  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest("button");
      if (
        !button ||
        button.classList.contains("close-chat") ||
        button.disabled ||
        reduceMotion.matches ||
        !button.closest(".product-nav,.workspace-dialog,#chat-dialog")
      )
        return;
      const rect = button.getBoundingClientRect(),
        size = Math.max(rect.width, rect.height) * 2;
      const ripple = document.createElement("span");
      ripple.className = "ui-ripple";
      ripple.setAttribute("aria-hidden", "true");
      const x = event.detail ? event.clientX - rect.left : rect.width / 2,
        y = event.detail ? event.clientY - rect.top : rect.height / 2;
      Object.assign(ripple.style, {
        width: size + "px",
        height: size + "px",
        left: x - size / 2 + "px",
        top: y - size / 2 + "px",
      });
      button.append(ripple);
      const animation = play(
        ripple,
        [
          { opacity: 0.2, transform: "scale(0)" },
          { opacity: 0, transform: "scale(1)" },
        ],
        { duration: 480, easing: "ease-out" },
      );
      if (animation)
        animation.finished
          .then(() => ripple.remove())
          .catch(() => ripple.remove());
      else ripple.remove();
    },
    true,
  );

  function readSaved() {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw
        .filter((p) => {
          try {
            E.validate(p.input);
            return (
              typeof p.id === "string" &&
              Array.isArray(p.days) &&
              p.days.length === p.input.days &&
              p.days.every(
                (d) =>
                  Array.isArray(d.activities) &&
                  d.activities.length === 3 &&
                  d.activities.every(
                    (a) =>
                      typeof a.name === "string" &&
                      typeof a.tag === "string" &&
                      typeof a.time === "string" &&
                      Number.isFinite(a.cost) &&
                      a.cost >= 0,
                  ),
              )
            );
          } catch {
            return false;
          }
        })
        .slice(0, 50);
    } catch {
      return [];
    }
  }
  function persist(plans) {
    try {
      localStorage.setItem(key, JSON.stringify(plans));
      return true;
    } catch {
      return false;
    }
  }
  function openWorkspace(which) {
    opener = document.activeElement;
    stopClosing(planner);
    stopClosing(savedDialog);
    if (planner.open) planner.close();
    if (savedDialog.open) savedDialog.close();
    const chat = document.getElementById("chat-dialog");
    if (chat.open) chat.close();
    document.getElementById("journey-menu").hidden = true;
    document
      .querySelector(".menu-button")
      .setAttribute("aria-expanded", "false");
    if (which === "saved") {
      renderSaved();
      savedDialog.showModal();
      enterWorkspace(savedDialog);
    } else {
      planner.showModal();
      enterWorkspace(planner);
    }
  }
  function populate() {
    if (!activePlan) return;
    const v = activePlan.input;
    ["destination", "days", "people", "budget"].forEach(
      (k) => (form.elements[k].value = v[k]),
    );
    form
      .querySelectorAll("[name=interests]")
      .forEach((x) => (x.checked = v.interests.includes(x.value)));
  }
  function renderPlan() {
    if (!activePlan) return;
    const before = [...result.querySelectorAll(".day-card")].map(
      (card) => card.innerHTML,
    );
    const focused = document.activeElement;
    const focusedAction = result.contains(focused)
      ? { day: focused.dataset.changeDay, action: focused.dataset.planAction }
      : null;
    const fromBudget = lastBudget;
    const p = activePlan,
      d = E.destinations[p.input.destination],
      c = E.costs(p),
      people = p.input.people;
    result.innerHTML =
      '<div class="result-heading"><div><h3>' +
      esc(d.name) +
      "</h3><p>" +
      p.input.days +
      " ngày · " +
      (p.input.days - 1) +
      " đêm · " +
      people +
      " người<br>" +
      p.input.interests.map(esc).join(" · ") +
      '</p></div><span class="result-badge">' +
      (p.economy ? "PHƯƠNG ÁN TIẾT KIỆM" : "LỊCH TRÌNH THAM KHẢO") +
      "</span></div>" +
      '<div class="budget-summary"><div class="budget-total"><span>Dự toán cho cả nhóm<br>' +
      money(c.totalPerPerson) +
      " / người</span><strong>" +
      money(c.total) +
      '</strong></div><div class="budget-detail">' +
      [
        ["stay", "Lưu trú"],
        ["food", "Bữa ăn"],
        ["transport", "Đi lại tại chỗ"],
        ["activities", "Trải nghiệm & ăn vặt"],
        ["reserve", "Dự phòng 10%"],
      ]
        .map(
          ([k, label]) =>
            "<div>" +
            label +
            "<b>" +
            money(c.perPerson[k] * people) +
            "</b></div>",
        )
        .join("") +
      "</div>" +
      (c.over
        ? '<p class="budget-alert">Dự toán vượt ngân sách ' +
          money(c.total - c.budgetTotal) +
          ". Thử “Giảm chi phí”, giảm số ngày hoặc điều chỉnh ngân sách.</p>"
        : '<p class="budget-note">Trong ngân sách ' +
          money(c.budgetTotal) +
          " cho cả nhóm.</p>") +
      "</div>" +
      '<div class="result-actions"><button class="save-plan" data-plan-action="save">' +
      (p.id ? "Lưu thay đổi" : "Lưu lịch trình") +
      '</button><button data-plan-action="reduce">↓ Giảm chi phí</button><button data-plan-action="chat">✧ Hỏi chatbot</button></div>' +
      p.days
        .map(
          (day) =>
            '<article class="day-card"><header><h4>Ngày ' +
            day.number +
            '</h4><button data-change-day="' +
            day.number +
            '">Đổi hoạt động ↻</button></header>' +
            E.scheduleDay(p, day.number - 1)
              .map(
                (a) =>
                  '<div class="activity"><time>' +
                  esc(a.time) +
                  "</time><div><strong>" +
                  esc(a.name) +
                  "</strong><small>" +
                  esc(a.tag) +
                  "</small></div><span>" +
                  (a.note
                    ? esc(a.note)
                    : a.cost
                      ? money(a.cost) + " / người"
                      : "Chi phí mẫu: 0 ₫") +
                  "</span></div>",
              )
              .join("") +
            "</article>",
        )
        .join("") +
      '<p class="planning-note">Đây là lịch trình theo kịch bản, không phải kết quả AI trực tiếp. Các mức tiền là giả định để lập kế hoạch, không phải báo giá. Chưa gồm vé máy bay/tàu/xe đến điểm đến. Với chuyến dài, một số hoạt động có thể lặp lại; hãy đổi từng ngày để điều chỉnh.</p>';
    document.getElementById("return-to-plan").hidden = false;
    lastBudget = c.total;
    animateResult(before, fromBudget, c.total);
    if (focusedAction) {
      const target = focusedAction.day
        ? result.querySelector('[data-change-day="' + focusedAction.day + '"]')
        : focusedAction.action
          ? result.querySelector(
              '[data-plan-action="' + focusedAction.action + '"]',
            )
          : null;
      target?.focus({ preventScroll: true });
    }
  }
  function savePlan() {
    if (!activePlan) return;
    const plans = readSaved(),
      candidate = JSON.parse(JSON.stringify(activePlan));
    if (!candidate.id)
      candidate.id =
        globalThis.crypto?.randomUUID?.() ||
        "plan-" + Date.now() + "-" + Math.random().toString(16).slice(2);
    candidate.savedAt = new Date().toISOString();
    const at = plans.findIndex((p) => p.id === candidate.id);
    if (at >= 0) plans[at] = candidate;
    else plans.unshift(candidate);
    if (!persist(plans.slice(0, 50))) {
      feedback.textContent =
        "Trình duyệt không cho phép lưu dữ liệu. Lịch trình vẫn còn trong phiên này; hãy bật lưu trữ trình duyệt rồi thử lại.";
      return;
    }
    activePlan = candidate;
    renderPlan();
    const savedButton = result.querySelector(".save-plan");
    savedButton.textContent = "✓ Đã lưu";
    play(
      savedButton,
      [
        { transform: "scale(.94)", background: "#49743b" },
        { transform: "scale(1)", background: "#244f40" },
      ],
      { duration: 360 },
    );
    feedback.textContent =
      "Đã lưu lịch trình trên trình duyệt này. Mở “Đã lưu” trong menu để xem lại.";
  }
  function renderSaved() {
    const previous = new Map(
      [...document.querySelectorAll("#saved-list .saved-card")].map((card) => [
        card.querySelector("[data-open-plan]").dataset.openPlan,
        card.getBoundingClientRect(),
      ]),
    );
    const plans = readSaved(),
      list = document.getElementById("saved-list");
    savedFeedback.textContent = "";
    if (!plans.length) {
      list.innerHTML =
        '<div class="plan-empty"><span>⌖</span><h3>Chưa có hành trình nào được lưu.</h3><p>Tạo một lịch trình rồi chọn “Lưu lịch trình”.</p><button class="primary-action" style="max-width:220px;margin-top:20px" data-new-plan>Tạo lịch trình đầu tiên ↗</button></div>';
      return;
    }
    list.innerHTML = plans
      .map(
        (p) =>
          '<article class="saved-card"><h3>' +
          esc(E.destinations[p.input.destination].name) +
          "</h3><p>" +
          p.input.days +
          " ngày · " +
          p.input.people +
          " người · " +
          money(E.costs(p).total) +
          " / nhóm<br>" +
          p.input.interests.map(esc).join(" · ") +
          '</p><footer><button data-open-plan="' +
          esc(p.id) +
          '">Mở & chỉnh sửa ↗</button><button class="delete-plan" data-delete-plan="' +
          esc(p.id) +
          '">Xóa</button></footer></article>',
      )
      .join("");
    list.querySelectorAll(".saved-card").forEach((card, i) => {
      const old = previous.get(
        card.querySelector("[data-open-plan]").dataset.openPlan,
      );
      const dy = old ? old.top - card.getBoundingClientRect().top : 16;
      play(
        card,
        [
          { opacity: old ? 1 : 0, transform: "translateY(" + dy + "px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 380,
          delay: old ? 0 : Math.min(i * 45, 225),
          fill: "backwards",
        },
      );
    });
  }
  function chatForPlan() {
    if (planner.open) planner.close();
    openChat();
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.textContent = "";
    error.textContent = "";
    const data = new FormData(form);
    try {
      activePlan = E.generate({
        destination: data.get("destination"),
        days: data.get("days"),
        people: data.get("people"),
        budget: data.get("budget"),
        interests: data.getAll("interests"),
      });
      renderPlan();
      feedback.textContent =
        "Đã tạo lịch trình. Bạn có thể đổi từng ngày, giảm chi phí hoặc lưu lại.";
      result.scrollIntoView({
        block: "nearest",
        behavior: reduceMotion.matches ? "instant" : "smooth",
      });
    } catch (e) {
      error.textContent = e.message;
      play(
        error,
        [
          { transform: "translateX(-5px)" },
          { transform: "translateX(5px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 220 },
      );
    }
  });
  result.addEventListener("click", (event) => {
    const dayButton = event.target.closest("[data-change-day]");
    if (dayButton) {
      activePlan = E.changeDay(activePlan, Number(dayButton.dataset.changeDay));
      renderPlan();
      feedback.textContent =
        "Đã đổi hoạt động ngày " +
        dayButton.dataset.changeDay +
        ". Hãy lưu lại để giữ thay đổi.";
      return;
    }
    const action =
      event.target.closest("[data-plan-action]")?.dataset.planAction;
    if (action === "save") savePlan();
    if (action === "chat") chatForPlan();
    if (action === "reduce") {
      const change = E.command(activePlan, "Giảm chi phí");
      activePlan = change.plan;
      renderPlan();
      feedback.textContent = change.reply;
    }
  });
  document.getElementById("saved-list").addEventListener("click", (event) => {
    if (event.target.closest("[data-new-plan]")) {
      openWorkspace("planner");
      return;
    }
    const open = event.target.closest("[data-open-plan]"),
      del = event.target.closest("[data-delete-plan]");
    if (open) {
      activePlan =
        readSaved().find((p) => p.id === open.dataset.openPlan) || null;
      if (!activePlan) return;
      populate();
      renderPlan();
      feedback.textContent = "Đang chỉnh sửa lịch trình đã lưu.";
      openWorkspace("planner");
    }
    if (del) {
      const id = del.dataset.deletePlan;
      if (!persist(readSaved().filter((p) => p.id !== id))) {
        savedFeedback.textContent =
          "Chưa xóa được vì trình duyệt chặn lưu trữ.";
        return;
      }
      if (activePlan?.id === id) {
        activePlan.id = null;
        renderPlan();
      }
      renderSaved();
      savedFeedback.textContent = "Đã xóa lịch trình.";
    }
  });
  document.querySelectorAll("[data-view]").forEach((button) =>
    button.addEventListener("click", () => {
      const view = button.dataset.view;
      if (["planner", "saved", "chat"].includes(view)) {
        window.TripMateNavigate(
          view === "saved"
            ? "saved.html"
            : view === "chat"
              ? "chat.html"
              : "plan.html",
        );
        return;
      }
      document.getElementById("journey-menu").hidden = true;
      document
        .querySelector(".menu-button")
        .setAttribute("aria-expanded", "false");
      if (view === "home") {
        document.querySelector(".wordmark").click();
        return;
      }
      if (view === "chat") {
        openChat();
        return;
      }
      openWorkspace(view);
    }),
  );
  [planner, savedDialog].forEach((d) => {
    d.querySelector("[data-close-workspace]").addEventListener("click", () =>
      closeWorkspace(d),
    );
    d.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeWorkspace(d);
    });
    d.addEventListener("close", () => stopClosing(d));
    d.addEventListener("close", () => {
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    });
    d.addEventListener("click", (event) => {
      if (event.target !== d) return;
      const r = d.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        closeWorkspace(d);
    });
  });
  document
    .getElementById("return-to-plan")
    .addEventListener("click", () => openWorkspace("planner"));
  const feedbackObserver = new MutationObserver((records) => {
    for (const el of new Set(
      records.map((r) =>
        r.target.nodeType === 3 ? r.target.parentElement : r.target,
      ),
    )) {
      if (el.textContent.trim()) announce(el);
    }
  });
  [feedback, savedFeedback].forEach((el) =>
    feedbackObserver.observe(el, {
      childList: true,
      characterData: true,
      subtree: true,
    }),
  );
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(budgetFrame);
    feedbackObserver.disconnect();
  });
  window.TripMatePlanner = {
    handle(text) {
      try {
        const response = E.command(activePlan, text);
        if (!response) return null;
        if (response.plan) {
          activePlan = response.plan;
          renderPlan();
          feedback.textContent = response.reply;
        }
        return response.reply;
      } catch (e) {
        return e.message;
      }
    },
  };
})();

document.querySelectorAll("[data-open-chat]").forEach((button) =>
  button.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.TripMateNavigate("chat.html");
    },
    true,
  ),
);
