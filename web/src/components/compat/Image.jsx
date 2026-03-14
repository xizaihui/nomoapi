// Compat layer: Semi Design Image/ImagePreview → native img with preview
import * as React from 'react';
import { cn } from '@/lib/utils';

const Image = React.forwardRef(({ src, alt, width, height, preview = true, fallback, className, style, onClick, ...rest }, ref) => {
  const [error, setError] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);

  return (
    <>
      <img
        ref={ref}
        src={error && fallback ? fallback : src}
        alt={alt || ''}
        width={width}
        height={height}
        className={cn('object-cover', preview && 'cursor-pointer', className)}
        style={style}
        onClick={(e) => {
          if (preview) setShowPreview(true);
          onClick?.(e);
        }}
        onError={() => setError(true)}
        {...rest}
      />
      {showPreview && (
        <div
          className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/80'
          onClick={() => setShowPreview(false)}
        >
          <img src={src} alt={alt || ''} className='max-h-[90vh] max-w-[90vw] object-contain' />
          <button
            type='button'
            className='absolute top-4 right-4 text-white text-2xl hover:opacity-70'
            onClick={() => setShowPreview(false)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
});
Image.displayName = 'Image';

// Semi Image.PreviewGroup
const PreviewGroup = ({ children, ...rest }) => <>{children}</>;
Image.PreviewGroup = PreviewGroup;

const ImagePreview = ({ src, visible, onVisibleChange, children, ...rest }) => {
  const [show, setShow] = React.useState(false);
  const isControlled = visible !== undefined;
  const isVisible = isControlled ? visible : show;

  const handleClose = () => {
    if (!isControlled) setShow(false);
    onVisibleChange?.(false);
  };

  return (
    <>
      {children && (
        <span onClick={() => { if (!isControlled) setShow(true); onVisibleChange?.(true); }} className='cursor-pointer'>
          {children}
        </span>
      )}
      {isVisible && (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/80' onClick={handleClose}>
          {Array.isArray(src) ? (
            <img src={src[0]} alt='' className='max-h-[90vh] max-w-[90vw] object-contain' />
          ) : (
            <img src={src} alt='' className='max-h-[90vh] max-w-[90vw] object-contain' />
          )}
          <button type='button' className='absolute top-4 right-4 text-white text-2xl hover:opacity-70' onClick={handleClose}>
            ✕
          </button>
        </div>
      )}
    </>
  );
};

export { Image, ImagePreview };
