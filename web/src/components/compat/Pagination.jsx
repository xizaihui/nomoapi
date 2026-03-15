// Compat layer: Semi Design Pagination → minimal text pagination
import * as React from 'react';
import { cn } from '@/lib/utils';

const Pagination = ({ total = 0, pageSize = 10, currentPage = 1, onPageChange, showTotal, showSizeChanger, pageSizeOpts, onPageSizeChange, className, style, ...rest }) => {
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
    <div className={cn('flex items-center justify-between', className)} style={style} {...rest}>
      <span className='text-xs text-muted-foreground/60 tabular-nums'>
        {total} results
      </span>
      <div className='flex items-center gap-0.5'>
        <button
          type='button'
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className='px-2 py-1 text-xs text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors'
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
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {page}
          </button>
        ))}
        <button
          type='button'
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className='px-2 py-1 text-xs text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors'
        >
          →
        </button>
      </div>
    </div>
  );
};

export { Pagination };
export default Pagination;
