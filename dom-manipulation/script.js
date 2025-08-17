/***** DOM refs *****/
let newQuoteText = document.getElementById("newQuoteText");
let newQuoteCategory = document.getElementById("newQuoteCategory");
let quoteDisplay = document.getElementById("quoteDisplay");
let newQuote = document.getElementById("newQuote");
let categoryFilter = document.getElementById("categoryFilter");

/***** Globals *****/
let quotes = []; // الحالة الحالية بالصفحة (مرآة للـ localStorage)
const LS_KEY = "quotes";
const SERVER_GET = "https://jsonplaceholder.typicode.com/posts";
const SERVER_POST = "https://jsonplaceholder.typicode.com/posts";
let pendingConflicts = []; // لتجميع التعارضات لعرضها وحلّها

/***** Helpers: Local Storage *****/
function getFromLocalStorage() {
  return JSON.parse(localStorage.getItem(LS_KEY)) || [];
}
function saveToLocalStorage(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
  quotes = arr.slice(); // حافظ على الحالة داخل السكربت
}

/***** UI: إشعار ونافذة تعارضات *****/
function ensureUiShell() {
  // شريط الإشعارات
  if (!document.getElementById("syncBanner")) {
    const bar = document.createElement("div");
    bar.id = "syncBanner";
    bar.style.cssText =
      "position:sticky;top:0;left:0;right:0;background:#fff3cd;color:#664d03;border:1px solid #ffecb5;padding:8px 12px;font-family:Arial;font-size:14px;display:none;z-index:999;";
    document.body.prepend(bar);
  }
  // قائمة التعارضات
  if (!document.getElementById("conflictPanel")) {
    const panel = document.createElement("div");
    panel.id = "conflictPanel";
    panel.style.cssText =
      "max-width:720px;margin:10px auto;padding:10px;border:1px solid #eee;background:#fafafa;display:none;border-radius:6px;font-family:Arial;";
    const h = document.createElement("h3");
    h.textContent = "Conflicts";
    h.style.margin = "0 0 10px";
    const list = document.createElement("div");
    list.id = "conflictList";
    const close = document.createElement("button");
    close.textContent = "Close";
    close.style.cssText =
      "margin-top:10px;padding:6px 10px;border:0;border-radius:4px;background:#6c757d;color:#fff;cursor:pointer;";
    close.onclick = () => (panel.style.display = "none");
    panel.append(h, list, close);
    document.body.appendChild(panel);
  }
}
function showBanner(msg) {
  const bar = document.getElementById("syncBanner");
  if (!bar) return;
  bar.textContent = msg;
  bar.style.display = "block";
  // إخفاء تلقائي بعد 3 ثواني (لو مفيش تعارضات)
  if (!/conflict/i.test(msg)) {
    setTimeout(() => (bar.style.display = "none"), 3000);
  }
}
function showConflictsUi() {
  const panel = document.getElementById("conflictPanel");
  const list = document.getElementById("conflictList");
  if (!panel || !list) return;

  list.innerHTML = "";
  if (pendingConflicts.length === 0) {
    list.textContent = "No conflicts.";
  } else {
    pendingConflicts.forEach((c, i) => {
      const box = document.createElement("div");
      box.style.cssText =
        "border:1px solid #ddd;background:#fff;padding:8px;border-radius:6px;margin-bottom:8px;";

      const localP = document.createElement("p");
      localP.innerHTML =
        `<strong>Local:</strong> ${c.local.text} <em>[${c.local.category}]</em>`;

      const serverP = document.createElement("p");
      serverP.innerHTML =
        `<strong>Server:</strong> ${c.server.text} <em>[${c.server.category}]</em>`;

      const btnKeepServer = document.createElement("button");
      btnKeepServer.textContent = "Keep Server";
      btnKeepServer.style.cssText =
        "margin-right:8px;padding:6px 10px;border:0;border-radius:4px;background:#0d6efd;color:#fff;cursor:pointer;";

      const btnKeepLocal = document.createElement("button");
      btnKeepLocal.textContent = "Keep Local";
      btnKeepLocal.style.cssText =
        "padding:6px 10px;border:0;border-radius:4px;background:#198754;color:#fff;cursor:pointer;";

      btnKeepServer.onclick = () => resolveConflict(i, "server");
      btnKeepLocal.onclick = () => resolveConflict(i, "local");

      box.append(localP, serverP, btnKeepServer, btnKeepLocal);
      list.appendChild(box);
    });
  }
  panel.style.display = "block";
}

