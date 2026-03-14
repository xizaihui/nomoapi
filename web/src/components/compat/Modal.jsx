// Compat layer: maps Semi Design Modal API → shadcn/ui Dialog
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const Modal = ({
  visible,
  title,
  children,
  footer,
  onOk,
  onCancel,
  okText = 'OK',
  cancelText = 'Cancel',
  closable = true,
  maskClosable = true,
  width,
  centered = true,
  confirmLoading,
  okButtonProps,
  cancelButtonProps,
  hasCancel = true,
  className,
  bodyStyle,
  style,
  ...rest
}) => {
  const handleOpenChange = (open) => {
    if (!open && onCancel) onCancel();
  };

  const defaultFooter = (
    <DialogFooter>
      {hasCancel && (
        <Button variant='outline' onClick={onCancel} {...cancelButtonProps}>
          {cancelText}
        </Button>
      )}
      <Button onClick={onOk} disabled={confirmLoading} {...okButtonProps}>
        {confirmLoading && (
          <svg
            className='mr-2 h-4 w-4 animate-spin'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
          </svg>
        )}
        {okText}
      </Button>
    </DialogFooter>
  );

  return (
    <Dialog open={visible} onOpenChange={handleOpenChange}>
      <DialogContent
        className={className}
        style={{ ...(width ? { maxWidth: typeof width === 'number' ? `${width}px` : width } : {}), ...style }}
        onInteractOutside={maskClosable ? undefined : (e) => e.preventDefault()}
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <div style={bodyStyle}>{children}</div>
        {footer !== null && (footer || defaultFooter)}
      </DialogContent>
    </Dialog>
  );
};

// Semi Modal.confirm / Modal.info / Modal.warning / Modal.error / Modal.success stubs
// These need a portal-based imperative API — placeholder for Phase 1
const confirm = (config) => {
  console.warn('[compat] Modal.confirm is not yet implemented in shadcn compat layer');
};
const info = (config) => {
  console.warn('[compat] Modal.info is not yet implemented in shadcn compat layer');
};
const warning = (config) => {
  console.warn('[compat] Modal.warning is not yet implemented in shadcn compat layer');
};
const error = (config) => {
  console.warn('[compat] Modal.error is not yet implemented in shadcn compat layer');
};
const success = (config) => {
  console.warn('[compat] Modal.success is not yet implemented in shadcn compat layer');
};

Modal.confirm = confirm;
Modal.info = info;
Modal.warning = warning;
Modal.error = error;
Modal.success = success;

export { Modal };
export default Modal;
