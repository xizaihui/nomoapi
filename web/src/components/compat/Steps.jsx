// Compat layer: Semi Design Steps → step indicator
import * as React from 'react';
import { cn } from '@/lib/utils';

const Steps = ({ current = 0, type = 'default', direction = 'horizontal', children, className, style, onChange, ...rest }) => {
  const steps = [];
  React.Children.forEach(children, (child, idx) => {
    if (React.isValidElement(child)) {
      steps.push({ ...child.props, index: idx });
    }
  });

  return (
    <div className={cn('flex gap-2', direction === 'vertical' ? 'flex-col' : 'flex-row items-center', className)} style={style} {...rest}>
      {steps.map((step, idx) => {
        const status = idx < current ? 'finish' : idx === current ? 'process' : 'wait';
        return (
          <React.Fragment key={idx}>
            {idx > 0 && direction !== 'vertical' && (
              <div className={cn('flex-1 h-px', status === 'wait' ? 'bg-border' : 'bg-primary')} />
            )}
            <div
              className={cn('flex items-center gap-2 cursor-pointer', onChange && 'hover:opacity-80')}
              onClick={() => onChange?.(idx)}
            >
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                status === 'finish' ? 'bg-primary text-primary-foreground' :
                status === 'process' ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              )}>
                {status === 'finish' ? '✓' : step.icon || idx + 1}
              </div>
              <div>
                <div className={cn('text-sm font-medium', status === 'wait' && 'text-muted-foreground')}>{step.title}</div>
                {step.description && <div className='text-xs text-muted-foreground'>{step.description}</div>}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Step = ({ title, description, icon, status }) => null;
Step.displayName = 'Step';
Steps.Step = Step;

export { Steps };
export default Steps;
