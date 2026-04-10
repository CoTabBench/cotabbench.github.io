/**
 * CoTabBench Leaderboard — Vanilla JS
 *
 * Table td indices:  0:Rank  1:Model  2:Type  3:Overall  4:Counting  5:TableQA  6:Hall.Detect
 * Score data lives on <tr> as data-* attributes:
 *   data-ovr-avg / data-ovr-e / data-ovr-h
 *   data-cnt-avg / data-cnt-e / data-cnt-h
 *   data-qa-avg  / data-qa-e  / data-qa-h
 *   data-hall-avg/ data-hall-e/ data-hall-h
 */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* State                                                                */
  /* ------------------------------------------------------------------ */
  var sortCol   = 3;       // Overall col index
  var sortDir   = "desc";
  var filter    = "all";   // "all" | "llm" | "mllm" | "finetuned"
  var diff      = "avg";   // "avg" | "easy" | "hard"

  /* ------------------------------------------------------------------ */
  /* DOM references                                                       */
  /* ------------------------------------------------------------------ */
  var tbody = document.getElementById("lbBody");
  if (!tbody) return;

  var allRows = Array.from(tbody.querySelectorAll("tr[data-type]"));
  if (!allRows.length) return;

  var SCORE_COLS = [
    { idx: 3, key: "ovr"  },
    { idx: 4, key: "cnt"  },
    { idx: 5, key: "qa"   },
    { idx: 6, key: "hall" },
  ];

  /* ------------------------------------------------------------------ */
  /* Core render — always runs all three steps in order                  */
  /* ------------------------------------------------------------------ */
  function render() {
    // 1. Determine visibility for each row
    allRows.forEach(function (row) {
      var type = row.getAttribute("data-type") || "";
      var show;
      switch (filter) {
        case "llm":       show = type === "closed-llm"  || type === "open-llm";  break;
        case "mllm":      show = type === "closed-mllm" || type === "open-mllm"; break;
        case "finetuned": show = type === "finetuned";                           break;
        default:          show = true;
      }
      row.style.display = show ? "" : "none";
    });

    // 2. Update score cells to reflect current difficulty
    var sfx = diff === "easy" ? "e" : diff === "hard" ? "h" : "avg";
    allRows.forEach(function (row) {
      var cells = row.querySelectorAll("td");
      SCORE_COLS.forEach(function (col) {
        var td = cells[col.idx];
        if (!td) return;
        var val = row.getAttribute("data-" + col.key + "-" + sfx) || "—";
        td.setAttribute("data-value", val);
        td.textContent = val;
      });
    });

    // 3. Sort visible rows (move hidden rows to bottom without showing them)
    var visible = allRows.filter(function (r) { return r.style.display !== "none"; });
    var hidden  = allRows.filter(function (r) { return r.style.display === "none"; });

    visible.sort(function (a, b) {
      var va = getVal(a, sortCol);
      var vb = getVal(b, sortCol);
      var na = parseFloat(va), nb = parseFloat(vb);
      if (!isNaN(na) && !isNaN(nb)) return sortDir === "asc" ? na - nb : nb - na;
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

    visible.concat(hidden).forEach(function (row) { tbody.appendChild(row); });

    // 4. Assign ranks to visible rows in order
    visible.forEach(function (row, i) {
      var cell = row.querySelector(".rank-cell");
      if (!cell) return;
      var n = i + 1;
      if      (n === 1) cell.innerHTML = "<span class='rank-medal rank-medal--1'>1</span>";
      else if (n === 2) cell.innerHTML = "<span class='rank-medal rank-medal--2'>2</span>";
      else if (n === 3) cell.innerHTML = "<span class='rank-medal rank-medal--3'>3</span>";
      else              cell.innerHTML = "<span class='rank-medal rank-medal--n'>" + n + "</span>";
    });

    // 5. Update count badge
    var el = document.getElementById("lbCount");
    if (el) el.textContent = "Showing " + visible.length + " of " + allRows.length + " models";
  }

  function getVal(row, colIndex) {
    var cells = row.querySelectorAll("td");
    if (!cells[colIndex]) return "";
    var raw = cells[colIndex].getAttribute("data-value");
    return raw !== null ? raw : cells[colIndex].textContent.trim();
  }

  /* ------------------------------------------------------------------ */
  /* Column header sort                                                   */
  /* ------------------------------------------------------------------ */
  var headers = document.querySelectorAll(".lb-table th[data-col]");

  headers.forEach(function (th) {
    th.addEventListener("click", function () {
      var col = parseInt(th.getAttribute("data-col"), 10);
      sortDir = (sortCol === col && sortDir === "desc") ? "asc" : "desc";
      sortCol = col;
      headers.forEach(function (h) { h.classList.remove("sort-asc", "sort-desc"); });
      th.classList.add(sortDir === "asc" ? "sort-asc" : "sort-desc");
      render();
    });
  });

  /* ------------------------------------------------------------------ */
  /* Type filter buttons                                                  */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll(".filter-btn[data-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".filter-btn[data-filter]").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      filter = btn.getAttribute("data-filter");
      render();
    });
  });

  /* ------------------------------------------------------------------ */
  /* Difficulty buttons                                                   */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll(".diff-btn[data-diff]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".diff-btn[data-diff]").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      diff = btn.getAttribute("data-diff");
      render();
    });
  });

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */
  var defaultTh = document.querySelector(".lb-table th[data-col='" + sortCol + "']");
  if (defaultTh) defaultTh.classList.add("sort-desc");

  render();
});
