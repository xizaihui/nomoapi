// Compat layer: Semi Design Card → shadcn/ui Card
import * as React from 'react';
import {
  Card as ShadcnCard,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const Card = React.forwardRef(
  ({ title, headerLine, headerExtraContent, children, footer, footerLine, footerStyle, bodyStyle, style, className, bordered = true, shadows, loading, cover, actions, headerStyle, ...rest }, ref) => {
    return (
      <ShadcnCard
        ref={ref}
        className={cn(!bordered && 'border-0', shadows === 'hover' && 'hover:shadow-sm transition-shadow', className)}
        style={style}
        {...rest}
      >
        {cover && <div className='overflow-hidden rounded-t-lg'>{cover}</div>}
        {(title || headerExtraContent) && (
          <CardHeader className={cn(headerLine && 'border-b')} style={headerStyle}>
            <div className='flex items-center justify-between'>
              {title && <CardTitle className='text-base'>{title}</CardTitle>}
              {headerExtraContent && <div>{headerExtraContent}</div>}
            </div>
          </CardHeader>
        )}
        <CardContent style={bodyStyle}>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent' />
            </div>
          ) : (
            children
          )}
        </CardContent>
        {(footer || actions) && (
          <CardFooter className={cn(footerLine && 'border-t')} style={footerStyle}>
            {footer || actions}
          </CardFooter>
        )}
      </ShadcnCard>
    );
  }
);
Card.displayName = 'Card';

// Semi Card.Meta compat
const Meta = ({ title, description, avatar, className, ...rest }) => (
  <div className={cn('flex items-start gap-3', className)} {...rest}>
    {avatar && <div>{avatar}</div>}
    <div>
      {title && <div className='font-medium'>{title}</div>}
      {description && <div className='text-sm text-muted-foreground'>{description}</div>}
    </div>
  </div>
);
Meta.displayName = 'Meta';

Card.Meta = Meta;

export { Card };
export default Card;
