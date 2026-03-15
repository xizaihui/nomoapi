// Compat layer: Semi Design Popconfirm → AlertDialog
import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Popconfirm = ({ title, content, onConfirm, onCancel, okText = '确认', cancelText = '取消', okType = 'primary', children, position, disabled, ...rest }) => {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = () => {
    setOpen(false);
    onConfirm?.();
  };
  const handleCancel = () => {
    setOpen(false);
    onCancel?.();
  };

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <AlertDialogPrimitive.Trigger asChild disabled={disabled}>
        {children}
      </AlertDialogPrimitive.Trigger>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />
        <AlertDialogPrimitive.Content className='fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-sm duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out sm:rounded-lg'>
          {title && <AlertDialogPrimitive.Title className='text-base font-semibold'>{title}</AlertDialogPrimitive.Title>}
          {content && <AlertDialogPrimitive.Description className='text-sm text-muted-foreground'>{content}</AlertDialogPrimitive.Description>}
          <div className='flex justify-end gap-2'>
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant='outline' size='sm' onClick={handleCancel}>{cancelText}</Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button variant={okType === 'danger' ? 'destructive' : 'default'} size='sm' onClick={handleConfirm}>{okText}</Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
};

export { Popconfirm };
export default Popconfirm;
