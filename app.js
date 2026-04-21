(() => {
  "use strict";

  /** @typedef {{ id: string, label: string, timeZone: string }} City */
  /** @typedef {{ cities: City[], hour12: boolean }} AppState */

  const STORAGE_KEY_V1 = "world-time-web:v1";
  const STORAGE_KEY_V2 = "world-time-web:v2";

  /** @type {City[]} */
  const PRESET = [
    { id: "beijing", label: "北京", timeZone: "Asia/Shanghai" },
    { id: "hongkong", label: "香港", timeZone: "Asia/Hong_Kong" },
    { id: "taipei", label: "台北", timeZone: "Asia/Taipei" },
    { id: "tokyo", label: "东京", timeZone: "Asia/Tokyo" },
    { id: "seoul", label: "首尔", timeZone: "Asia/Seoul" },
    { id: "singapore", label: "新加坡", timeZone: "Asia/Singapore" },
    { id: "dubai", label: "迪拜", timeZone: "Asia/Dubai" },
    { id: "delhi", label: "新德里", timeZone: "Asia/Kolkata" },
    { id: "moscow", label: "莫斯科", timeZone: "Europe/Moscow" },
    { id: "istanbul", label: "伊斯坦布尔", timeZone: "Europe/Istanbul" },
    { id: "paris", label: "巴黎", timeZone: "Europe/Paris" },
    { id: "berlin", label: "柏林", timeZone: "Europe/Berlin" },
    { id: "london", label: "伦敦", timeZone: "Europe/London" },
    { id: "madrid", label: "马德里", timeZone: "Europe/Madrid" },
    { id: "cairo", label: "开罗", timeZone: "Africa/Cairo" },
    { id: "newyork", label: "纽约", timeZone: "America/New_York" },
    { id: "chicago", label: "芝加哥", timeZone: "America/Chicago" },
    { id: "denver", label: "丹佛", timeZone: "America/Denver" },
    { id: "losangeles", label: "洛杉矶", timeZone: "America/Los_Angeles" },
    { id: "toronto", label: "多伦多", timeZone: "America/Toronto" },
    { id: "mexico", label: "墨西哥城", timeZone: "America/Mexico_City" },
    { id: "saopaulo", label: "圣保罗", timeZone: "America/Sao_Paulo" },
    { id: "buenosaires", label: "布宜诺斯艾利斯", timeZone: "America/Argentina/Buenos_Aires" },
    { id: "sydney", label: "悉尼", timeZone: "Australia/Sydney" },
    { id: "auckland", label: "奥克兰", timeZone: "Pacific/Auckland" },
    { id: "utc", label: "UTC", timeZone: "UTC" },
  ];

  /** 供下拉框选择的常见时区 */
  const TIMEZONE_OPTIONS = [
    { label: "北京（上海）", timeZone: "Asia/Shanghai" },
    { label: "乌鲁木齐", timeZone: "Asia/Urumqi" },
    { label: "香港", timeZone: "Asia/Hong_Kong" },
    { label: "澳门", timeZone: "Asia/Macau" },
    { label: "台北", timeZone: "Asia/Taipei" },
    { label: "新加坡", timeZone: "Asia/Singapore" },
    { label: "吉隆坡", timeZone: "Asia/Kuala_Lumpur" },
    { label: "曼谷", timeZone: "Asia/Bangkok" },
    { label: "雅加达", timeZone: "Asia/Jakarta" },
    { label: "马尼拉", timeZone: "Asia/Manila" },
    { label: "胡志明市", timeZone: "Asia/Ho_Chi_Minh" },
    { label: "首尔", timeZone: "Asia/Seoul" },
    { label: "东京", timeZone: "Asia/Tokyo" },
    { label: "大阪", timeZone: "Asia/Tokyo" },
    { label: "悉尼", timeZone: "Australia/Sydney" },
    { label: "墨尔本", timeZone: "Australia/Melbourne" },
    { label: "珀斯", timeZone: "Australia/Perth" },
    { label: "奥克兰", timeZone: "Pacific/Auckland" },
    { label: "迪拜", timeZone: "Asia/Dubai" },
    { label: "特拉维夫", timeZone: "Asia/Jerusalem" },
    { label: "新德里", timeZone: "Asia/Kolkata" },
    { label: "莫斯科", timeZone: "Europe/Moscow" },
    { label: "伊斯坦布尔", timeZone: "Europe/Istanbul" },
    { label: "雅典", timeZone: "Europe/Athens" },
    { label: "柏林", timeZone: "Europe/Berlin" },
    { label: "巴黎", timeZone: "Europe/Paris" },
    { label: "阿姆斯特丹", timeZone: "Europe/Amsterdam" },
    { label: "苏黎世", timeZone: "Europe/Zurich" },
    { label: "罗马", timeZone: "Europe/Rome" },
    { label: "马德里", timeZone: "Europe/Madrid" },
    { label: "伦敦", timeZone: "Europe/London" },
    { label: "都柏林", timeZone: "Europe/Dublin" },
    { label: "里斯本", timeZone: "Europe/Lisbon" },
    { label: "开罗", timeZone: "Africa/Cairo" },
    { label: "约翰内斯堡", timeZone: "Africa/Johannesburg" },
    { label: "纽约", timeZone: "America/New_York" },
    { label: "华盛顿", timeZone: "America/New_York" },
    { label: "迈阿密", timeZone: "America/New_York" },
    { label: "芝加哥", timeZone: "America/Chicago" },
    { label: "休斯顿", timeZone: "America/Chicago" },
    { label: "丹佛", timeZone: "America/Denver" },
    { label: "凤凰城", timeZone: "America/Phoenix" },
    { label: "洛杉矶", timeZone: "America/Los_Angeles" },
    { label: "旧金山", timeZone: "America/Los_Angeles" },
    { label: "西雅图", timeZone: "America/Los_Angeles" },
    { label: "温哥华", timeZone: "America/Vancouver" },
    { label: "多伦多", timeZone: "America/Toronto" },
    { label: "蒙特利尔", timeZone: "America/Toronto" },
    { label: "墨西哥城", timeZone: "America/Mexico_City" },
    { label: "圣保罗", timeZone: "America/Sao_Paulo" },
    { label: "里约热内卢", timeZone: "America/Sao_Paulo" },
    { label: "布宜诺斯艾利斯", timeZone: "America/Argentina/Buenos_Aires" },
    { label: "圣地亚哥（智利）", timeZone: "America/Santiago" },
    { label: "UTC", timeZone: "UTC" },
  ];

  const els = {
    grid: /** @type {HTMLDivElement} */ (document.getElementById("grid")),
    tzSelect: /** @type {HTMLSelectElement} */ (document.getElementById("tz-select")),
    addBtn: /** @type {HTMLButtonElement} */ (document.getElementById("add-btn")),
    resetBtn: /** @type {HTMLButtonElement} */ (document.getElementById("reset-btn")),
    localHint: /** @type {HTMLParagraphElement} */ (document.getElementById("local-hint")),
    hour12: /** @type {HTMLInputElement} */ (document.getElementById("hour12")),
    customTz: /** @type {HTMLInputElement} */ (document.getElementById("custom-tz")),
    addCustomBtn: /** @type {HTMLButtonElement} */ (document.getElementById("add-custom-btn")),
    customTzMsg: /** @type {HTMLParagraphElement} */ (document.getElementById("custom-tz-msg")),
  };

  /** @param {unknown} raw */
  function cleanCities(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((x) => x && typeof x === "object")
      .map((x) => ({
        id: String(/** @type {{id?:unknown}} */ (x).id || ""),
        label: String(/** @type {{label?:unknown}} */ (x).label || ""),
        timeZone: String(/** @type {{timeZone?:unknown}} */ (x).timeZone || ""),
      }))
      .filter((x) => x.id && x.label && x.timeZone);
  }

  /** @returns {AppState} */
  function loadState() {
    try {
      const v2raw = localStorage.getItem(STORAGE_KEY_V2);
      if (v2raw) {
        const o = JSON.parse(v2raw);
        if (o && typeof o === "object" && Array.isArray(o.cities)) {
          const cities = cleanCities(o.cities);
          return {
            cities: cities.length ? cities : [...PRESET],
            hour12: Boolean(/** @type {{hour12?:unknown}} */ (o).hour12),
          };
        }
      }

      const v1raw = localStorage.getItem(STORAGE_KEY_V1);
      if (v1raw) {
        const parsed = JSON.parse(v1raw);
        const cities = cleanCities(parsed);
        const next = { cities: cities.length ? cities : [...PRESET], hour12: false };
        saveState(next);
        localStorage.removeItem(STORAGE_KEY_V1);
        return next;
      }
    } catch {
      // ignore
    }
    return { cities: [...PRESET], hour12: false };
  }

  /** @param {AppState} state */
  function saveState(state) {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
  }

  /** @param {string} timeZone */
  function isTimeZoneSupported(timeZone) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
      return true;
    } catch {
      return false;
    }
  }

  /** @param {Date} now @param {string} timeZone */
  function offsetLabel(now, timeZone) {
    try {
      const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "shortOffset",
      });
      const parts = fmt.formatToParts(now);
      const name = parts.find((p) => p.type === "timeZoneName")?.value;
      return name || "";
    } catch {
      return "";
    }
  }

  /** @param {string} timeZone */
  function labelForZone(timeZone) {
    const hit = TIMEZONE_OPTIONS.find((x) => x.timeZone === timeZone);
    if (hit) return hit.label;
    const last = timeZone.split("/").pop() || timeZone;
    return last.replace(/_/g, " ");
  }

  /** @param {string} raw */
  function normalizeCustomZone(raw) {
    return raw.trim().replace(/\s+/g, "");
  }

  /** @param {City[]} cities @param {number} fromIndex @param {number} toIndex */
  function reorderCities(cities, fromIndex, toIndex) {
    if (fromIndex === toIndex) return cities.slice();
    const next = cities.slice();
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  }

  function clearCardDragOver() {
    for (const el of els.grid.querySelectorAll(".card.drag-over")) {
      el.classList.remove("drag-over");
    }
  }

  /** @param {City[]} cities @param {boolean} hour12 */
  function render(cities, hour12) {
    els.grid.innerHTML = "";

    for (const city of cities) {
      const supported = isTimeZoneSupported(city.timeZone);
      const article = document.createElement("article");
      article.className = "card";
      article.setAttribute("role", "listitem");
      article.dataset.id = city.id;

      const top = document.createElement("div");
      top.className = "card-top";

      const handle = document.createElement("span");
      handle.className = "drag-handle";
      handle.setAttribute("aria-label", "拖动排序");
      handle.title = "拖动排序";
      handle.draggable = true;

      const left = document.createElement("div");
      left.className = "card-main";
      const h3 = document.createElement("h3");
      h3.className = "city";
      h3.textContent = city.label;
      const sub = document.createElement("p");
      sub.className = "tz";
      sub.textContent = city.timeZone;
      left.appendChild(h3);
      left.appendChild(sub);

      const actions = document.createElement("div");
      actions.className = "card-actions";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "icon-btn";
      remove.setAttribute("aria-label", `移除 ${city.label}`);
      remove.title = "移除";
      remove.textContent = "✕";
      remove.addEventListener("click", () => {
        const st = loadState();
        const next = st.cities.filter((c) => c.id !== city.id);
        saveState({ ...st, cities: next });
        render(next, hour12);
      });
      actions.appendChild(remove);

      top.appendChild(handle);
      top.appendChild(left);
      top.appendChild(actions);

      handle.addEventListener("dragstart", (e) => {
        const dt = e.dataTransfer;
        if (dt) {
          dt.setData("text/plain", city.id);
          dt.effectAllowed = "move";
          try {
            dt.setDragImage(article, 24, 24);
          } catch {
            // 部分环境可能不支持自定义拖影
          }
        }
        article.classList.add("is-dragging");
      });

      handle.addEventListener("dragend", () => {
        article.classList.remove("is-dragging");
        clearCardDragOver();
      });

      article.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        for (const el of els.grid.querySelectorAll(".card.drag-over")) {
          if (el !== article) el.classList.remove("drag-over");
        }
        article.classList.add("drag-over");
      });

      article.addEventListener("dragleave", (e) => {
        const rel = /** @type {Node | null} */ (e.relatedTarget);
        if (rel && article.contains(rel)) return;
        article.classList.remove("drag-over");
      });

      article.addEventListener("drop", (e) => {
        e.preventDefault();
        article.classList.remove("drag-over");
        const draggedId = e.dataTransfer?.getData("text/plain");
        if (!draggedId) return;
        const st = loadState();
        const from = st.cities.findIndex((c) => c.id === draggedId);
        const to = st.cities.findIndex((c) => c.id === city.id);
        if (from < 0 || to < 0 || from === to) return;
        const next = reorderCities(st.cities, from, to);
        saveState({ ...st, cities: next });
        render(next, hour12);
      });

      const timeEl = document.createElement("div");
      timeEl.className = "time";
      timeEl.dataset.role = "time";

      const dateEl = document.createElement("p");
      dateEl.className = "date";
      dateEl.dataset.role = "date";

      const meta = document.createElement("div");
      meta.className = "meta";
      const pill = document.createElement("div");
      pill.className = "pill";
      const dot = document.createElement("span");
      dot.className = "dot";
      const span = document.createElement("span");
      span.dataset.role = "offset";
      pill.appendChild(dot);
      pill.appendChild(span);

      meta.appendChild(pill);

      article.appendChild(top);
      article.appendChild(timeEl);
      article.appendChild(dateEl);
      article.appendChild(meta);

      if (!supported) {
        const err = document.createElement("p");
        err.className = "err";
        err.textContent = "你的浏览器或系统不支持该时区名称，请尝试更换为相近城市时区。";
        article.appendChild(err);
      }

      els.grid.appendChild(article);
    }

    updateTimes(cities, hour12);
  }

  /** @param {City[]} cities @param {boolean} hour12 */
  function updateTimes(cities, hour12) {
    const now = new Date();
    const cards = Array.from(els.grid.querySelectorAll(".card"));

    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      const card = cards[i];
      if (!card) continue;

      const timeEl = card.querySelector('[data-role="time"]');
      const dateEl = card.querySelector('[data-role="date"]');
      const offEl = card.querySelector('[data-role="offset"]');
      if (!timeEl || !dateEl || !offEl) continue;

      if (!isTimeZoneSupported(city.timeZone)) {
        timeEl.textContent = "—";
        dateEl.textContent = "";
        offEl.textContent = "不支持";
        continue;
      }

      const timeFmt = new Intl.DateTimeFormat("zh-CN", {
        timeZone: city.timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12,
      });

      const dateFmt = new Intl.DateTimeFormat("zh-CN", {
        timeZone: city.timeZone,
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });

      timeEl.textContent = timeFmt.format(now);
      dateEl.textContent = dateFmt.format(now);
      offEl.textContent = offsetLabel(now, city.timeZone) || "时区";
    }
  }

  function fillSelect() {
    els.tzSelect.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (const opt of TIMEZONE_OPTIONS) {
      const o = document.createElement("option");
      o.value = opt.timeZone;
      o.textContent = `${opt.label} · ${opt.timeZone}`;
      frag.appendChild(o);
    }
    els.tzSelect.appendChild(frag);
  }

  function updateLocalHint() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "未知";
    els.localHint.textContent = `你本机的时区：${tz}`;
  }

  function uid() {
    return `c_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  function setCustomMsg(text) {
    els.customTzMsg.textContent = text || "";
  }

  /** 标题下方的本机模拟时钟（指针 + 数字时间） */
  function startHeroAnalogClock() {
    const hourEl = document.getElementById("clock-hand-hour");
    const minuteEl = document.getElementById("clock-hand-minute");
    const secondEl = document.getElementById("clock-hand-second");
    const digitalEl = document.getElementById("hero-clock-digital");
    if (!hourEl || !minuteEl || !secondEl || !digitalEl) return;

    function tick() {
      const now = new Date();
      const ms = now.getMilliseconds();
      const s = now.getSeconds();
      const m = now.getMinutes();
      const h = now.getHours();

      const secDeg = (s + ms / 1000) * 6;
      const minDeg = (m + s / 60 + ms / 60000) * 6;
      const hourDeg = ((h % 12) + m / 60 + s / 3600 + ms / 3600000) * 30;

      hourEl.style.transform = `rotate(${hourDeg}deg)`;
      minuteEl.style.transform = `rotate(${minDeg}deg)`;
      secondEl.style.transform = `rotate(${secDeg}deg)`;

      const hour12 = els.hour12.checked;
      digitalEl.textContent = new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12,
      }).format(now);
      if (digitalEl instanceof HTMLTimeElement) {
        digitalEl.dateTime = now.toISOString();
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function init() {
    fillSelect();
    updateLocalHint();

    const st = loadState();
    els.hour12.checked = st.hour12;
    render(st.cities, st.hour12);

    window.setInterval(() => {
      const s = loadState();
      updateTimes(s.cities, s.hour12);
    }, 1000);

    startHeroAnalogClock();

    els.hour12.addEventListener("change", () => {
      const s = loadState();
      const next = { ...s, hour12: els.hour12.checked };
      saveState(next);
      updateTimes(next.cities, next.hour12);
    });

    els.addBtn.addEventListener("click", () => {
      const timeZone = els.tzSelect.value;
      const label = labelForZone(timeZone);
      const s = loadState();
      if (s.cities.some((c) => c.timeZone === timeZone)) return;
      const nextCities = s.cities.concat({ id: uid(), label, timeZone });
      saveState({ ...s, cities: nextCities });
      render(nextCities, s.hour12);
    });

    function tryAddCustom() {
      const raw = els.customTz.value;
      const timeZone = normalizeCustomZone(raw);
      setCustomMsg("");
      if (!timeZone) {
        setCustomMsg("请先输入时区名称。");
        return;
      }
      if (!isTimeZoneSupported(timeZone)) {
        setCustomMsg("无法识别该时区，请检查拼写是否为有效的 IANA 名称。");
        return;
      }
      const s = loadState();
      if (s.cities.some((c) => c.timeZone === timeZone)) {
        setCustomMsg("列表里已经有这个时区了。");
        return;
      }
      const label = labelForZone(timeZone);
      const nextCities = s.cities.concat({ id: uid(), label, timeZone });
      saveState({ ...s, cities: nextCities });
      els.customTz.value = "";
      render(nextCities, s.hour12);
    }

    els.addCustomBtn.addEventListener("click", tryAddCustom);
    els.customTz.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        tryAddCustom();
      }
    });

    els.resetBtn.addEventListener("click", () => {
      const s = loadState();
      const next = { cities: [...PRESET], hour12: s.hour12 };
      saveState(next);
      els.hour12.checked = next.hour12;
      render(next.cities, next.hour12);
    });
  }

  init();
})();
