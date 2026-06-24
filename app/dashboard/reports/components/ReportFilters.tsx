"use client";

import { Download, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DateRangePicker,
  DateField,
  RangeCalendar,
} from "@heroui/react";
import { getLocalTimeZone, today } from "@internationalized/date";
import type { Period, DateRange } from "./types";

const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "last_month", label: "Last Month" },
  { id: "custom", label: "Custom" },
];

interface ReportFiltersProps {
  period: Period;
  onPeriodChange: (p: Period) => void;
  customRange: DateRange | null;
  onCustomRangeChange: (r: DateRange | null) => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
  exporting: boolean;
}

export function ReportFilters({
  period,
  onPeriodChange,
  customRange,
  onCustomRangeChange,
  onExportPdf,
  onExportExcel,
  exporting,
}: ReportFiltersProps) {
  const tz = getLocalTimeZone();
  const maxDate = today(tz);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => onPeriodChange(p.id)}
            className={`text-[12px] px-3 py-1.5 rounded-md font-medium transition-colors ${
              period === p.id
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            {p.label}
          </button>
        ))}

        {period === "custom" && (
          <DateRangePicker
            value={customRange}
            onChange={(v) => onCustomRangeChange(v as DateRange | null)}
            maxValue={maxDate}
            aria-label="Date range"
          >
            <DateField.Group variant="secondary" className="h-8 text-[12px]">
              <DateField.Input slot="start">
                {(seg) => <DateField.Segment segment={seg} />}
              </DateField.Input>
              <DateRangePicker.RangeSeparator className="text-slate-400 px-1 text-[12px]">
                –
              </DateRangePicker.RangeSeparator>
              <DateField.Input slot="end">
                {(seg) => <DateField.Segment segment={seg} />}
              </DateField.Input>
              <DateRangePicker.Trigger className="px-2 text-slate-400 hover:text-slate-600">
                <DateRangePicker.TriggerIndicator />
              </DateRangePicker.Trigger>
            </DateField.Group>
            <DateRangePicker.Popover>
              <RangeCalendar>
                <RangeCalendar.Header>
                  <RangeCalendar.NavButton slot="previous">
                    <ChevronLeft className="w-4 h-4" />
                  </RangeCalendar.NavButton>
                  <RangeCalendar.Heading />
                  <RangeCalendar.NavButton slot="next">
                    <ChevronRight className="w-4 h-4" />
                  </RangeCalendar.NavButton>
                </RangeCalendar.Header>
                <RangeCalendar.Grid>
                  <RangeCalendar.GridHeader>
                    {(day) => (
                      <RangeCalendar.HeaderCell>
                        {day}
                      </RangeCalendar.HeaderCell>
                    )}
                  </RangeCalendar.GridHeader>
                  <RangeCalendar.GridBody>
                    {(date) => (
                      <RangeCalendar.Cell date={date}>
                        <RangeCalendar.CellIndicator />
                      </RangeCalendar.Cell>
                    )}
                  </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
              </RangeCalendar>
            </DateRangePicker.Popover>
          </DateRangePicker>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExportPdf}
          disabled={exporting}
          className="flex items-center gap-1.5 text-[12px] text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          Export PDF
        </button>
        <button
          onClick={onExportExcel}
          disabled={exporting}
          className="flex items-center gap-1.5 text-[12px] text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          Export Excel
        </button>
      </div>
    </div>
  );
}
