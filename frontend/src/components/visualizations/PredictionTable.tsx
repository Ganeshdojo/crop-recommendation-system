// src/components/visualizations/PredictionTable.tsx
import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState
} from '@tanstack/react-table';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

interface Prediction {
  date: string;
  crop: string;
  model: string;
  match: number;
}

interface PredictionTableProps {
  data: Prediction[];
  tooltips?: Record<string, string>;
}

const PredictionTable: React.FC<PredictionTableProps> = ({ 
  data, 
  tooltips = {} 
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const columnHelper = createColumnHelper<Prediction>();

  const columns = useMemo(() => [
    columnHelper.accessor('date', {
      header: () => (
        <Tippy content={tooltips.date || 'Date of prediction'}>
          <span>DATE</span>
        </Tippy>
      ),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('crop', {
      header: () => (
        <Tippy content={tooltips.crop || 'Predicted crop type'}>
          <span>CROP</span>
        </Tippy>
      ),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('model', {
      header: () => (
        <Tippy content={tooltips.model || 'ML model used'}>
          <span>MODEL</span>
        </Tippy>
      ),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('match', {
      header: () => (
        <Tippy content={tooltips.match || 'Prediction confidence'}>
          <span>MATCH</span>
        </Tippy>
      ),
      cell: info => (
        <span className={`font-medium ${info.getValue() >= 90 ? 'text-green-600 dark:text-green-500' : 'text-yellow-600 dark:text-yellow-500'}`}>
          {info.getValue()}%
        </span>
      ),
    }),
  ], [tooltips]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <span className="ml-1">
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? ' '}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white dark:bg-transparent divide-y divide-gray-100 dark:divide-gray-800/30">
          {table.getRowModel().rows.map(row => (
            <tr 
              key={row.id} 
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PredictionTable;