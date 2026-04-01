/**
 * CoTabBench Leaderboard — Vanilla JS
 * Handles column sorting and open/closed source filtering.
 */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* State                                                                */
  /* ------------------------------------------------------------------ */
  var currentSort  = { col: 1, dir: "desc" }; // default: Overall score desc
  var currentFilter = "all"; // "all" | "open" | "closed"

  /* ------------------------------------------------------------------ */
  /* Data                                                                 */
  /* ------------------------------------------------------------------ */
  var rows = Array.from(document.querySelectorAll("#lbBody tr[data-open]"));

  /* ------------------------------------------------------------------ */
  /* Sorting                                                              */
  /* ------------------------------------------------------------------ */
  function getCellValue(row, colIndex) {
    var cells = row.querySelectorAll("td");
    if (!cells[colIndex]) return "";
    var raw = cells[colIndex].getAttribute("data-value");
    if (raw !== null) return raw;
    return cells[colIndex].textContent.trim();
  }

  function sortRows(colIndex, dir) {
    var tbody = document.getElementById("lbBody");
    var sorted = rows.slice().sort(function (a, b) {
      var va = getCellValue(a, colIndex);
      var vb = getCellValue(b, colIndex);
      var na = parseFloat(va);
      var nb = parseFloat(vb);
      if (!isNaN(na) && !isNaN(nb)) {
        return dir === "asc" ? na - nb : nb - na;
      }
      return dir === "asc"
        ? va.localeCompare(vb)
        : vb.localeCompare(va);
    });

    /* Re-append in sorted order */
    sorted.forEach(function (row) { tbody.appendChild(row); });

    /* Update rank numbers */
    updateVisibleRanks();
  }

  function updateVisibleRanks() {
    var visible = rows.filter(function (r) {
      return r.style.display !== "none";
    });
    visible.forEach(function (row, i) {
      var rankCell = row.querySelector(".rank-cell");
      if (!rankCell) return;
      var n = i + 1;
      if (n === 1) {
        rankCell.innerHTML = "<span class='rank-medal rank-medal--1'>1</span>";
      } else if (n === 2) {
        rankCell.innerHTML = "<span class='rank-medal rank-medal--2'>2</span>";
      } else if (n === 3) {
        rankCell.innerHTML = "<span class='rank-medal rank-medal--3'>3</span>";
      } else {
        rankCell.innerHTML = "<span class='rank-medal rank-medal--n'>" + n + "</span>";
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Column header click                                                  */
  /* ------------------------------------------------------------------ */
  var headers = document.querySelectorAll(".lb-table th[data-col]");

  headers.forEach(function (th) {
    th.addEventListener("click", function () {
      var col = parseInt(th.getAttribute("data-col"), 10);
      var dir;
      if (currentSort.col === col) {
        dir = currentSort.dir === "desc" ? "asc" : "desc";
      } else {
        dir = "desc";
      }
      currentSort = { col: col, dir: dir };

      /* Update header classes */
      headers.forEach(function (h) {
        h.classList.remove("sort-asc", "sort-desc");
      });
      th.classList.add(dir === "asc" ? "sort-asc" : "sort-desc");

      sortRows(col, dir);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Filtering                                                            */
  /* ------------------------------------------------------------------ */
  var filterBtns = document.querySelectorAll(".filter-btn[data-filter]");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");

      currentFilter = btn.getAttribute("data-filter");
      applyFilter();
    });
  });

  function applyFilter() {
    rows.forEach(function (row) {
      var isOpen = row.getAttribute("data-open") === "true";
      var show = true;
      if (currentFilter === "open")   show = isOpen;
      if (currentFilter === "closed") show = !isOpen;
      row.style.display = show ? "" : "none";
    });
    updateVisibleRanks();
    updateCount();
  }

  /* ------------------------------------------------------------------ */
  /* Count display                                                        */
  /* ------------------------------------------------------------------ */
  function updateCount() {
    var el = document.getElementById("lbCount");
    if (!el) return;
    var visible = rows.filter(function (r) { return r.style.display !== "none"; });
    el.textContent = "Showing " + visible.length + " of " + rows.length + " models";
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */
  /* Mark default sorted column */
  var defaultTh = document.querySelector(".lb-table th[data-col='1']");
  if (defaultTh) defaultTh.classList.add("sort-desc");

  updateCount();
})();
