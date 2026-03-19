// Compat layer: Semi Design Pagination → minimal text pagination with page size selector
import * as React from 'react';
import { cn } from '@/lib/utils';

const Pagination = ({ total = 0, pageSize = 10, currentPage = 1, onPageChange, showTotal, showSizeChanger, pageSizeOpts = [10, 20, 50, 100], onPageSizeChange, className, style, ...rest }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className={cn('flex items-center gap-4', className)} style={style} {...rest}>
      {/* Page size selector */}
      {showSizeChanger && pageSizeOpts?.length > 0 && (
        <div className='flex items-center gap-1.5'>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className='h-7 rounded-md border border-border bg-background px-1.5 text-xs text-foreground/70 cursor-pointer'
          >
            {pageSizeOpts.map((size) => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
        </div>
      )}

      {/* Page numbers */}
      <div className='flex items-center gap-0.5'>
        <button
          type='button'
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className='px-2 py-1 text-xs text-foreground/50 disabled:opacity-30 hover:text-foreground transition-colors'
        >
          ←
        </button>
        {getPageNumbers().map((page) => (
          <button
            key={page}
            type='button'
            onClick={() => onPageChange?.(page)}
            className={cn(
              'w-7 h-7 text-xs rounded transition-colors',
              page === currentPage
                ? 'bg-foreground text-background font-medium'
                : 'text-foreground/50 hover:text-foreground'
            )}
          >
            {page}
          </button>
        ))}
        <button
          type='button'
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className='px-2 py-1 text-xs text-foreground/50 disabled:opacity-30 hover:text-foreground transition-colors'
        >
          →
        </button>
      </div>
    </div>
  );
};

export { Pagination };
export default Pagination;
