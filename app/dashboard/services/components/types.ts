export interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  duration?: string;
  description?: string;
  branchId?: { _id: string; name: string } | null;
}

export interface StatsData {
  total: number;
  categories: number;
  averagePrice: number;
  highestPrice: number;
}

export interface ServiceFormState {
  name: string;
  category: string;
  price: string;
  duration: string;
  description: string;
}

export const emptyForm = (): ServiceFormState => ({
  name: "",
  category: "",
  price: "",
  duration: "",
  description: "",
});

export function exportCSV(services: Service[]) {
  const header = ["Name", "Category", "Duration", "Price"];
  const rows = services.map((s) => [
    `"${s.name}"`,
    `"${s.category}"`,
    `"${s.duration || ""}"`,
    s.price,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "services-list.csv";
  a.click();
  URL.revokeObjectURL(url);
}
