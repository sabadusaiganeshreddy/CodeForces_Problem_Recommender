
const SPACE = "Sai-ganesh-09/CF_Problem_Recommender"; // handle form
const ENDPOINT = "/recommend";

import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

// ---- DOM ----
const els = {
  run: document.getElementById("run"),
  status: document.getElementById("status"),
  error: document.getElementById("error"),
  profile: document.getElementById("profile"),
  recs: document.getElementById("recs"),
  username: document.getElementById("username"),
  count: document.getElementById("count"),
  topicsWrap: document.getElementById("topics"),
};

// ---- helpers (aligned to your CSS) ----
function setStatus(msg) {
  els.status.textContent = msg || "";
  if (!msg) { els.status.className = "status"; return; }
  const m = msg.toLowerCase();
  els.status.className =
    (m.includes("connecting") || m.includes("analysing") || m.includes("⏳"))
      ? "status loading"
      : (m.includes("ready") || m.includes("✅") || m.includes("done"))
      ? "status success"
      : "status";
}
function setError(err) {
  const msg = typeof err === "string" ? err : (err?.message || String(err));
  els.error.textContent = msg;
  els.error.className = "error-panel show"; // shows the panel
  setStatus("");
}
function clearError() {
  els.error.className = "error-panel"; // hide
  els.error.textContent = "";
}
function show(el, on = true) { el.style.display = on ? "block" : "none"; }
function toggleRun(b) { els.run.disabled = !!b; }
function clampInt(v, min, max, fallback) {
  const n = Math.floor(Number(v));
  return Number.isNaN(n) ? fallback : Math.min(max, Math.max(min, n));
}
function asText(u) {
  if (u == null) return "";
  if (typeof u === "string") return u;
  if (typeof u?.value === "string") return u.value;
  return "";
}
function renderMarkdown(md) {
  if (window.marked?.parse) return window.marked.parse(String(md), { mangle:false, headerIds:false });
  const esc = String(md).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  return esc.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br>");
}

// ---- topics (styled with .checkbox-item to match your CSS) ----
const COMMON_TOPICS = [
  "implementation","math","greedy","dp","data structures",
  "brute force","constructive algorithms","graphs","sortings",
  "binary search","dfs and similar","trees","strings","number theory",
  "combinatorics","two pointers","bitmasks","geometry","shortest paths",
  "divide and conquer","hashing","games","flows","matrices"
];
COMMON_TOPICS.forEach(t => {
  const id = `topic-${t.replace(/\s+/g, "-")}`;
  const div = document.createElement("label");
  div.className = "checkbox-item";
  div.innerHTML = `<input type="checkbox" value="${t}" id="${id}"><span>${t}</span>`;
  els.topicsWrap.appendChild(div);
});

// ---- connect to Space (first-version style) ----
let app;
(async function init(){
  setStatus("Connecting…");
  try {
    app = await Client.connect(SPACE, {
      space_status: (s) => setStatus(`${s.detail ?? s.status}: ${s.message ?? ""}`)
    });
    setStatus("Ready.");
  } catch (err) {
    setError(err);
  }
})();

// ---- action ----
els.run.addEventListener("click", async () => {
  clearError(); setStatus("Analysing…"); toggleRun(true);

  const username = els.username.value.trim();
  const numProblems = clampInt(els.count.value, 1, 15, 5);
  const topics = [...els.topicsWrap.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value);

  if (!username) { setError("Please enter a CodeForces username"); toggleRun(false); return; }

  try {
    const res = await app.predict(ENDPOINT, [username, topics, numProblems]);
    const data = res?.data ?? res; // [input_page, results_page, profile_md, recs_html, error_md]
    const profile = data?.[2], recs = data?.[3], error = data?.[4];

    if (error && (error.visible ?? false) && asText(error)) {
      setError(asText(error));
      show(els.profile,false); show(els.recs,false);
    } else {
      if (profile && (profile.visible ?? true)) {
        const profileHTML = renderMarkdown(asText(profile));
        els.profile.innerHTML = `<div class="card-header">👤 Profile Analysis</div><div style="margin-top:0;">${profileHTML}</div>`;
        show(els.profile,true);
      } else { show(els.profile,false); }

      if (recs && (recs.visible ?? true)) {
        const recsHTML = (typeof recs === "string" ? recs : recs.value || "");
        els.recs.innerHTML = `<div class="card-header">🎯 Recommended Problems</div><div style="margin-top:0;">${recsHTML}</div>`;
        show(els.recs,true);
      } else { show(els.recs,false); }

      setStatus("Done ✅");
    }
  } catch (e) {
    setError(e);
  } finally {
    toggleRun(false);
  }
});

// Enter to submit
els.username.addEventListener("keypress", (e)=>{ if (e.key === "Enter") els.run.click(); });
