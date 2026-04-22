const basePath = "/netdesk";

let currentTicketId = null;
let tickets = {};
let storyMeta = {};

/* ===== 初期ロード ===== */

async function init() {
  const tRes = await fetch("tickets.json");
  tickets = await tRes.json();

  const sRes = await fetch("storyMeta.json");
  storyMeta = await sRes.json();

  router();
}

/* ===== 一覧描画 ===== */

function renderList() {
  const container = document.getElementById("ticketList");
  container.innerHTML = "";

  Object.entries(tickets).forEach(([id, t]) => {
    const div = document.createElement("div");
    div.className = "ticket";

    div.innerHTML = `
      <p class="tag">${t.tag}</p>
      <p class="title">${t.summary}</p>
      <p class="meta">${t.meta}</p>
    `;

    div.onclick = () => openTicket(id);

    container.appendChild(div);
  });
}

/* ===== 画面遷移 ===== */

function openTicket(id) {
  currentTicketId = id;
  history.pushState({}, "", basePath + "/ticket/" + id);
  showDetail(id);
}

function goHome() {
  history.pushState({}, "", basePath + "/");
  showList();
}

function showDetail(id) {
  const t = tickets[id];
  if (!t) return;

  document.getElementById("listView").classList.add("hidden");
  document.getElementById("detailView").classList.remove("hidden");

  document.getElementById("d-title").innerText = t.title.en;
  document.getElementById("d-body").innerText = t.body.en;

  document.getElementById("question").innerText = storyMeta[id].question;
}

function showList() {
  document.getElementById("detailView").classList.add("hidden");
  document.getElementById("listView").classList.remove("hidden");
  renderList();
}

/* ===== Unlock ===== */

async function hash(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function decodeBase64Unicode(str) {
  const binary = atob(str);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

async function unlockStory() {
  const input = document.getElementById("passwordInput").value;
  const meta = storyMeta[currentTicketId];

  const h = await hash(input);

  if (h !== meta.passwordHash) {
    alert("Incorrect password");
    return;
  }

  const res = await fetch(meta.url);
  const encoded = await res.text();

  const decoded = decodeBase64Unicode(encoded);

  displayStory(decoded);
}

function displayStory(text) {
  const container = document.getElementById("storyContainer");

  const html = text
    .split("\n")
    .map(line => `<p>${line}</p>`)
    .join("");

  container.innerHTML = html;
  container.classList.remove("hidden");
}

/* ===== ルーター ===== */

function router() {
  let path = window.location.pathname;

  if (path.startsWith(basePath)) {
    path = path.slice(basePath.length);
  }

  if (path.startsWith("/ticket/")) {
    const id = path.split("/")[2];
    currentTicketId = id;
    showDetail(id);
  } else {
    showList();
  }
}

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("popstate", router);