function resolveConflict(index, winner) {
  const c = pendingConflicts[index];
  if (!c) return;

  const all = getFromLocalStorage();
  const idx = all.findIndex((q) => q.serverId === c.server.serverId);

  if (idx !== -1) {
    if (winner === "server") {
      all[idx] = {
        ...all[idx],
        text: c.server.text,
        category: c.server.category,
        updatedAt: Date.now(),
        source: "server",
      };
    } else {
      // local wins: نحدث السرفر بشكل صوري
      all[idx] = {
        ...all[idx],
        text: c.local.text,
        category: c.local.category,
        updatedAt: Date.now(),
      };
      // نحاول نرسل PATCH للسيرفر الوهمي (اختياري)
      patchQuoteToServer(all[idx]).catch(() => {});
    }
    saveToLocalStorage(all);
    renderQuotes();
    populateCategories(true);
  }

  pendingConflicts.splice(index, 1);
  showConflictsUi();
  if (pendingConflicts.length === 0) {
    showBanner("Conflicts resolved.");
  }
}

/***** Render & Basic Actions *****/
function renderQuotes() {
  quotes = getFromLocalStorage();
  quoteDisplay.innerHTML = "";

  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<li>No quotes available.</li>";
    return;
  }

  quotes.forEach((quote, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<div><strong>Quote:</strong> ${quote.text}<br><strong>Category:</strong> ${quote.category}</div>`;
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.classList.add("delete-button");
    del.onclick = () => {
      const all = getFromLocalStorage();
      all.splice(index, 1);
      saveToLocalStorage(all);
      renderQuotes();
      populateCategories(true);
    };
    li.appendChild(del);
    quoteDisplay.appendChild(li);
  });
}

function showRandomQuote() {
  const arr = getFromLocalStorage();
  if (arr.length === 0) {
    alert("No quotes available.");
    return;
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  const randomQuote = arr[randomIndex];
  quoteDisplay.innerHTML = "";
  const li = document.createElement("li");
  li.innerHTML = `<div><strong>Quote:</strong> ${randomQuote.text}<br><strong>Category:</strong> ${randomQuote.category}</div>`;
  quoteDisplay.appendChild(li);
}
if (newQuote) newQuote.addEventListener("click", showRandomQuote);

/***** Import / Export *****/
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const imported = JSON.parse(e.target.result);
    const all = getFromLocalStorage();
    // ضم بدون تكرار (نفس النص) كأبسط شكل
    const merged = [...all];
    imported.forEach((q) => {
      if (!merged.some((x) => x.text === q.text && x.category === q.category)) {
        merged.push({
          id: q.id || "local-" + Date.now() + "-" + Math.random().toString(16).slice(2),
          text: q.text,
          category: q.category || "general",
          updatedAt: Date.now(),
          source: q.source || "local",
          serverId: q.serverId || null,
        });
      }
    });
    saveToLocalStorage(merged);
    renderQuotes();
    populateCategories(true);
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(getFromLocalStorage(), null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

/***** Add Quote *****/
function createAddQuoteForm() {
  const text = newQuoteText?.value.trim();
  const category = newQuoteCategory?.value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQ = {
    id: "local-" + Date.now() + "-" + Math.random().toString(16).slice(2),
    text,
    category,
    updatedAt: Date.now(),
    source: "local",
    serverId: null, // هيتملأ بعد الـ POST
  };

  const all = getFromLocalStorage();
  all.push(newQ);
  saveToLocalStorage(all);
  renderQuotes();
  populateCategories(true);

  if (newQuoteText) newQuoteText.value = "";
  if (newQuoteCategory) newQuoteCategory.value = "";

  // POST للسيرفر الوهمي
  postQuoteToServer(newQ).catch(() => {});
}

/***** Filter by category *****/
function populateCategories(reset = false) {
  if (!categoryFilter) return;
  if (reset) {
    // امسح القديم وسيب الـ option الأول لو عندك "All"
    const keepFirst = categoryFilter.querySelector("option");
    categoryFilter.innerHTML = "";
    if (keepFirst) categoryFilter.appendChild(keepFirst);
  }
  const all = getFromLocalStorage();
  const cats = [...new Set(all.map((q) => q.category))];
  cats.forEach((c) => {
    if ([...categoryFilter.options].some((o) => o.value === c)) return;
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categoryFilter.appendChild(opt);
  });
}
function filterQuotes(e) {
  const value = e.target.value;
  const all = getFromLocalStorage();
  const list = value ? all.filter((q) => q.category === value) : all;

  quoteDisplay.innerHTML = "";
  if (list.length === 0) {
    quoteDisplay.innerHTML = "<li>No quotes for this category.</li>";
    return;
  }
  list.forEach((quote, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<div><strong>Quote:</strong> ${quote.text}<br><strong>Category:</strong> ${quote.category}</div>`;
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.classList.add("delete-button");
    del.onclick = () => {
      const all2 = getFromLocalStorage().filter((q) => !(q.text === quote.text && q.category === quote.category));
      saveToLocalStorage(all2);
      filterQuotes({ target: { value } });
    };
    li.appendChild(del);
    quoteDisplay.appendChild(li);
  });
}

