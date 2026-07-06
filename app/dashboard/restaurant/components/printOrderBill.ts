import { Order } from "./types";
import { lineItemTotal, lineItemUnitPrice, orderTotal } from "./types";
import { BusinessProfile } from "@/contexts/AuthContext";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Prints an unpaid bill for an open table tab — handed to the guest so they
 * can review the total before paying. This is NOT a receipt: no payment has
 * been recorded yet, so it's clearly labelled "UNPAID" to avoid being
 * mistaken for proof of payment. The actual receipt only exists once the tab
 * is billed & closed (it becomes a Sale, printable from the Sales page).
 */
export function printOrderBill(order: Order, profile: BusinessProfile | null) {
  const currency = profile?.currency ?? "UGX";
  const businessName = profile?.businessName ?? "Business";
  const businessPhone = profile?.phone ?? "";
  const businessLocation = profile?.location ?? "";

  const lineRows = order.lineItems
    .map((li) => {
      const modifierText = li.modifiers.length ? li.modifiers.map((m) => m.name).join(", ") : "";
      return `
    <tr>
      <td>${li.name}<br><span class="qty">${li.qty} x ${lineItemUnitPrice(li).toLocaleString()}</span>${
        modifierText ? `<br><span class="qty">${modifierText}</span>` : ""
      }</td>
      <td class="num">${lineItemTotal(li).toLocaleString()}</td>
    </tr>`;
    })
    .join("");

  const contactLines = [businessLocation, businessPhone].filter(Boolean).join("<br>");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Bill ${order.ref}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Courier New", monospace; font-size: 12px; color: #111; background: #fff; }
  .page { width: 280px; margin: 0 auto; padding: 16px; }
  .center { text-align: center; }
  .biz-name { font-size: 15px; font-weight: 700; }
  .biz-info { font-size: 10px; color: #444; margin-top: 3px; line-height: 1.5; }
  .unpaid-badge { display: inline-block; margin-top: 8px; padding: 3px 10px; border: 1px dashed #b45309; color: #b45309; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
  .divider { border: none; border-top: 1px dashed #999; margin: 10px 0; }
  .meta { font-size: 11px; margin-bottom: 8px; }
  .meta div { display: flex; justify-content: space-between; padding: 1px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 4px 0; font-size: 11px; vertical-align: top; }
  .qty { color: #555; font-size: 10px; }
  .num { text-align: right; white-space: nowrap; }
  .totals { margin-top: 8px; }
  .totals div { display: flex; justify-content: space-between; padding: 2px 0; }
  .grand { font-size: 13px; font-weight: 700; border-top: 1px dashed #999; margin-top: 4px; padding-top: 6px; }
  .footer { margin-top: 16px; text-align: center; font-size: 10px; color: #555; }

  @media print {
    @page { margin: 0; size: 80mm auto; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 100%; padding: 8px; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="center">
    <div class="biz-name">${businessName}</div>
    ${contactLines ? `<div class="biz-info">${contactLines}</div>` : ""}
    <div class="unpaid-badge">UNPAID — PLEASE PAY AT THE COUNTER</div>
  </div>

  <hr class="divider">

  <div class="meta">
    <div><span>Bill</span><span>${order.ref}</span></div>
    <div><span>Table</span><span>${order.tableLabel}</span></div>
    <div><span>Party size</span><span>${order.partySize}</span></div>
    <div><span>Opened</span><span>${fmtDate(order.openedAt)}</span></div>
  </div>

  <hr class="divider">

  <table>
    <tbody>
      ${lineRows || `<tr><td colspan="2" style="text-align:center;color:#888;padding:8px 0">No items yet</td></tr>`}
    </tbody>
  </table>

  <div class="totals">
    <div class="grand"><span>AMOUNT DUE</span><span>${currency} ${orderTotal(order).toLocaleString()}</span></div>
  </div>

  <hr class="divider">

  <div class="footer">This is not a receipt — pay at the counter to close out your tab</div>
</div>
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Pop-up blocked. Please allow pop-ups for this site to print bills.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
