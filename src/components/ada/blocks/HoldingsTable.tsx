import React, { useState, useMemo } from 'react';
import type { HoldingsTableBlock } from '../../../../shared/schemas/agent';

interface HoldingsTableProps {
  block: HoldingsTableBlock;
}

function formatCell(value: string | number, format?: string): React.ReactNode {
  if (format === 'currency' && typeof value === 'number') {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }
  if (format === 'percent' && typeof value === 'number') {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }
  if (format === 'number' && typeof value === 'number') {
    return new Intl.NumberFormat('en-AE').format(value);
  }
  if (format === 'delta') {
    const numVal = typeof value === 'number' ? value : parseFloat(String(value));
    if (!isNaN(numVal)) {
      const color = numVal > 0 ? 'text-[#2e7d32]' : numVal < 0 ? 'text-[#c0180c]' : 'text-[#999]';
      return <span className={color}>{numVal >= 0 ? '+' : ''}{numVal.toFixed(2)}%</span>;
    }
  }
  return String(value);
}

export function HoldingsTable({ block }: HoldingsTableProps) {
  const [sortCol, setSortCol] = useState(block.defaultSort?.column || '');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(block.defaultSort?.direction || 'desc');

  const sortedRows = useMemo(() => {
    if (!sortCol) return block.rows;
    return [...block.rows].sort((a, b) => {
      const aVal = a.values[sortCol];
      const bVal = b.values[sortCol];
      const aNum = typeof aVal === 'number' ? aVal : parseFloat(String(aVal));
      const bNum = typeof bVal === 'number' ? bVal : parseFloat(String(bVal));
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDir === 'asc' ? aNum - bNum : bNum - aNum;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [block.rows, sortCol, sortDir]);

  const handleSort = (key: string) => {
    if (sortCol === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(key);
      setSortDir('desc');
    }
  };

  return (
    <div className="rounded-[12px] bg-white border border-[#e8e5de] overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full min-w-[320px]">
          <thead>
            <tr className="border-b border-[#e8e5de]">
              <th className="text-left px-[10px] py-[8px] font-['DM_Sans',sans-serif] text-[#999] text-[0.625rem] uppercase tracking-[0.5px] font-medium">
                Name
              </th>
              {block.columns.map(col => (
                <th
                  key={col.key}
                  className={`px-[10px] py-[8px] ${
                    col.align === 'left' ? 'text-left' : col.align === 'center' ? 'text-center' : 'text-right'
                  }`}
                  aria-sort={sortCol === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <button
                    type="button"
                    className="font-['DM_Sans',sans-serif] text-[#999] text-[0.625rem] uppercase tracking-[0.5px] font-medium cursor-pointer hover:text-[#555] transition-colors bg-transparent border-none p-0 inline-flex items-center gap-[2px]"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    {sortCol === col.key && (
                      <span className="text-[0.5rem]" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, idx) => (
              <tr key={idx} className={idx < sortedRows.length - 1 ? 'border-b border-[#f0ede5]' : ''}>
                <td className="px-[10px] py-[8px]">
                  <div className="font-['DM_Sans',sans-serif] text-[#333] text-[0.75rem] font-medium">{row.ticker}</div>
                  <div className="font-['DM_Sans',sans-serif] text-[#999] text-[0.625rem]">{row.name}</div>
                </td>
                {block.columns.map(col => (
                  <td
                    key={col.key}
                    className={`px-[10px] py-[8px] font-['DM_Sans',sans-serif] text-[0.75rem] ${
                      col.align === 'left' ? 'text-left' : col.align === 'center' ? 'text-center' : 'text-right'
                    }`}
                  >
                    {formatCell(row.values[col.key] ?? '', col.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
