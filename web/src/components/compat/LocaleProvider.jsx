// Compat layer: Semi Design LocaleProvider → context wrapper (no-op passthrough)
import * as React from 'react';

const LocaleProvider = ({ locale, children, ...rest }) => {
  return <>{children}</>;
};

export { LocaleProvider };
export default LocaleProvider;
