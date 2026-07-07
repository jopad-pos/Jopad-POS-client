import { Invoice } from "./shared";
import { BusinessProfile } from "@/contexts/AuthContext";

const statusColors: Record<string, string> = {
  Paid: "#059669",
  Sent: "#2563eb",
  Draft: "#94a3b8",
  Overdue: "#dc2626",
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function printInvoice(invoice: Invoice, profile: BusinessProfile | null) {
  const currency = profile?.currency ?? "UGX";
  const businessName = profile?.businessName ?? "Business";
  const businessEmail = profile?.storeEmail ?? "";
  const businessPhone = profile?.phone ?? "";
  const businessLocation = profile?.location ?? "";
  const logoUrl = profile?.logoUrl ?? "";

  const lineItems = invoice.lineItems ?? [];
  const lineRows = lineItems
    .map(
      (li, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${li.name}</td>
      <td class="num">${li.qty}</td>
      <td class="num">${li.unitPrice.toLocaleString()}</td>
      <td class="num">${(li.qty * li.unitPrice).toLocaleString()}</td>
    </tr>`
    )
    .join("");

  const contactLines = [businessLocation, businessPhone, businessEmail]
    .filter(Boolean)
    .join("<br>");

  const color = statusColors[invoice.status] ?? "#94a3b8";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Invoice ${invoice.ref}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1e293b; background: #fff; }
  .page { padding: 48px; max-width: 800px; margin: 0 auto; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .logo { max-height: 56px; max-width: 200px; margin-bottom: 10px; display: block; }
  .biz-name { font-size: 22px; font-weight: 700; color: #0f172a; }
  .biz-info { font-size: 11px; color: #64748b; margin-top: 5px; line-height: 1.7; }

  .inv-badge { text-align: right; }
  .inv-title { font-size: 30px; font-weight: 700; color: #2563eb; letter-spacing: -0.5px; }
  .inv-ref { font-size: 13px; color: #64748b; margin-top: 3px; }
  .inv-status { display: inline-block; margin-top: 8px; font-size: 10px; font-weight: 700;
    padding: 3px 10px; border-radius: 4px; letter-spacing: 0.8px; }

  .divider { border: none; border-top: 1px solid #e2e8f0; margin-bottom: 28px; }

  .meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .meta-block label { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
  .meta-block p { font-size: 13px; color: #1e293b; font-weight: 500; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { background: #f8fafc; }
  th { padding: 9px 12px; text-align: left; font-size: 10px; font-weight: 600;
    color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;
    border-bottom: 2px solid #e2e8f0; border-top: 1px solid #e2e8f0; }
  td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  tbody tr:last-child td { border-bottom: none; }
  .num { text-align: right; }

  .totals-wrap { display: flex; justify-content: flex-end; margin-top: 4px; }
  .totals { min-width: 260px; border-top: 2px solid #e2e8f0; }
  .totals td { padding: 10px 12px; font-size: 14px; font-weight: 700; color: #0f172a; }
  .totals .lbl { color: #475569; font-weight: 600; }

  .notes { margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  .notes label { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px; }
  .notes p { font-size: 12px; color: #475569; line-height: 1.6; white-space: pre-wrap; }

  .footer { margin-top: 52px; text-align: center; font-size: 11px; color: #94a3b8; }

  @media print {
    @page { margin: 1cm; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 0; }
  }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div>
      ${logoUrl ? `<img class="logo" src="${logoUrl}" alt="${businessName}">` : ""}
      <div class="biz-name">${businessName}</div>
      ${contactLines ? `<div class="biz-info">${contactLines}</div>` : ""}
    </div>
    <div class="inv-badge">
      <div class="inv-title">INVOICE</div>
      <div class="inv-ref">${invoice.ref}</div>
      <div class="inv-status" style="background:${color}18;color:${color};">${invoice.status.toUpperCase()}</div>
    </div>
  </div>

  <hr class="divider">

  <div class="meta">
    <div class="meta-block">
      <label>Bill To</label>
      <p>${invoice.customer || "—"}</p>
    </div>
    <div class="meta-block">
      <label>Issue Date</label>
      <p>${fmtDate(invoice.issueDate)}</p>
    </div>
    <div class="meta-block">
      <label>Due Date</label>
      <p>${fmtDate(invoice.dueDate)}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:32px">#</th>
        <th>Description</th>
        <th class="num" style="width:60px">Qty</th>
        <th class="num" style="width:130px">Unit Price (${currency})</th>
        <th class="num" style="width:130px">Amount (${currency})</th>
      </tr>
    </thead>
    <tbody>
      ${lineRows || `<tr><td colspan="5" style="color:#94a3b8;text-align:center;padding:20px">No line items</td></tr>`}
    </tbody>
  </table>

  <div class="totals-wrap">
    <table class="totals">
      <tr>
        <td class="lbl">Total</td>
        <td class="num">${currency} ${invoice.amount.toLocaleString()}</td>
      </tr>
    </table>
  </div>

  ${invoice.notes ? `<div class="notes"><label>Notes</label><p>${invoice.notes}</p></div>` : ""}

  <div class="footer">Thank you for your business</div>
</div>
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Pop-up blocked. Please allow pop-ups for this site to download invoices.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
