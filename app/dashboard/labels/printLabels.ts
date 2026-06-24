export type LabelSize = "small" | "medium" | "large";

export interface PrintOptions {
  size?: LabelSize;
  copies?: number;
  showName?: boolean;
  showPrice?: boolean;
  showSku?: boolean;
}

export interface PrintableProduct {
  _id: string;
  name: string;
  sku?: string;
  barcode?: string;
  sellPrice: number;
}

const SIZE_DIMS: Record<
  LabelSize,
  { w: string; h: string; barcodeH: number; nameSize: string; priceSize: string; fontSize: number }
> = {
  small:  { w: "50mm",  h: "25mm", barcodeH: 22, nameSize: "8pt",  priceSize: "10pt", fontSize: 7  },
  medium: { w: "70mm",  h: "40mm", barcodeH: 32, nameSize: "10pt", priceSize: "12pt", fontSize: 8  },
  large:  { w: "100mm", h: "60mm", barcodeH: 48, nameSize: "12pt", priceSize: "14pt", fontSize: 10 },
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function printLabels(
  products: PrintableProduct[],
  options: PrintOptions = {}
): Promise<void> {
  const {
    size = "medium",
    copies = 1,
    showName = true,
    showPrice = true,
    showSku = true,
  } = options;

  const { default: JsBarcode } = await import("jsbarcode");
  const dim = SIZE_DIMS[size];

  const labelChunks = products.flatMap((product) => {
    let barcodeHTML = "";
    if (product.barcode) {
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg") as SVGSVGElement;
      try {
        JsBarcode(svg as unknown as HTMLElement, product.barcode, {
          format: "CODE128",
          height: dim.barcodeH,
          fontSize: dim.fontSize,
          margin: 1,
          displayValue: true,
          lineColor: "#000",
          background: "#fff",
          textMargin: 1,
        });
        barcodeHTML = `<div class="bc">${svg.outerHTML}</div>`;
      } catch {
        barcodeHTML = `<div class="bc-err">Invalid barcode</div>`;
      }
    } else {
      barcodeHTML = `<div class="bc-missing">No barcode</div>`;
    }

    const label = `
<div class="label" style="width:${dim.w};min-height:${dim.h};">
  ${showName ? `<div class="name" style="font-size:${dim.nameSize};">${escapeHtml(product.name)}</div>` : ""}
  ${barcodeHTML}
  ${showPrice ? `<div class="price" style="font-size:${dim.priceSize};">UGX ${product.sellPrice.toLocaleString()}</div>` : ""}
  ${showSku && product.sku ? `<div class="sku">${escapeHtml(product.sku)}</div>` : ""}
</div>`;
    return Array(copies).fill(label);
  });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Print Labels</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, sans-serif; background: #fff; }
.sheet { display: flex; flex-wrap: wrap; gap: 2mm; padding: 5mm; }
.label {
  border: 0.4pt solid #bbb;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 1.5mm; gap: 0.5mm;
  break-inside: avoid; page-break-inside: avoid; overflow: hidden;
}
.name { font-weight: 700; text-align: center; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.3; }
.bc svg { max-width: 100%; height: auto; display: block; }
.bc-missing { font-size: 8pt; color: #aaa; }
.bc-err { font-size: 8pt; color: #e00; }
.price { font-weight: 700; text-align: center; line-height: 1.2; }
.sku { font-size: 7pt; color: #777; text-align: center; }
@media print { @page { margin: 5mm; size: auto; } body { margin: 0; } }
</style>
</head>
<body>
<div class="sheet">${labelChunks.join("")}</div>
<script>window.addEventListener("load", function() { window.print(); });</script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("Please allow popups in your browser to print labels.");
    return;
  }
  win.document.write(html);
  win.document.close();
}
