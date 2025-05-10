import React from "react";
import { cn } from "@/lib/utils";

interface TableProps<T> {
  headers: {
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
  }[];
  data: T[];
  className?: string;
  rowKey?: keyof T | ((item: T) => string);
  onRowClick?: (item: T) => void;
  noDataMessage?: string;
}

function Table<T>({
  headers,
  data,
  className,
  rowKey,
  onRowClick,
}: TableProps<T>) {
  const getRowKey = (item: T, index: number): string => {
    if (!rowKey) {
      return String(index);
    }
    return typeof rowKey === "function"
      ? rowKey(item)
      : String(item[rowKey] ?? index);
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header) => (
              <th
                key={String(header.key)}
                className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b border-gray-200"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-4 py-2 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={getRowKey(item, index)}
                className={cn(
                  "hover:bg-gray-50",
                  onRowClick && "cursor-pointer",
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                )}
                onClick={() => onRowClick?.(item)}
              >
                {headers.map((header) => (
                  <td
                    key={String(header.key)}
                    className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200"
                  >
                    {header.render
                      ? header.render(item)
                      : String(item[header.key as keyof T] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
