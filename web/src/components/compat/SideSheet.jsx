// Compat layer: Semi Design SideSheet → pure portal-based side panel
// No Radix Dialog dependency — avoids positioning/animation conflicts
import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const SideSheet = ({
  visible,
  onCancel,
  title,
  children,
  placement = 'right',
  width,
  height,
  closable = true,
  mask = true,
  maskClosable = true,
  footer,
  headerStyle,
  bodyStyle,
  style,
  className,
  size,
  closeIcon,
  afterVisibleChange,
  keepDOM,
  getPopupContainer,
  ...rest
}) => {
  const [mounted, setMounted] = React.useState(false);
  const [animating, setAnimating] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      // Trigger enter animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      const timer = setTimeout(() => {
        setMounted(false);
        afterVisibleChange?.(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!mounted && !keepDOM) return null;

  const isHorizontal = placement === 'left' || placement === 'right';
  const resolvedWidth = width || 680;
  const widthStr = typeof resolvedWidth === 'number' ? `${resolvedWidth}px` : resolvedWidth;
  const heightStr = height ? (typeof height === 'number' ? `${height}px` : height) : '400px';

  const panelStyle = {
    ...(isHorizontal ? { width: widthStr, maxWidth: '100vw' } : { height: heightStr }),
    ...style,
  };

  const positionClasses = {
    right: 'top-0 right-0 h-full',
    left: 'top-0 left-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full',
  };

  const transformHidden = {
    right: 'translateX(100%)',
    left: 'translateX(-100%)',
    top: 'translateY(-100%)',
    bottom: 'translateY(100%)',
  };

  const content = (
    <div className='fixed inset-0 z-50' style={{ pointerEvents: visible ? 'auto' : 'none' }}>
      {/* Overlay */}
      {mask && (
        <div
          className={cn(
            'absolute inset-0 bg-black/80 transition-opacity duration-200',
            animating ? 'opacity-100' : 'opacity-0'
          )}
          onClick={maskClosable ? onCancel : undefined}
        />
      )}
      {/* Panel */}
      <div
        className={cn(
          'absolute bg-background shadow-lg flex flex-col transition-transform duration-200 ease-out',
          positionClasses[placement],
          isHorizontal && 'border-l',
          className
        )}
        style={{
          ...panelStyle,
          transform: animating ? 'translate(0, 0)' : transformHidden[placement],
        }}
        role='dialog'
        aria-modal='true'
      >
        {/* Header */}
        {(title || closable) && (
          <div className='flex items-center justify-between px-6 py-4 border-b shrink-0' style={headerStyle}>
            <div className='text-lg font-semibold flex-1 min-w-0'>{title}</div>
            {closable && closeIcon !== null && (
              <button
                type='button'
                onClick={onCancel}
                className='rounded-sm opacity-70 hover:opacity-100 ml-2 shrink-0'
                aria-label='关闭'
              >
                {closeIcon || <X className='h-4 w-4' />}
              </button>
            )}
          </div>
        )}
        {/* Body */}
        <div className='flex-1 overflow-auto px-6 py-4' style={bodyStyle} data-slot='sheet-content'>
          {children}
        </div>
        {/* Footer */}
        {footer && <div className='px-6 py-4 border-t shrink-0'>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

SideSheet.displayName = 'SideSheet';

export { SideSheet };
export default SideSheet;
