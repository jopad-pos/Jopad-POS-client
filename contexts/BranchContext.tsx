"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiRequest } from "@/lib/api";

export interface Branch {
  _id: string;
  name: string;
  location: string;
  phone: string;
  isHQ: boolean;
  isActive: boolean;
  createdAt: string;
}

interface BranchContextValue {
  branches: Branch[];
  selectedBranchId: string | null; // null = "All Branches"
  selectedBranch: Branch | null;
  setSelectedBranchId: (id: string | null) => void;
  refreshBranches: () => Promise<void>;
  loading: boolean;
}

const BranchContext = createContext<BranchContextValue>({
  branches: [],
  selectedBranchId: null,
  selectedBranch: null,
  setSelectedBranchId: () => {},
  refreshBranches: async () => {},
  loading: false,
});

const STORAGE_KEY = "jopad_selected_branch";

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBranches = useCallback(async () => {
    try {
      const data = await apiRequest<Branch[]>("/api/branches");
      setBranches(data);
      // If previously selected branch no longer exists/is active, reset to all
      setSelectedBranchIdState((prev) => {
        if (prev && !data.find((b) => b._id === prev && b.isActive)) return null;
        return prev;
      });
    } catch {
      // If branches endpoint fails (e.g. no branches yet), keep empty
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Restore persisted selection from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSelectedBranchIdState(stored);
    } catch {
      // localStorage unavailable
    }
    refreshBranches();
  }, [refreshBranches]);

  function setSelectedBranchId(id: string | null) {
    setSelectedBranchIdState(id);
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable
    }
  }

  const selectedBranch = branches.find((b) => b._id === selectedBranchId) ?? null;

  return (
    <BranchContext.Provider
      value={{ branches, selectedBranchId, selectedBranch, setSelectedBranchId, refreshBranches, loading }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  return useContext(BranchContext);
}

/**
 * Returns the query string fragment to append to API calls.
 * e.g. "&branchId=abc123" or "" for all branches.
 */
export function useBranchQuery(): string {
  const { selectedBranchId } = useBranch();
  return selectedBranchId ? `&branchId=${selectedBranchId}` : "";
}
