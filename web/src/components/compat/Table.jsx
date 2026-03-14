// Compat layer: Semi Design Table → HTML table with sorting/pagination
import * as React from 'react';
import { cn } from '@/lib/utils';

const Table = ({
  columns = [],
  dataSource = [],
  loading,
  pagination,
  rowSelection,
  scroll,
  onRow,
  empty,
  size = 'default',
  bordered,
  rowKey = 'key',
  className,
  style,
  onChange,
  expandedRowRender,
  expandRowByClick,
  rowExpandable,
  defaultExpandAllRows,
  ...rest
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(pagination?.defaultPageSize || pagination?.pageSize || 10);
  const [sortState, setSortState] = React.useState({ key: null, order: null });
  const [selectedRowKeys, setSelectedRowKeys] = React.useState(rowSelection?.selectedRowKeys || []);
  const [expandedRows, setExpandedRows] = React.useState(defaultExpandAllRows ? dataSource.map((_, i) => i) : []);

  React.useEffect(() => {
    if (rowSelection?.selectedRowKeys) setSelectedRowKeys(rowSelection.selectedRowKeys);
  }, [rowSelection?.selectedRowKeys]);

  React.useEffect(() => {
    if (pagination?.pageSize) setPageSize(pagination.pageSize);
  }, [pagination?.pageSize]);

  const getRowKey = (record, idx) => {
    if (typeof rowKey === 'function') return rowKey(record);
    return record[rowKey] !== undefined ? record[rowKey] : idx;
  };

  // Sort
  let sortedData = [...dataSource];
  if (sortState.key && sortState.order) {
    const col = columns.find((c) => c.dataIndex === sortState.key || c.key === sortState.key);
    if (col?.sorter) {
      const sorterFn = typeof col.sorter === 'function' ? col.sorter : (a, b) => {
        const av = a[col.dataIndex], bv = b[col.dataIndex];
        if (av < bv) return -1;
        if (av > bv) return 1;
        return 0;
      };
      sortedData.sort((a, b) => sortState.order === 'ascend' ? sorterFn(a, b) : -sorterFn(a, b));
    }
  }

  // Filter
  columns.forEach((col) => {
    if (col.filteredValue && col.filteredValue.length > 0 && col.onFilter) {
      sortedData = sortedData.filter((record) =>
        col.filteredValue.some((val) => col.onFilter(val, record))
      );
    }
  });

  // Pagination
  const totalItems = sortedData.length;
  const usePagination = pagination !== false && pagination !== null;
  const totalPages = usePagination ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;
  const pagedData = usePagination ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sortedData;

  const handleSort = (colKey) => {
    setSortState((prev) => {
      if (prev.key === colKey) {
        if (prev.order === 'ascend') return { key: colKey, order: 'descend' };
        if (prev.order === 'descend') return { key: null, order: null };
      }
      return { key: colKey, order: 'ascend' };
    });
  };

  const handleSelectAll = (checked) => {
    const keys = checked ? pagedData.map((r, i) => getRowKey(r, i)) : [];
    setSelectedRowKeys(keys);
    rowSelection?.onChange?.(keys, checked ? pagedData : []);
  };

  const handleSelectRow = (key, record, checked) => {
    const newKeys = checked ? [...selectedRowKeys, key] : selectedRowKeys.filter((k) => k !== key);
    setSelectedRowKeys(newKeys);
    rowSelection?.onChange?.(newKeys, pagedData.filter((r, i) => newKeys.includes(getRowKey(r, i))));
  };

  const sizeClass = size === 'small' ? 'text-xs' : size === 'middle' ? 'text-sm' : 'text-sm';

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)} style={style}>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    );
  }

  if (pagedData.length === 0 && empty) {
    return <div className={cn(className)} style={style}>{empty}</div>;
  }

  return (
    <div className={cn('w-full', className)} style={style}>
      <div className={scroll ? 'overflow-auto' : ''} style={scroll ? { maxHeight: scroll.y, maxWidth: scroll.x === 'max-content' ? '100%' : scroll.x } : undefined}>
        <table className={cn('w-full caption-bottom', sizeClass, bordered && 'border')}>
          <thead className='border-b bg-muted/50'>
            <tr>
              {rowSelection && (
                <th className='px-3 py-2 w-10'>
                  <input
                    type='checkbox'
                    checked={pagedData.length > 0 && pagedData.every((r, i) => selectedRowKeys.includes(getRowKey(r, i)))}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className='accent-[hsl(var(--primary))]'
                  />
                </th>
              )}
              {columns.map((col) => {
                const key = col.dataIndex || col.key;
                const isSorted = sortState.key === key;
                return (
                  <th
                    key={key}
                    className={cn('px-3 py-2 text-left font-medium text-muted-foreground', col.sorter && 'cursor-pointer select-none hover:text-foreground', col.fixed && 'sticky bg-background z-10', col.fixed === 'left' && 'left-0', col.fixed === 'right' && 'right-0')}
                    style={{ width: col.width, minWidth: col.width }}
                    onClick={col.sorter ? () => handleSort(key) : undefined}
                  >
                    <span className='inline-flex items-center gap-1'>
                      {col.title}
                      {col.sorter && (
                        <span className='text-[10px]'>
                          {isSorted ? (sortState.order === 'ascend' ? '▲' : '▼') : '⇅'}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className='divide-y'>
            {pagedData.map((record, rowIdx) => {
              const key = getRowKey(record, rowIdx);
              const rowProps = onRow ? onRow(record, rowIdx) : {};
              const isExpanded = expandedRows.includes(key);
              const canExpand = expandedRowRender && (!rowExpandable || rowExpandable(record));
              const handleRowClick = (e) => {
                if (expandRowByClick && canExpand) {
                  setExpandedRows((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
                }
                rowProps?.onClick?.(e);
              };
              return (
                <React.Fragment key={key}>
                  <tr className={cn('hover:bg-muted/50 transition-colors', selectedRowKeys.includes(key) && 'bg-accent/30', expandRowByClick && canExpand && 'cursor-pointer')} {...rowProps} onClick={handleRowClick}>
                    {rowSelection && (
                      <td className='px-3 py-2'>
                        <input
                          type='checkbox'
                          checked={selectedRowKeys.includes(key)}
                          onChange={(e) => handleSelectRow(key, record, e.target.checked)}
                          className='accent-[hsl(var(--primary))]'
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const colKey = col.dataIndex || col.key;
                      const cellValue = col.dataIndex ? record[col.dataIndex] : undefined;
                      return (
                        <td
                          key={colKey}
                          className={cn('px-3 py-2', col.fixed && 'sticky bg-background', col.fixed === 'left' && 'left-0', col.fixed === 'right' && 'right-0', col.align === 'center' && 'text-center', col.align === 'right' && 'text-right')}
                          style={{ width: col.width }}
                        >
                          {col.render ? col.render(cellValue, record, rowIdx) : (cellValue ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                  {expandedRowRender && isExpanded && (
                    <tr>
                      <td colSpan={columns.length + (rowSelection ? 1 : 0)} className='px-3 py-2 bg-muted/20'>
                        {expandedRowRender(record, rowIdx)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {usePagination && totalItems > pageSize && (
        <div className='flex items-center justify-between px-2 py-3'>
          <span className='text-xs text-muted-foreground'>共 {totalItems} 条</span>
          <div className='flex items-center gap-1'>
            <button type='button' disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)} className='px-2 py-1 text-sm rounded border disabled:opacity-40 hover:bg-muted'>‹</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button key={p} type='button' onClick={() => setCurrentPage(p)} className={cn('px-2 py-1 text-sm rounded border min-w-[28px]', p === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{p}</button>
            ))}
            <button type='button' disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)} className='px-2 py-1 text-sm rounded border disabled:opacity-40 hover:bg-muted'>›</button>
            {pagination?.showSizeChanger && pagination?.pageSizeOptions && (
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); pagination?.onPageSizeChange?.(Number(e.target.value)); }} className='ml-2 h-7 rounded border bg-background px-1 text-xs'>
                {pagination.pageSizeOptions.map((s) => <option key={s} value={s}>{s} 条/页</option>)}
              </select>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { Table };
export default Table;
