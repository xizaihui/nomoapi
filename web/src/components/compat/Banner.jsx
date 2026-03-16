// Compat layer: Semi Design Banner → monochrome alert banner
import * as React from 'react';
import { cn } from '@/lib/utils';

const TYPE_MAP = {
  info: 'bg-muted/50 text-foreground border-border/50',
  warning: 'bg-muted/50 text-foreground border-border/50',
  danger: 'bg-foreground/5 text-foreground border-border/50',
  success: 'bg-muted/50 text-foreground border-border/50',
};

const Banner = ({ type = 'info', title, description, children, icon, closable, onClose, fullMode, bordered = true, className, style, closeIcon, ...rest }) => {
  const [visible, setVisible] = React.useState(true);
  if (!visible) return null;

  const showClose = closeIcon === null ? false : closable;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 rounded-lg p-3 text-sm',
        bordered && 'border',
        TYPE_MAP[type] || TYPE_MAP.info,
        fullMode && 'rounded-none',
        className
      )}
      style={style}
      role='alert'
      {...rest}
    >
      {icon && <div className='flex-shrink-0 mt-0.5 opacity-60'>{icon}</div>}
      <div className='flex-1 min-w-0'>
        {title && <div className='font-medium text-sm'>{title}</div>}
        {description && <div className='text-xs mt-0.5 text-foreground/65'>{description}</div>}
        {children}
      </div>
      {showClose && (
        <button type='button' onClick={handleClose} className='flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity'>
          ×
        </button>
      )}
    </div>
  );
};

export { Banner };
export default Banner;
