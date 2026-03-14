// Compat layer: Semi Design Banner → alert banner
import * as React from 'react';
import { cn } from '@/lib/utils';

const TYPE_MAP = {
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800',
  danger: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800',
  success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800',
};

const Banner = ({ type = 'info', title, description, children, icon, closable, onClose, fullMode, bordered = true, className, style, closeIcon, ...rest }) => {
  const [visible, setVisible] = React.useState(true);
  if (!visible) return null;

  // closeIcon={null} means explicitly hide close button
  const showClose = closeIcon === null ? false : closable;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 rounded-md p-3',
        bordered && 'border',
        TYPE_MAP[type] || TYPE_MAP.info,
        fullMode && 'rounded-none',
        className
      )}
      style={style}
      role='alert'
      {...rest}
    >
      {icon && <div className='flex-shrink-0 mt-0.5'>{icon}</div>}
      <div className='flex-1 min-w-0'>
        {title && <div className='font-medium'>{title}</div>}
        {description && <div className='text-sm mt-0.5 opacity-90'>{description}</div>}
        {children}
      </div>
      {closable && (
        <button type='button' onClick={handleClose} className='flex-shrink-0 opacity-60 hover:opacity-100'>
          ✕
        </button>
      )}
    </div>
  );
};

export { Banner };
export default Banner;
