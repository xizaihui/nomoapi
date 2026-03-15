// Compat layer: maps Semi Design Modal API → shadcn/ui Dialog + imperative API
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

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
  afterClose,
  header,
  size,
  fullScreen,
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

  const SIZE_MAP = {
    'full-width': '95vw',
    large: '860px',
    medium: '520px',
    small: '400px',
  };
  const resolvedWidth = fullScreen ? '95vw' : width || (size && SIZE_MAP[size]);

  return (
    <Dialog open={visible} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(fullScreen && 'max-h-[95vh]', size === 'full-width' && 'max-h-[95vh]', className)}
        style={{ ...(resolvedWidth ? { maxWidth: typeof resolvedWidth === 'number' ? `${resolvedWidth}px` : resolvedWidth, width: '100%' } : {}), ...style }}
        onInteractOutside={maskClosable ? undefined : (e) => e.preventDefault()}
        aria-describedby={undefined}
      >
        {title ? (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        ) : (
          <DialogHeader className='sr-only'>
            <DialogTitle>Dialog</DialogTitle>
          </DialogHeader>
        )}
        <div style={bodyStyle}>{children}</div>
        {footer !== null && (footer !== undefined ? footer : defaultFooter)}
      </DialogContent>
    </Dialog>
  );
};

// --- Imperative Modal API (confirm/info/warning/error/success) ---
const ICON_MAP = {
  confirm: { icon: HelpCircle, color: 'text-primary' },
  info: { icon: Info, color: 'text-foreground/80' },
  warning: { icon: AlertTriangle, color: 'text-foreground/70' },
  error: { icon: XCircle, color: 'text-destructive' },
  success: { icon: CheckCircle2, color: 'text-foreground/70' },
};

function createImperativeModal(type, config) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  let closed = false;
  let setOpenRef = null;

  const handle = {
    destroy: () => {
      if (closed) return;
      closed = true;
      // Try graceful close first
      if (setOpenRef) {
        setOpenRef(false);
        setTimeout(() => {
          try { root.unmount(); } catch(e) {}
          container.remove();
          config.afterClose?.();
        }, 200);
      } else {
        try { root.unmount(); } catch(e) {}
        container.remove();
        config.afterClose?.();
      }
    },
    update: (newConfig) => {
      Object.assign(config, newConfig);
      // Re-render not implemented for simplicity
    },
  };

  const { icon: IconComp, color } = ICON_MAP[type] || ICON_MAP.info;

  const ImperativeModalContent = () => {
    const [open, setOpen] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    setOpenRef = setOpen;

    const handleOk = async () => {
      const result = config.onOk?.();
      if (result && typeof result.then === 'function') {
        setLoading(true);
        try {
          await result;
        } catch (e) {
          // ignore
        }
        setLoading(false);
      }
      setOpen(false);
      setTimeout(() => handle.destroy(), 200);
    };

    const handleCancel = () => {
      config.onCancel?.();
      setOpen(false);
      setTimeout(() => handle.destroy(), 200);
    };

    const showCancel = type === 'confirm' || config.hasCancel;
    const hasCustomFooter = config.footer !== undefined;

    return (
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); }}>
        <DialogContent
          className={config.className}
          style={config.width ? { maxWidth: typeof config.width === 'number' ? `${config.width}px` : config.width } : undefined}
          onInteractOutside={config.maskClosable === false ? (e) => e.preventDefault() : undefined}
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              {!hasCustomFooter && <IconComp className={cn('h-5 w-5', color)} />}
              {config.title || ''}
            </DialogTitle>
          </DialogHeader>
          {config.content && (
            <div className='text-sm text-muted-foreground py-2'>
              {config.content}
            </div>
          )}
          {hasCustomFooter ? (
            config.footer !== null ? config.footer : null
          ) : (
            <DialogFooter>
              {showCancel && (
                <Button variant='outline' onClick={handleCancel}>
                  {config.cancelText || '取消'}
                </Button>
              )}
              <Button
                onClick={handleOk}
                disabled={loading}
                variant={type === 'error' ? 'destructive' : 'default'}
                {...config.okButtonProps}
              >
                {loading && (
                  <svg className='mr-2 h-4 w-4 animate-spin' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                  </svg>
                )}
                {config.okText || '确定'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  root.render(<ImperativeModalContent />);

  return handle;
}

Modal.confirm = (config) => createImperativeModal('confirm', config);
Modal.info = (config) => createImperativeModal('info', config);
Modal.warning = (config) => createImperativeModal('warning', config);
Modal.error = (config) => createImperativeModal('error', config);
Modal.success = (config) => createImperativeModal('success', config);

export { Modal };
export default Modal;
