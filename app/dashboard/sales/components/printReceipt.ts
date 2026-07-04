import { Sale } from "./types";
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

export function printReceipt(sale: Sale, profile: BusinessProfile | null) {
  const currency = profile?.currency ?? "UGX";
  const businessName = profile?.businessName ?? "Business";
  const businessPhone = profile?.phone ?? "";
  const businessLocation = profile?.location ?? "";

  const lineItems = sale.lineItems ?? [];
  const lineRows = lineItems
    .map(
      (li) => `
    <tr>
      <td>${li.name}<br><span class="qty">${li.qty} x ${li.unitPrice.toLocaleString()}</span></td>
      <td class="num">${(li.qty * li.unitPrice).toLocaleString()}</td>
    </tr>`
    )
    .join("");

  const contactLines = [businessLocation, businessPhone].filter(Boolean).join("<br>");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Receipt ${sale.ref}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Courier New", monospace; font-size: 12px; color: #111; background: #fff; }
  .page { width: 280px; margin: 0 auto; padding: 16px; }
  .center { text-align: center; }
  .biz-name { font-size: 15px; font-weight: 700; }
  .biz-info { font-size: 10px; color: #444; margin-top: 3px; line-height: 1.5; }
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
  </div>

  <hr class="divider">

  <div class="meta">
    <div><span>Ref</span><span>${sale.ref}</span></div>
    <div><span>Date</span><span>${fmtDate(sale.date)}</span></div>
    <div><span>Cashier</span><span>${sale.cashier || "—"}</span></div>
    <div><span>Customer</span><span>${sale.customer}</span></div>
  </div>

  <hr class="divider">

  <table>
    <tbody>
      ${lineRows || `<tr><td colspan="2" style="text-align:center;color:#888;padding:8px 0">No item details recorded</td></tr>`}
    </tbody>
  </table>

  <div class="totals">
    <div class="grand"><span>TOTAL</span><span>${currency} ${sale.amount.toLocaleString()}</span></div>
    <div><span>Payment</span><span>${sale.method}</span></div>
  </div>

  <hr class="divider">

  <div class="footer">Thank you for your business</div>
</div>
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Pop-up blocked. Please allow pop-ups for this site to print receipts.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
