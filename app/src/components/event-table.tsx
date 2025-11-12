import React, { useState } from "react";
import "../css/event-table.css";

type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

type SortState<T> = {
  key: string | null;
  direction: "asc" | "desc";
};

function getValueByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

function sortData<T>(data: T[], sort: SortState<T>): T[] {
  if (!sort.key) return data;
  return [...data].sort((a, b) => {
    const aValue = getValueByPath(a, sort.key!);
    const bValue = getValueByPath(b, sort.key!);

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
    }
    if (aValue === bValue) return 0;
    if (sort.direction === "asc") return aValue > bValue ? 1 : -1;
    return aValue < bValue ? 1 : -1;
  });
}

function exportCSV<T>(columns: Column<T>[], rows: T[], filename = "export.csv") {
  // Helpers to escape CSV values
  const escape = (val: any) => {
    if (val == null) return "";
    const str = typeof val === "string" ? val : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };
  // Get header row
  const header = columns.map((col) => escape(col.header)).join(",");
  // Get body rows
  const body = rows
    .map((row) =>
      columns
        .map((col) => escape(col.render ? col.render(getValueByPath(row, col.key), row) : getValueByPath(row, col.key)))
        .join(",")
    )
    .join("\n");
  // Compose CSV/output
  const csvContent = header + "\n" + body;
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function exportCSVRaw<T>(columns: Column<T>[], rows: T[], filename = "all-data.csv") {
  // One header: "RowData"
  const header = '"RowData"';
  // Each row: stringified as JSON and escaped for CSV
  const body = rows
    .map((row) =>
      `"${JSON.stringify(row).replace(/"/g, '""')}"`
    )
    .join("\n");
  const csvContent = header + "\n" + body;
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export function EventTable<T extends object>({
  columns,
  data,
  setEvent
}: {
  columns: Column<T>[];
  data: T[];
  setEvent?: (row: T) => void;
}) {
  const ROWS_PER_PAGE = 20;
  const [sort, setSort] = useState<SortState<T>>({
    key: null,
    direction: "asc",
  });
  const [page, setPage] = useState(0);

  function handleSort(colKey: string) {
    if (sort.key === colKey) {
      setSort({
        key: colKey,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSort({ key: colKey, direction: "asc" });
    }
    setPage(0); // Reset to first page on sort
  }

  const sortedData = sortData(data, sort);
  const pageCount = Math.ceil(sortedData.length / ROWS_PER_PAGE);
  const paginatedData = sortedData.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button
          className="csv-export-btn"
          onClick={() => exportCSV(columns, paginatedData)}
        >
          Export Table View
        </button>
        <button
          className="csv-export-btn"
          onClick={() => exportCSVRaw(columns, sortedData)}
        >
          Export Raw Data
        </button>
      </div>
      <table className="sortable-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={{ cursor: col.sortable ? "pointer" : "default" }}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                {col.header}
                {col.sortable && sort.key === col.key && (
                  <span>{sort.direction === "asc" ? " ▲" : " ▼"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, i) => (
            <tr
              key={i}
              onClick={setEvent ? ()=>{setEvent(row)} : undefined}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render
                    ? col.render(getValueByPath(row, col.key), row)
                    : String(getValueByPath(row, col.key))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination" style={{ marginTop: "12px", textAlign: "center" }}>
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="pagination-btn"
        >
          Previous
        </button>
        {Array.from({ length: pageCount }).map((_, i) => (
          <button
            key={i}
            className={`pagination-btn${i === page ? " active" : ""}`}
            onClick={() => setPage(i)}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          disabled={page === pageCount - 1}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
}