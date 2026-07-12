import * as XLSX from "xlsx";
import type { ReportData } from "./types";
import { fmtAmt } from "./types";

// ─── Excel ────────────────────────────────────────────────────────────────────

export function exportToExcel(
  data: ReportData,
  currency: string,
  periodLabel: string,
  dateRange: string
) {
  const wb = XLSX.utils.book_new();

  // ── Summary ──
  const { summary } = data;
  const delta =
    summary.prevRevenue > 0
      ? (((summary.revenue - summary.prevRevenue) / summary.prevRevenue) * 100).toFixed(1) + "%"
      : "N/A";

  const summaryRows = [
    ["Sales Report", periodLabel],
    ["Date range", dateRange],
    ["Generated", new Date().toLocaleString()],
    [],
    ["Metric", "Value"],
    ["Total Revenue", summary.revenue],
    ["Transactions", summary.transactions],
    ["Gross Profit", summary.grossProfit],
    ["Margin %", summary.revenue > 0 ? Math.round((summary.grossProfit / summary.revenue) * 100) + "%" : "0%"],
    ["Avg Sale", summary.transactions > 0 ? Math.round(summary.revenue / summary.transactions) : 0],
    ["vs Prev Period", delta],
    ["Best Day", summary.bestDay ? `${summary.bestDay.day} — ${fmtAmt(summary.bestDay.revenue, currency)}` : "—"],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  summarySheet["!cols"] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  // ── Daily Revenue ──
  const dailyRows = [
    ["Date", "Day", `Revenue (${currency})`, "Transactions"],
    ...data.dailyRevenue.map((d) => [d.date, d.day, d.revenue, d.transactions]),
  ];
  const dailySheet = XLSX.utils.aoa_to_sheet(dailyRows);
  dailySheet["!cols"] = [{ wch: 14 }, { wch: 8 }, { wch: 18 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, dailySheet, "Daily Revenue");

  // ── Top Products ──
  const totalProductRevenue = data.topProducts.reduce((s, p) => s + p.revenue, 0);
  const productRows = [
    ["Product", "Units Sold", `Revenue (${currency})`, "Margin %", "Revenue Share %"],
    ...data.topProducts.map((p) => [
      p.name,
      p.qty,
      p.revenue,
      p.margin,
      totalProductRevenue > 0 ? Math.round((p.revenue / totalProductRevenue) * 100) : 0,
    ]),
  ];
  const productsSheet = XLSX.utils.aoa_to_sheet(productRows);
  productsSheet["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, productsSheet, "Top Products");

  // ── Staff Performance ──
  const staffRows = [
    ["Staff Member", "Sales", `Revenue (${currency})`, `Avg Sale (${currency})`],
    ...data.staffPerformance.map((s) => [s.name, s.sales, s.revenue, s.avgSale]),
  ];
  const staffSheet = XLSX.utils.aoa_to_sheet(staffRows);
  staffSheet["!cols"] = [{ wch: 24 }, { wch: 10 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, staffSheet, "Staff Performance");

  // ── Damaged Goods ──
  const damagedRows = [
    ["Reason", "Units Lost", `Value Lost (${currency})`],
    ...data.damagedGoods.byReason.map((r) => [r.reason, r.qty, r.value]),
    [],
    ["Total", data.damagedGoods.totalQty, data.damagedGoods.totalValue],
  ];
  const damagedSheet = XLSX.utils.aoa_to_sheet(damagedRows);
  damagedSheet["!cols"] = [{ wch: 20 }, { wch: 14 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, damagedSheet, "Damaged Goods");

  const filename = `report-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ─── PDF (print window) ───────────────────────────────────────────────────────

export function exportToPdf(
  data: ReportData,
  currency: string,
  periodLabel: string,
  dateRange: string,
  businessName: string
) {
  const { summary } = data;
  const totalProductRevenue = data.topProducts.reduce((s, p) => s + p.revenue, 0);
  const topStaffRevenue = data.staffPerformance.length
    ? Math.max(...data.staffPerformance.map((s) => s.revenue))
    : 1;

  const delta =
    summary.prevRevenue > 0
      ? (((summary.revenue - summary.prevRevenue) / summary.prevRevenue) * 100).toFixed(1)
      : null;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Sales Report — ${periodLabel}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; color: #1e293b; background: #fff; padding: 32px; }
  h1 { font-size: 18px; font-weight: 700; color: #0f172a; }
  h2 { font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 10px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #1e3a5f; padding-bottom: 12px; }
  .header-right { text-align: right; color: #64748b; }
  .section { margin-bottom: 24px; }
  .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px; }
  .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
  .card-label { font-size: 10px; color: #94a3b8; font-weight: 500; margin-bottom: 4px; }
  .card-value { font-size: 15px; font-weight: 700; color: #0f172a; }
  .card-sub { font-size: 10px; margin-top: 4px; }
  .green { color: #16a34a; }
  .red { color: #dc2626; }
  .muted { color: #94a3b8; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 6px 10px; font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
  td { padding: 7px 10px; font-size: 11px; color: #334155; border-bottom: 1px solid #f8fafc; }
  td.right, th.right { text-align: right; }
  .bar-wrap { height: 5px; background: #f1f5f9; border-radius: 3px; overflow: hidden; display: inline-block; width: 60px; vertical-align: middle; margin-right: 4px; }
  .bar-fill { height: 100%; background: #2cb8f8; border-radius: 3px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 10px; color: #94a3b8; font-size: 10px; display: flex; justify-content: space-between; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>Sales Report</h1>
    <p style="color:#64748b;margin-top:4px">${periodLabel} &nbsp;·&nbsp; ${dateRange}</p>
  </div>
  <div class="header-right">
    <p style="font-weight:600;font-size:13px">${businessName}</p>
    <p style="margin-top:2px">Generated ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
  </div>
</div>

<!-- Summary cards -->
<div class="cards">
  <div class="card">
    <div class="card-label">Total Revenue</div>
    <div class="card-value">${fmtAmt(summary.revenue, currency)}</div>
    <div class="card-sub ${delta !== null ? (Number(delta) >= 0 ? "green" : "red") : "muted"}">
      ${delta !== null ? `${Number(delta) >= 0 ? "↑" : "↓"} ${Math.abs(Number(delta))}% vs prev period` : "No prior data"}
    </div>
  </div>
  <div class="card">
    <div class="card-label">Transactions</div>
    <div class="card-value">${summary.transactions.toLocaleString()}</div>
    <div class="card-sub muted">Avg ${fmtAmt(summary.transactions > 0 ? Math.round(summary.revenue / summary.transactions) : 0, currency)}/sale</div>
  </div>
  <div class="card">
    <div class="card-label">Gross Profit</div>
    <div class="card-value">${fmtAmt(summary.grossProfit, currency)}</div>
    <div class="card-sub muted">${summary.revenue > 0 ? Math.round((summary.grossProfit / summary.revenue) * 100) : 0}% margin</div>
  </div>
  <div class="card">
    <div class="card-label">Best Day</div>
    <div class="card-value">${summary.bestDay?.day ?? "—"}</div>
    <div class="card-sub green">${summary.bestDay ? fmtAmt(summary.bestDay.revenue, currency) : "No sales"}</div>
  </div>
</div>

<div class="two-col">
  <!-- Top Products -->
  <div class="section">
    <h2>Top Products</h2>
    <table>
      <thead><tr>
        <th>#</th><th>Product</th>
        <th class="right">Units</th>
        <th class="right">Revenue</th>
        <th class="right">Margin</th>
        <th class="right">Share</th>
      </tr></thead>
      <tbody>
        ${data.topProducts.map((p, i) => {
          const share = totalProductRevenue > 0 ? Math.round((p.revenue / totalProductRevenue) * 100) : 0;
          return `<tr>
            <td>${i + 1}</td>
            <td>${escHtml(p.name)}</td>
            <td class="right">${p.qty.toLocaleString()}</td>
            <td class="right">${fmtAmt(p.revenue, currency)}</td>
            <td class="right" style="color:#16a34a">${p.margin}%</td>
            <td class="right">
              <span class="bar-wrap"><span class="bar-fill" style="width:${share}%"></span></span>${share}%
            </td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  </div>

  <!-- Staff Performance -->
  <div class="section">
    <h2>Staff Performance</h2>
    <table>
      <thead><tr>
        <th>#</th><th>Staff Member</th>
        <th class="right">Sales</th>
        <th class="right">Revenue</th>
        <th class="right">Avg Sale</th>
      </tr></thead>
      <tbody>
        ${data.staffPerformance.map((s, i) => {
          const pct = Math.round((s.revenue / topStaffRevenue) * 100);
          return `<tr>
            <td>${i + 1}</td>
            <td>
              <span class="bar-wrap"><span class="bar-fill" style="width:${pct}%"></span></span>
              ${escHtml(s.name)}
            </td>
            <td class="right">${s.sales}</td>
            <td class="right">${fmtAmt(s.revenue, currency)}</td>
            <td class="right">${fmtAmt(s.avgSale, currency)}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  </div>
</div>

${data.damagedGoods.byReason.length > 0 ? `
<!-- Damaged Goods -->
<div class="section">
  <h2>Damaged Goods</h2>
  <table>
    <thead><tr>
      <th>Reason</th>
      <th class="right">Units Lost</th>
      <th class="right">Value Lost</th>
    </tr></thead>
    <tbody>
      ${data.damagedGoods.byReason.map((r) => `<tr>
        <td>${escHtml(r.reason)}</td>
        <td class="right">${r.qty.toLocaleString()}</td>
        <td class="right red">${fmtAmt(r.value, currency)}</td>
      </tr>`).join("")}
      <tr>
        <td style="font-weight:600">Total</td>
        <td class="right" style="font-weight:600">${data.damagedGoods.totalQty.toLocaleString()}</td>
        <td class="right red" style="font-weight:600">${fmtAmt(data.damagedGoods.totalValue, currency)}</td>
      </tr>
    </tbody>
  </table>
</div>
` : ""}

<!-- Daily Revenue -->
<div class="section">
  <h2>Daily Revenue</h2>
  <table>
    <thead><tr>
      <th>Date</th><th>Day</th>
      <th class="right">Revenue (${currency})</th>
      <th class="right">Transactions</th>
    </tr></thead>
    <tbody>
      ${data.dailyRevenue.map((d) => `<tr>
        <td>${d.date}</td>
        <td>${d.day}</td>
        <td class="right">${d.revenue.toLocaleString()}</td>
        <td class="right">${d.transactions}</td>
      </tr>`).join("")}
    </tbody>
  </table>
</div>

<div class="footer">
  <span>Jopad POS · Sales Report</span>
  <span>${periodLabel} · ${dateRange}</span>
</div>

</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("Pop-up blocked. Please allow pop-ups for this site and try again.");
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
