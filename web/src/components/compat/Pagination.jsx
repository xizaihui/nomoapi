// Compat layer: Semi Design Pagination → simple pagination
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Pagination = ({ total = 0, pageSize = 10, currentPage = 1, onPageChange, showTotal, showSizeChanger, pageSizeOpts, onPageSizeChange, className, style, ...rest }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)} style={style} {...rest}>
      {showTotal && <span className='text-sm text-muted-foreground mr-2'>共 {total} 条</span>}
      <Button variant='outline' size='sm' disabled={currentPage <= 1} onClick={() => onPageChange?.(currentPage - 1)}>
        ‹
      </Button>
      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className='px-1 text-muted-foreground'>…</span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size='sm'
            onClick={() => onPageChange?.(page)}
            className='min-w-[32px]'
          >
            {page}
          </Button>
        )
      )}
      <Button variant='outline' size='sm' disabled={currentPage >= totalPages} onClick={() => onPageChange?.(currentPage + 1)}>
        ›
      </Button>
      {showSizeChanger && pageSizeOpts && (
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          className='h-8 rounded-md border border-input bg-background px-2 text-sm'
        >
          {pageSizeOpts.map((s) => (
            <option key={s} value={s}>{s} 条/页</option>
          ))}
        </select>
      )}
    </div>
  );
};

export { Pagination };
export default Pagination;
