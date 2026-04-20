const basePath = "/netdesk"; // ← リポジトリ名に合わせて変更

let currentLang = "en";
let currentTicketId = null;

/* ===== データ ===== */

const tickets = {
  1: {
    title: {
      en: "LACP Aggregation Issue",
      jp: "LACP 集約の問題",
      fr: "Problème LACP"
    },
    body: {
      en: "Links are not forming a bundle. Check active/passive modes.",
      jp: "リンクが束ねられていません。active/passive設定を確認してください。",
      fr: "Les liens ne sont pas agrégés."
    }
  },
  2: {
    title: {
      en: "PAT Translation Timeout",
      jp: "PAT セッションタイムアウト",
      fr: "Expiration PAT"
    },
    body: {
      en: "Session disappears after idle time. NAT table entry removed.",
      jp: "通信が止まるとNATテーブルから削除されます。",
      fr: "La session disparaît après inactivité."
    }
  }
};

/* ===== 画面遷移 ===== */

function openTicket(id) {
  currentTicketId = id;

  const url = basePath + "/ticket/" + id;
  history.pushState({ id }, "", url);

  showDetail(id);
}

function goHome() {
  history.pushState({}, "", basePath + "/");
  showList();
}

/* ===== 表示切替 ===== */

function showDetail(id) {
  const t = tickets[id];
  if (!t) return;

  document.getElementById("listView").classList.add("hidden");
  document.getElementById("detailView").classList.remove("hidden");

  render(t);
}

function showList() {
  document.getElementById("detailView").classList.add("hidden");
  document.getElementById("listView").classList.remove("hidden");
}

/* ===== 描画 ===== */

function render(t) {
  document.getElementById("d-title").innerText = t.title[currentLang];
  document.getElementById("d-body").innerText = t.body[currentLang];
}

/* ===== 言語切替 ===== */

function setLang(lang) {
  currentLang = lang;

  if (currentTicketId && tickets[currentTicketId]) {
    render(tickets[currentTicketId]);
  }
}

/* ===== ルーター（URL解釈） ===== */

function router() {
  let path = window.location.pathname;

  // GitHub Pagesのサブパスを除去
  if (path.startsWith(basePath)) {
    path = path.slice(basePath.length);
  }

  // 空ならトップ
  if (path === "" || path === "/") {
    showList();
    return;
  }

  // /ticket/1 の形式
  if (path.startsWith("/ticket/")) {
    const parts = path.split("/");
    const id = parts[2];

    if (tickets[id]) {
      currentTicketId = id;
      showDetail(id);
      return;
    }
  }

  // 不正URLはトップへ
  showList();
}

/* ===== 戻る・進む対応 ===== */

window.addEventListener("popstate", () => {
  router();
});

/* ===== 初期化 ===== */

window.addEventListener("DOMContentLoaded", () => {
  router();
});