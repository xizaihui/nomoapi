// Compat layer: Semi Design SideSheet → shadcn/ui Sheet (Dialog-based)
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const SideSheet = ({ visible, onCancel, title, children, placement = 'right', width = 400, height, closable = true, mask = true, maskClosable = true, footer, headerStyle, bodyStyle, style, className, size, ...rest }) => {
  const handleOpenChange = (open) => {
    if (!open && onCancel) onCancel();
  };

  const placementClass = {
    right: 'inset-y-0 right-0 h-full border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
    left: 'inset-y-0 left-0 h-full border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
    top: 'inset-x-0 top-0 w-full border-b data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
    bottom: 'inset-x-0 bottom-0 w-full border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
  };

  const isHorizontal = placement === 'left' || placement === 'right';
  const sizeStyle = isHorizontal
    ? { width: typeof width === 'number' ? `${width}px` : width }
    : { height: typeof height === 'number' ? `${height}px` : (height || '400px') };

  return (
    <DialogPrimitive.Root open={visible} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        {mask && (
          <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />
        )}
        <DialogPrimitive.Content
          className={cn(
            'fixed z-50 bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out flex flex-col',
            placementClass[placement],
            className
          )}
          style={{ ...sizeStyle, ...style }}
          onInteractOutside={maskClosable ? undefined : (e) => e.preventDefault()}
        >
          {(title || closable) && (
            <div className={cn('flex items-center justify-between px-6 py-4 border-b')} style={headerStyle}>
              <DialogPrimitive.Title className='text-lg font-semibold'>{title}</DialogPrimitive.Title>
              {closable && (
                <DialogPrimitive.Close className='rounded-sm opacity-70 hover:opacity-100'>
                  <X className='h-4 w-4' />
                </DialogPrimitive.Close>
              )}
            </div>
          )}
          <div className='flex-1 overflow-auto px-6 py-4' style={bodyStyle}>
            {children}
          </div>
          {footer && <div className='px-6 py-4 border-t'>{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export { SideSheet };
export default SideSheet;
