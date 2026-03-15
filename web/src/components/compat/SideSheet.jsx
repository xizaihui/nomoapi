// Compat layer: Semi Design SideSheet → pure portal-based side panel
// Uses inline styles exclusively to avoid any CSS specificity/containment issues
import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

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
  closeOnEsc,
  ...rest
}) => {
  const [mounted, setMounted] = React.useState(false);
  const [animating, setAnimating] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
      // Lock body scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    } else {
      setAnimating(false);
      const timer = setTimeout(() => {
        setMounted(false);
        afterVisibleChange?.(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // ESC key
  React.useEffect(() => {
    if (!visible || closeOnEsc === false) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, closeOnEsc, onCancel]);

  if (!mounted && !keepDOM) return null;

  const isHorizontal = placement === 'left' || placement === 'right';
  const resolvedWidth = width || 680;
  const widthStr = typeof resolvedWidth === 'number' ? `${resolvedWidth}px` : resolvedWidth;
  const heightStr = height ? (typeof height === 'number' ? `${height}px` : height) : '400px';

  // All styles inline to avoid CSS containment issues
  const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
    pointerEvents: visible ? 'auto' : 'none',
  };

  const maskStyle = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    opacity: animating ? 1 : 0,
    transition: 'opacity 0.25s ease',
  };

  const panelPositionStyle = {
    right: { top: 0, right: 0, bottom: 0, width: widthStr, maxWidth: '100vw' },
    left: { top: 0, left: 0, bottom: 0, width: widthStr, maxWidth: '100vw' },
    top: { top: 0, left: 0, right: 0, height: heightStr },
    bottom: { bottom: 0, left: 0, right: 0, height: heightStr },
  };

  const transformMap = {
    right: animating ? 'translateX(0)' : 'translateX(100%)',
    left: animating ? 'translateX(0)' : 'translateX(-100%)',
    top: animating ? 'translateY(0)' : 'translateY(-100%)',
    bottom: animating ? 'translateY(0)' : 'translateY(100%)',
  };

  const panelStyle = {
    position: 'fixed',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--background, #fff)',
    color: 'var(--foreground, #000)',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
    transform: transformMap[placement],
    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    ...panelPositionStyle[placement],
    ...(isHorizontal ? { borderLeft: '1px solid var(--border, #e5e7eb)' } : { borderTop: '1px solid var(--border, #e5e7eb)' }),
    ...style,
  };

  const headerContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border, #e5e7eb)',
    flexShrink: 0,
    ...headerStyle,
  };

  const bodyContainerStyle = {
    flex: '1 1 auto',
    overflow: 'auto',
    padding: '16px 24px',
    ...bodyStyle,
  };

  const footerContainerStyle = {
    padding: '16px 24px',
    borderTop: '1px solid var(--border, #e5e7eb)',
    flexShrink: 0,
    backgroundColor: 'var(--background, #fff)',
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    opacity: 0.7,
    padding: '4px',
    marginLeft: '8px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    color: 'inherit',
  };

  const content = (
    <div style={overlayStyle}>
      {mask && (
        <div
          style={maskStyle}
          onClick={maskClosable ? onCancel : undefined}
        />
      )}
      <div
        style={panelStyle}
        role='dialog'
        aria-modal='true'
        className={className}
      >
        {(title || closable) && (
          <div style={headerContainerStyle}>
            <div style={{ fontSize: '18px', fontWeight: 600, flex: '1 1 auto', minWidth: 0 }}>{title}</div>
            {closable && closeIcon !== null && (
              <button
                type='button'
                onClick={onCancel}
                style={closeButtonStyle}
                aria-label='关闭'
                onMouseOver={(e) => { e.currentTarget.style.opacity = '1'; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = '0.7'; }}
              >
                {closeIcon || <X size={16} />}
              </button>
            )}
          </div>
        )}
        <div style={bodyContainerStyle}>
          {children}
        </div>
        {footer && <div style={footerContainerStyle}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

SideSheet.displayName = 'SideSheet';

export { SideSheet };
export default SideSheet;
