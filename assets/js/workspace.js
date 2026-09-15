(() => {
  "use strict";
  const E = window.TripPlannerEngine,
    $ = (id) => document.getElementById(id),
    form = $("studio-form"),
    key = "tripmate.saved-plans.v1";
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
  const colors = {
    halong: "#557f80",
    danang: "#497d9a",
    hanoi: "#897060",
    dalat: "#607965",
  };
  Object.entries(E.destinations).forEach(([id, d]) => {
    colors[id] = d.color || colors[id] || "#557f80";
  });
  const icons = {
    "Ẩm thực": "♧",
    Biển: "≈",
    "Thiên nhiên": "❋",
    "Văn hóa": "⌂",
    "Check-in": "◎",
  };
  const provinceOverrides = {
    "dldt-file-050": "Cần Thơ",
    "dldt-file-051": "Sóc Trăng",
    "dldt-file-052": "Sóc Trăng",
    "dldt-file-053": "Tiền Giang",
    "dldt-file-054": "Cần Thơ",
    "dldt-file-055": "Tiền Giang",
    "dldt-file-056": "Bến Tre",
    "dldt-file-057": "Kiên Giang",
    "dldt-file-058": "Đồng Tháp",
    "dldt-file-059": "Cà Mau",
    "dldt-file-060": "Cần Thơ",
    "dldt-file-061": "An Giang",
    "dldt-file-062": "An Giang",
    "dldt-file-063": "Cà Mau",
    "dldt-file-064": "An Giang",
    "dldt-file-065": "Đồng Tháp",
    "dldt-file-066": "Kiên Giang",
    "dldt-file-067": "Kiên Giang",
    "dldt-file-068": "TP.HCM",
    "dldt-file-069": "TP.HCM",
    "dldt-file-070": "Đồng Nai",
    "dldt-file-071": "TP.HCM",
    "dldt-file-072": "Bà Rịa - Vũng Tàu",
    "dldt-file-073": "TP.HCM",
    "dldt-file-074": "Tây Ninh",
    "dldt-file-075": "Tây Ninh",
    "dldt-file-076": "Tây Ninh",
    "dldt-file-077": "Bà Rịa - Vũng Tàu",
    "dldt-file-078": "Bà Rịa - Vũng Tàu",
    "dldt-file-079": "TP.HCM",
    "dldt-file-080": "TP.HCM",
    "dldt-file-081": "Đồng Nai",
  };
  const dldtDestinations = Object.entries(E.destinations).filter(
    ([id, destination]) => id.startsWith("dldt-file-") && destination.region,
  );
  const provinceOf = (id) =>
    provinceOverrides[id] ||
    E.destinations[id]?.region ||
    (E.destinations[id] ? "Điểm đến đã lưu" : "Khác");
  function setDestinationOptions(province, selectedDestination) {
    if (!form?.elements.destination) return;
    const options =
      province === "Điểm đến đã lưu" && E.destinations[selectedDestination]
        ? [[selectedDestination, E.destinations[selectedDestination]]]
        : dldtDestinations.filter(([id]) => provinceOf(id) === province);
    form.elements.destination.innerHTML = options
      .map(
        ([id, destination]) =>
          '<option value="' + esc(id) + '">' + esc(destination.name) + "</option>",
      )
      .join("");
    if (options.some(([id]) => id === selectedDestination))
      form.elements.destination.value = selectedDestination;
  }
  function setProvinceOptions(selectedDestination) {
    if (!form?.elements.province) return;
    let provinces = [
      ...new Set(dldtDestinations.map(([id]) => provinceOf(id))),
    ].sort((a, b) => a.localeCompare(b, "vi"));
    const selectedProvince = provinceOf(selectedDestination);
    if (!provinces.includes(selectedProvince)) provinces.unshift(selectedProvince);
    form.elements.province.innerHTML = provinces
      .map(
        (province) =>
          '<option value="' + esc(province) + '">' + esc(province) + "</option>",
      )
      .join("");
    form.elements.province.value = selectedProvince;
    setDestinationOptions(selectedProvince, selectedDestination);
  }
  const screen = document.body.dataset.screen || "plan",
    draftKey = "tripmate.current-plan.v1";
  let plan,
    selectedDestinations = [],
    hasExplicitDestinationSelection = false,
    day = 1,
    dirty = true,
    toastTimer;
  function keep() {
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({ plan, dirty }));
    } catch {
      toast(
        "Không thể giữ bản nháp khi chuyển trang. Hãy lưu hành trình trước.",
      );
    }
  }
  function go(page) {
    keep();
    window.TripMateNavigate
      ? window.TripMateNavigate(page + ".html")
      : (location.href = page + ".html");
  }
  function restore() {
    try {
      const state = JSON.parse(sessionStorage.getItem(draftKey));
      if (!state?.plan) return false;
      E.validate(state.plan.input);
      E.costs(state.plan);
      if (
        !Array.isArray(state.plan.days) ||
        state.plan.days.length !== state.plan.input.days ||
        !state.plan.days.every((d) => d.activities?.length === 3)
      )
        return false;
      plan = state.plan;
      dirty = state.dirty;
      return true;
    } catch {
      return false;
    }
  }

  function animate(el) {
    el?.animate?.(
      [
        { opacity: 0, transform: "translateY(12px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
  }
  function toast(text) {
    $("studio-toast").textContent = text;
    $("studio-toast").hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ($("studio-toast").hidden = true), 3500);
  }
  function read() {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]")
        .filter((p) => {
          try {
            E.validate(p.input);
            return (
              typeof p.id === "string" &&
              p.days.length === p.input.days &&
              p.days.every(
                (d) =>
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
  function write(records) {
    try {
      localStorage.setItem(key, JSON.stringify(records));
      return true;
    } catch {
      toast(
        "Không thể lưu trên trình duyệt này. Vui lòng kiểm tra dung lượng lưu trữ.",
      );
      return false;
    }
  }
  function destinationIds(value) {
    return [
      ...new Set(
        (value?.destinations?.length
          ? value.destinations
          : [value?.destination]
        ).filter((id) => E.destinations[id]),
      ),
    ];
  }
  function destinationLabel(value, limit = 3) {
    const names = destinationIds(value).map((id) => E.destinations[id].name);
    const shown = names.slice(0, limit).join(", ");
    return names.length > limit ? shown + " +" + (names.length - limit) + " điểm" : shown;
  }
  function renderSelectedDestinations() {
    if (!$("selected-destinations")) return;
    $("selected-destinations").innerHTML = selectedDestinations.length
      ? selectedDestinations
          .map(
            (id) =>
              '<span class="destination-chip"><span>' +
              esc(E.destinations[id].name) +
              '</span><button type="button" data-remove-destination="' +
              esc(id) +
              '" aria-label="Bỏ ' +
              esc(E.destinations[id].name) +
              '">×</button></span>',
          )
          .join("")
      : '<small>Chưa có địa điểm nào được chọn.</small>';
  }
  function addSelectedDestination(id) {
    if (!E.destinations[id]) return;
    if (!selectedDestinations.includes(id)) selectedDestinations.push(id);
    hasExplicitDestinationSelection = true;
    renderSelectedDestinations();
  }
  function input() {
    if (!form)
      return {
        destination: "dldt-file-001",
        days: 3,
        people: 2,
        budget: 3000000,
        interests: ["Ẩm thực", "Biển", "Check-in"],
      };
    const f = new FormData(form);
    const currentDestination = f.get("destination");
    const destinations =
      selectedDestinations.length > 1 || hasExplicitDestinationSelection
        ? [...selectedDestinations]
        : [currentDestination || selectedDestinations[0]].filter(Boolean);
    return {
      destination: destinations[0],
      destinations,
      days: Number(f.get("days")),
      people: Number(f.get("people")),
      budget: Number(f.get("budget")),
      interests: f.getAll("interests"),
    };
  }
  function populate() {
    if (!form) return;
    selectedDestinations = destinationIds(plan.input);
    hasExplicitDestinationSelection = selectedDestinations.length > 1;
    setProvinceOptions(plan.input.destination);
    const select = form.elements.destination;
    if (select.options && !Array.from(select.options).some(o => o.value === plan.input.destination)) {
      const option = document.createElement("option");
      option.value = plan.input.destination;
      option.textContent = E.destinations[plan.input.destination].name;
      select.append(option);
    }
    for (const k of ["destination", "days", "people", "budget"])
      form.elements[k].value = plan.input[k];
    form
      .querySelectorAll("[name=interests]")
      .forEach((x) => (x.checked = plan.input.interests.includes(x.value)));
    renderSelectedDestinations();
  }
  function renderDay() {
    if (!$("day-tabs")) return;
    $("day-tabs").innerHTML = plan.days
      .map(
        (d, i) =>
          '<button type="button" data-day="' +
          (i + 1) +
          '" class="' +
          (day === i + 1 ? "active" : "") +
          '" aria-pressed="' +
          (day === i + 1) +
          '">Ngày ' +
          (i + 1) +
          "</button>",
      )
      .join("");
    const dayDestinationNames = [
      ...new Set(
        plan.days[day - 1].activities
          .map((activity) => activity.destinationId)
          .filter((id) => E.destinations[id]),
      ),
    ].map((id) => E.destinations[id].name);
    $("day-content").innerHTML =
      '<div class="day-topline"><div><small>KHÁM PHÁ THEO NHỊP CỦA BẠN</small><h3>Ngày ' +
      day +
      " · " +
      esc(dayDestinationNames.join(" · ") || destinationLabel(plan.input)) +
      '</h3></div><button type="button" id="swap-day">↻ Đổi địa điểm</button></div>' +
      E.scheduleDay(plan, day - 1)
        .map(
          (a) =>
            '<article class="activity-card"><span class="activity-icon" aria-hidden="true">' +
            (icons[a.tag] || "✧") +
            '</span><div>' + (a.image ? '<img src="' + esc(a.image) + '" alt="' + esc(a.name) + '" loading="lazy" style="width:100%;max-width:320px;height:160px;object-fit:cover;border-radius:12px">' : '') + '<span class="activity-time">' +
            esc(a.time) +
            "</span><h4>" +
            esc(a.name) +
            '</h4><div class="activity-footer"><span class="activity-tag">' +
            esc(a.tag) +
            '</span><span class="activity-cost">' +
            (a.note
              ? esc(a.note)
              : a.cost
                ? money(a.cost) + "/người"
                : "Chi phí trải nghiệm: 0 ₫ (dự toán mẫu)") +
            "</span></div></div></article>",
        )
        .join("") +
      '<p class="day-tip">✧ Khung giờ gợi ý, chưa đối chiếu giờ mở cửa và thời gian di chuyển. Bữa ăn và nghỉ đêm dùng dự toán có sẵn.</p>';
    animate($("day-content"));
  }
  function render() {
    const v = plan.input,
      c = E.costs(plan),
      name = destinationLabel(v);
    if ($("destination-title")) {
      $("destination-title").textContent = name;
      $("trip-meta").textContent =
        v.days + " ngày · " + v.people + " người · " + v.interests.join(" & ");
      const photo =
        E.destinations[v.destination].image ||
        (v.destination === "halong" ? "assets/images/Vinh-ha-long.jpg" : null);
      $("destination-image").hidden = !photo;
      if (photo) $("destination-image").src = photo;
      $("destination-image").alt = "Phong cảnh " + name;
      document.querySelector(".destination-cover").style.background =
        "linear-gradient(125deg," + colors[v.destination] + ",#293d4c)";
    }
    if ($("chat-trip-title")) {
      $("chat-trip-title").textContent = name;
      $("chat-trip-meta").textContent =
        v.days +
        " ngày · " +
        v.people +
        " người · " +
        money(c.total) +
        " dự kiến";
    }
    if ($("budget-number")) {
      $("budget-number").innerHTML =
        money(c.total) + " <small>/ cả nhóm</small>";
      $("budget-meter-fill").style.width =
        Math.min(100, (c.total / c.budgetTotal) * 100) + "%";
      $("budget-status").classList.toggle("over", c.over);
      $("budget-status").textContent = c.over
        ? "Vượt ngân sách " + money(c.total - c.budgetTotal)
        : "Còn dư " + money(c.budgetTotal - c.total) + " so với ngân sách";
      const names = {
        stay: "Lưu trú",
        food: "Ăn uống",
        transport: "Di chuyển tại điểm đến",
        activities: "Trải nghiệm",
        reserve: "Dự phòng",
      };
      $("budget-brief").innerHTML = Object.entries(c.perPerson)
        .map(
          ([k, n]) =>
            "<div><span>" +
            names[k] +
            "</span><strong>" +
            money(n * v.people) +
            "</strong></div>",
        )
        .join("");
      if ($("budget-content"))
        $("budget-content").innerHTML =
          '<span class="overline">MỌI KHOẢN CHI, THẬT RÕ RÀNG</span><h3>Dự toán chuyến đi</h3><p>Ước tính cho ' +
          v.people +
          " người · " +
          v.days +
          " ngày</p>" +
          Object.entries(c.perPerson)
            .map(
              ([k, n]) =>
                '<div class="cost-row"><div><span>' +
                names[k] +
                "</span><strong>" +
                money(n * v.people) +
                '</strong></div><div class="bar"><span style="width:' +
                Math.round(((n * v.people) / c.total) * 100) +
                '%"></span></div></div>',
            )
            .join("") +
          '<div class="cost-total"><span>Tổng dự kiến</span><strong>' +
          money(c.total) +
          "</strong></div><p>" +
          money(c.totalPerPerson) +
          " / người. Chi phí minh họa, chưa gồm vé đến điểm đến.</p>";
      $("save-plan").textContent = dirty
        ? "♡ Lưu hành trình"
        : "✓ Đã lưu hành trình";
    }
    if ($("draft-label"))
      $("draft-label").textContent = dirty
        ? "Bản nháp · chưa lưu"
        : "Đã lưu trên trình duyệt";
    $("saved-count").textContent = read().length;
    renderDay();
    keep();
  }
  function bubble(text, user = false) {
    if (!$("studio-messages")) return;
    const el = document.createElement("div");
    el.className = "chat-bubble" + (user ? " user" : "");
    el.textContent = text;
    $("studio-messages").append(el);
    animate(el);
    document.getElementById("studio-messages").scrollTop =
      document.getElementById("studio-messages").scrollHeight;
  }
  function ask(text) {
    if (!text.trim()) return;
    bubble(text, true);
    try {
      const result = E.command(plan, text);
      if (result) {
        if (result.plan) {
          plan = result.plan;
          dirty = true;
          const n = text.match(/ngày\s*(\d+)/i);
          if (n) day = Math.min(plan.days.length, Number(n[1]));
          render();
        }
        bubble(result.reply);
      } else
        bubble(
          "Mình có thể điều chỉnh lịch trình bạn đang xem. Hãy thử “Đổi địa điểm ngày 2” hoặc “Giảm chi phí”. Để đổi điểm đến, số người hoặc ngân sách, hãy chỉnh thông tin chuyến đi rồi chọn Tạo lịch trình. Đây là trợ lý demo theo kịch bản.",
        );
    } catch (e) {
      bubble(e.message);
    }
  }
  function saved() {
    const records = read();
    $("saved-count").textContent = records.length;
    $("studio-saved").innerHTML = records.length
      ? records
          .map(
            (p) =>
              '<article class="saved-tile"><div class="saved-art" style="background:' +
              colors[p.input.destination] +
              '">' +
              (E.destinations[p.input.destination].image ||
              p.input.destination === "halong"
                ? '<img src="' +
                  (E.destinations[p.input.destination].image ||
                    "assets/images/Vinh-ha-long.jpg") +
                  '" alt="' +
                  esc(destinationLabel(p.input)) +
                  '">'
                : "") +
              "<span>" +
              esc(destinationLabel(p.input)) +
              '</span></div><div class="saved-body"><p>' +
              p.input.days +
              " ngày · " +
              p.input.people +
              " người</p><h3>" +
              esc(destinationLabel(p.input)) +
              " theo cách của bạn</h3><p>" +
              p.input.interests.map(esc).join(" · ") +
              '</p><strong class="saved-total">' +
              money(E.costs(p).total) +
              '</strong><div class="saved-actions"><button data-open="' +
              esc(p.id) +
              '">Mở hành trình ↗</button><button class="delete" data-delete="' +
              esc(p.id) +
              '" aria-label="Xóa lịch trình ' +
              esc(destinationLabel(p.input)) +
              '">Xóa</button></div></div></article>',
          )
          .join("")
      : '<div class="empty-library"><span>♡</span><h3>Những chuyến đi đang chờ bạn.</h3><p>Tạo một lịch trình và nhấn Lưu hành trình để giữ lại ở đây.</p><button data-page="plan">Tạo hành trình đầu tiên ↗</button></div>';
  }
  function route() {
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const active = a.dataset.nav === screen;
      a.classList.toggle("active", active);
      if (active) a.setAttribute("aria-current", "page");
    });
    $("page-title").innerHTML =
      screen === "saved"
        ? "Những hành trình, <em>để dành.</em>"
        : screen === "chat"
          ? "Một lời nhắn, <em>mở lối đi.</em>"
          : "Một chuyến đi, <em>thật riêng.</em>";
    $("page-subtitle").textContent =
      screen === "saved"
        ? "Những kế hoạch đã lưu, sẵn sàng cho ngày lên đường."
        : screen === "chat"
          ? "Một không gian riêng để trò chuyện và điều chỉnh hành trình của bạn."
          : "Chọn điều bạn thích. Sắp xếp một hành trình theo cách của riêng bạn.";
    if (screen === "saved") saved();
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      const next = E.generate(input());
      next.id = plan?.id || null;
      plan = next;
      selectedDestinations = [...next.input.destinations];
      day = 1;
      dirty = true;
      $("form-error").textContent = "";
      render();
      toast("Lịch trình mới đã sẵn sàng.");
    } catch (err) {
      $("form-error").textContent = err.message;
    }
  });
  form?.elements.province?.addEventListener("change", (e) => {
    setDestinationOptions(e.target.value);
    if (
      !hasExplicitDestinationSelection &&
      selectedDestinations.length <= 1 &&
      form.elements.destination.value
    ) {
      selectedDestinations = [form.elements.destination.value];
      renderSelectedDestinations();
    }
  });
  form?.elements.destination?.addEventListener?.("change", (e) => {
    if (!hasExplicitDestinationSelection && selectedDestinations.length <= 1) {
      selectedDestinations = [e.target.value];
      renderSelectedDestinations();
    }
  });
  $("add-destination")?.addEventListener("click", () => {
    const id = form?.elements.destination?.value;
    if (!id) return;
    const existed = selectedDestinations.includes(id);
    addSelectedDestination(id);
    toast(
      (existed ? "Đã giữ " : "Đã thêm ") +
        E.destinations[id].name +
        " trong chuyến đi.",
    );
  });
  $("selected-destinations")?.addEventListener("click", (e) => {
    const button = e.target.closest("[data-remove-destination]");
    if (!button) return;
    selectedDestinations = selectedDestinations.filter(
      (id) => id !== button.dataset.removeDestination,
    );
    if (!selectedDestinations.length) hasExplicitDestinationSelection = false;
    renderSelectedDestinations();
  });
  $("day-tabs")?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-day]");
    if (b) {
      day = Number(b.dataset.day);
      renderDay();
      $("day-tabs")
        .querySelector('[data-day="' + day + '"]')
        .focus();
    }
  });
  $("day-content")?.addEventListener("click", (e) => {
    if (e.target.closest("#swap-day")) {
      plan = E.changeDay(plan, day);
      dirty = true;
      render();
      $("swap-day").focus();
      toast("Đã đổi địa điểm ngày " + day + ".");
    }
  });
  $("reduce-cost")?.addEventListener("click", () => ask("Giảm chi phí"));
  $("save-plan")?.addEventListener("click", () => {
    const records = read(),
      record = JSON.parse(JSON.stringify(plan));
    record.id =
      record.id ||
      (crypto.randomUUID ? crypto.randomUUID() : "trip-" + Date.now());
    record.savedAt = new Date().toISOString();
    if (
      write([record, ...records.filter((p) => p.id !== record.id)].slice(0, 50))
    ) {
      plan = record;
      dirty = false;
      render();
      toast("Đã lưu hành trình trên trình duyệt này.");
    }
  });
  $("studio-saved")?.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open]"),
      del = e.target.closest("[data-delete]");
    if (open) {
      const url = "route.html?id=" + encodeURIComponent(open.dataset.open);
      window.TripMateNavigate
        ? window.TripMateNavigate(url)
        : (location.href = url);
    }
    if (del) {
      if (write(read().filter((p) => p.id !== del.dataset.delete))) {
        if (plan.id === del.dataset.delete) {
          plan.id = null;
          dirty = true;
          render();
        }
        saved();
        toast("Đã xóa lịch trình khỏi danh sách lưu.");
      }
    }
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-page]");
    if (b) go(b.dataset.page);
    const q = e.target.closest("[data-question]");
    if (q) ask(q.dataset.question);
  });
  document.querySelectorAll("[data-tab]").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach((t) => {
        const active = t === b;
        t.classList.toggle("selected", active);
        t.setAttribute("aria-selected", active);
      });
      $("timeline-content").hidden = b.dataset.tab !== "timeline";
      $("budget-content").hidden = b.dataset.tab !== "budget";
      animate($(b.dataset.tab + "-content"));
    }),
  );
  $("studio-chat-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = $("studio-chat-input").value;
    $("studio-chat-input").value = "";
    ask(text);
  });
  $("focus-chat")?.addEventListener("click", () => go("chat"));
  $("new-trip")?.addEventListener("click", () => {
    form?.reset();
    selectedDestinations = [];
    hasExplicitDestinationSelection = false;
    if (form?.elements.province)
      setDestinationOptions(form.elements.province.value);
    plan = E.generate(input());
    selectedDestinations = [...plan.input.destinations];
    renderSelectedDestinations();
    day = 1;
    dirty = true;
    render();
    go("plan");
    toast("Bắt đầu bản nháp mới. Hãy chọn sở thích của bạn.");
  });
  document
    .querySelectorAll(
      'a[href="plan.html"],a[href="chat.html"],a[href="saved.html"]',
    )
    .forEach((a) => a.addEventListener("click", () => keep()));
  if (!restore()) plan = E.generate(input());
  populate();
  render();
  route();
  bubble(
    "Xin chào! Mình sẵn sàng điều chỉnh hành trình hiện tại của bạn. Hãy mở trang Tạo lịch trình để đổi thông tin hoặc nhắn mình để đổi địa điểm, giảm chi phí nhé. ✧",
  );
  document
    .querySelectorAll(
      ".page-intro,.request-panel,.itinerary-column,.assistant-column",
    )
    .forEach((el, i) => setTimeout(() => animate(el), i * 70));
})();
