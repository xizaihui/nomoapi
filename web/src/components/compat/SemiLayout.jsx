// Compat layer: Semi Design Layout → semantic layout components
import * as React from 'react';
import { cn } from '@/lib/utils';

const Layout = React.forwardRef(({ children, className, style, ...rest }, ref) => (
  <section ref={ref} className={cn('flex flex-col min-h-0', className)} style={style} {...rest}>
    {children}
  </section>
));
Layout.displayName = 'Layout';

const Header = React.forwardRef(({ children, className, style, ...rest }, ref) => (
  <header ref={ref} className={cn('flex-shrink-0', className)} style={style} {...rest}>
    {children}
  </header>
));
Header.displayName = 'Header';

const Content = React.forwardRef(({ children, className, style, ...rest }, ref) => (
  <main ref={ref} className={cn('flex-1 min-h-0', className)} style={style} {...rest}>
    {children}
  </main>
));
Content.displayName = 'Content';

const Footer = React.forwardRef(({ children, className, style, ...rest }, ref) => (
  <footer ref={ref} className={cn('flex-shrink-0', className)} style={style} {...rest}>
    {children}
  </footer>
));
Footer.displayName = 'Footer';

const Sider = React.forwardRef(({ children, className, style, ...rest }, ref) => (
  <aside ref={ref} className={cn('flex-shrink-0', className)} style={style} {...rest}>
    {children}
  </aside>
));
Sider.displayName = 'Sider';

Layout.Header = Header;
Layout.Content = Content;
Layout.Footer = Footer;
Layout.Sider = Sider;

export { Layout, Header, Content, Footer, Sider };
export default Layout;
