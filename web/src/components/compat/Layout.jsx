// Compat layer: Semi Design Row/Col → flex/grid layout
import * as React from 'react';
import { cn } from '@/lib/utils';

const Row = React.forwardRef(({ children, gutter, type, justify, align, className, style, ...rest }, ref) => {
  const gutterPx = typeof gutter === 'number' ? gutter : Array.isArray(gutter) ? gutter[0] : 0;
  const gutterVPx = Array.isArray(gutter) ? gutter[1] : 0;

  const justifyMap = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    'space-between': 'justify-between',
    'space-around': 'justify-around',
    'space-evenly': 'justify-evenly',
  };
  const alignMap = {
    top: 'items-start',
    middle: 'items-center',
    bottom: 'items-end',
    stretch: 'items-stretch',
  };

  return (
    <div
      ref={ref}
      className={cn('flex flex-wrap', justifyMap[justify], alignMap[align], className)}
      style={{
        marginLeft: gutterPx ? `-${gutterPx / 2}px` : undefined,
        marginRight: gutterPx ? `-${gutterPx / 2}px` : undefined,
        rowGap: gutterVPx ? `${gutterVPx}px` : undefined,
        ...style,
      }}
      {...rest}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          __gutter: gutterPx,
        });
      })}
    </div>
  );
});
Row.displayName = 'Row';

const Col = React.forwardRef(({ children, span, offset, push, pull, order, xs, sm, md, lg, xl, xxl, className, style, __gutter, ...rest }, ref) => {
  const width = span !== undefined ? `${(span / 24) * 100}%` : undefined;
  const marginLeft = offset ? `${(offset / 24) * 100}%` : undefined;
  const paddingH = __gutter ? `${__gutter / 2}px` : undefined;

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        flex: span !== undefined ? `0 0 ${width}` : '1',
        maxWidth: width || '100%',
        marginLeft,
        paddingLeft: paddingH,
        paddingRight: paddingH,
        order,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});
Col.displayName = 'Col';

export { Row, Col };
