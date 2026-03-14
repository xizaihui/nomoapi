// Compat layer: Semi Design Tabs/TabPane → shadcn/ui Tabs
import * as React from 'react';
import {
  Tabs as ShadcnTabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const Tabs = ({ activeKey, defaultActiveKey, onChange, type, size, tabBarExtraContent, children, className, style, tabPosition = 'top', ...rest }) => {
  const handleChange = (val) => {
    if (onChange) onChange(val);
  };

  // Extract TabPane children
  const panes = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && (child.type === TabPane || child.props.tab !== undefined)) {
      panes.push(child);
    }
  });

  return (
    <ShadcnTabs
      value={activeKey}
      defaultValue={defaultActiveKey}
      onValueChange={handleChange}
      className={cn(className)}
      style={style}
      {...rest}
    >
      <div className={cn('flex items-center justify-between', tabPosition === 'left' && 'flex-row')}>
        <TabsList className={cn(type === 'card' && 'bg-transparent border-b rounded-none', type === 'button' && '')}>
          {panes.map((pane) => (
            <TabsTrigger
              key={pane.props.itemKey || pane.key}
              value={pane.props.itemKey || pane.key}
              disabled={pane.props.disabled}
              className={cn(type === 'card' && 'data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none')}
            >
              {pane.props.icon && <span className='mr-1.5'>{pane.props.icon}</span>}
              {pane.props.tab}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabBarExtraContent && <div>{tabBarExtraContent}</div>}
      </div>
      {panes.map((pane) => (
        <TabsContent key={pane.props.itemKey || pane.key} value={pane.props.itemKey || pane.key}>
          {pane.props.children}
        </TabsContent>
      ))}
    </ShadcnTabs>
  );
};

const TabPane = ({ children, tab, itemKey, disabled, icon, closable, ...rest }) => {
  // TabPane is just a data carrier; rendering is handled by Tabs
  return <>{children}</>;
};
TabPane.displayName = 'TabPane';

Tabs.TabPane = TabPane;

export { Tabs, TabPane };
export default Tabs;
