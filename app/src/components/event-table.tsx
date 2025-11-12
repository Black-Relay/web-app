import React, { useState } from "react";

type Column<T> = {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

type SortState<T> = {
  key: keyof T | null;
  direction: "asc" | "desc";
};

function sortData<T>(data: T[], sort: SortState<T>): T[] {
  if (!sort.key) return data;
  return [...data].sort((a, b) => {
    const aValue = a[sort.key!];
    const bValue = b[sort.key!];
    if (aValue === bValue) return 0;
    if (sort.direction === "asc") return aValue > bValue ? 1 : -1;
    return aValue < bValue ? 1 : -1;
  });
}

export function EventTable<T extends object>({
  columns,
  data,
}: {
  columns: Column<T>[];
  data: T[];
}) {
  const [sort, setSort] = useState<SortState<T>>({
    key: null,
    direction: "asc",
  });

  function handleSort(colKey: keyof T) {
    if (sort.key === colKey) {
      setSort({
        key: colKey,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSort({ key: colKey, direction: "asc" });
    }
  }

  const sortedData = sortData(data, sort);

  return (
    <table>
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
        {sortedData.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={String(col.key)}>
                {col.render ? col.render(row[col.key], row) : String(row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}