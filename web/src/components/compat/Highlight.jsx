// Compat layer: Semi Design Highlight → simple text highlighter
import * as React from 'react';

const Highlight = ({ sourceString = '', searchWords = [], highlightStyle, highlightClassName, ...rest }) => {
  if (!searchWords.length || !sourceString) return <>{sourceString}</>;

  const escaped = searchWords.filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!escaped.length) return <>{sourceString}</>;

  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = sourceString.split(regex);

  return (
    <span {...rest}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className={highlightClassName || 'bg-yellow-200 dark:bg-yellow-800'} style={highlightStyle}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </span>
  );
};

export { Highlight };
export default Highlight;