/***** Server I/O (Mock) *****/
// المزامنة الدورية + حل التعارضات (Server wins افتراضيًا)
async function syncQuotes() {
  ensureUiShell();
  try {
    const res = await fetch(SERVER_GET);
    const posts = await res.json();

    // نحول بوستات السيرفر لكوتس شكلها موحد
    const serverQuotes = posts.slice(0, 10).map((p) => ({
      id: "server-" + p.id, // معرف داخلي لنا
      serverId: p.id,       // معرف السيرفر الحقيقي
      text: p.title,
      // تصنيف تجريبي للتنوع
      category: ["general", "motivation", "math"][p.id % 3],
      updatedAt: Date.now(),
      source: "server",
    }));

    // دمج مع اللوكال + رصد التعارض
    const local = getFromLocalStorage();
    let merges = 0;
    pendingConflicts = [];

    serverQuotes.forEach((s) => {
      const i = local.findIndex((q) => q.serverId === s.serverId);
      if (i === -1) {
        // جديد من السيرفر
        local.push(s);
        merges++;
      } else {
        const l = local[i];
        // لو المحتوى مختلف = تعارض
        if (l.text !== s.text || l.category !== s.category) {
          // سياسة افتراضية: السيرفر يكسب
          const serverWins = true;
          if (serverWins) {
            local[i] = { ...l, text: s.text, category: s.category, updatedAt: Date.now(), source: "server" };
          }
          // وفي نفس الوقت نضيف التعارض لقائمة يدوية
          pendingConflicts.push({ local: { ...l }, server: { ...s } });
        }
      }
    });

    saveToLocalStorage(local);
    renderQuotes();
    populateCategories(true);

    if (pendingConflicts.length > 0) {
      showBanner(`Sync done. ${merges} merged. ${pendingConflicts.length} conflict(s) (server won by default).`);
      showConflictsUi(); // افتح لوحة التعارضات لاختيار يدوي
    } else {
      showBanner(`Sync done. ${merges} merged. No conflicts.`);
    }
  } catch (err) {
    console.error("Sync error:", err);
    showBanner("Sync failed. Check console.");
  }
}

// POST: إرسال كوت جديد (محاكاة)
async function postQuoteToServer(quote) {
  const res = await fetch(SERVER_POST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: quote.text,
      body: quote.category,
      userId: 1,
    }),
  });
  const data = await res.json();
  // نحفظ الـ serverId اللي رجع
  const all = getFromLocalStorage();
  const idx = all.findIndex((q) => q.id === quote.id);
  if (idx !== -1) {
    all[idx].serverId = data.id;
    all[idx].source = "local";
    saveToLocalStorage(all);
  }
}

// PATCH: تحديث سيرفر (محاكاة) عند اختيار "Keep Local"
async function patchQuoteToServer(quote) {
  if (!quote.serverId) return;
  await fetch(`${SERVER_POST}/${quote.serverId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: quote.text,
      body: quote.category,
    }),
  });
}

/***** Boot *****/
ensureUiShell();
renderQuotes();
populateCategories(true);
// مزامنة أولية ثم دورية
syncQuotes();
setInterval(syncQuotes, 10000);

// لو عندك select للفلترة اربطه
if (categoryFilter) {
  categoryFilter.onchange = filterQuotes;
}
