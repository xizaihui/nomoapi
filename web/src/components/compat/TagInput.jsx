// Compat layer: Semi Design TagInput → tag input with badges
import * as React from 'react';
import { cn } from '@/lib/utils';

const TagInput = React.forwardRef(
  ({ value, defaultValue, onChange, placeholder, disabled, separator = ',', maxTagCount, size, className, style, ...rest }, ref) => {
    const [tags, setTags] = React.useState(defaultValue || []);
    const [inputValue, setInputValue] = React.useState('');
    const isControlled = value !== undefined;
    const currentTags = isControlled ? value : tags;

    const addTag = (val) => {
      const trimmed = val.trim();
      if (!trimmed || currentTags.includes(trimmed)) return;
      const newTags = [...currentTags, trimmed];
      if (!isControlled) setTags(newTags);
      onChange?.(newTags);
    };

    const removeTag = (idx) => {
      const newTags = currentTags.filter((_, i) => i !== idx);
      if (!isControlled) setTags(newTags);
      onChange?.(newTags);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || (separator && e.key === separator)) {
        e.preventDefault();
        addTag(inputValue);
        setInputValue('');
      } else if (e.key === 'Backspace' && !inputValue && currentTags.length > 0) {
        removeTag(currentTags.length - 1);
      }
    };

    const handlePaste = (e) => {
      if (separator) {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        const parts = text.split(separator).map((s) => s.trim()).filter(Boolean);
        const newTags = [...new Set([...currentTags, ...parts])];
        if (!isControlled) setTags(newTags);
        onChange?.(newTags);
      }
    };

    const sizeClass = size === 'small' ? 'min-h-[32px] text-xs' : size === 'large' ? 'min-h-[44px] text-base' : 'min-h-[36px] text-sm';

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed',
          sizeClass,
          className
        )}
        style={style}
      >
        {currentTags.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className='inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground'
          >
            {tag}
            {!disabled && (
              <button type='button' onClick={() => removeTag(idx)} className='hover:opacity-70'>
                ✕
              </button>
            )}
          </span>
        ))}
        <input
          type='text'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={currentTags.length === 0 ? placeholder : ''}
          disabled={disabled}
          className='flex-1 min-w-[60px] bg-transparent outline-none placeholder:text-muted-foreground'
        />
      </div>
    );
  }
);
TagInput.displayName = 'TagInput';

export { TagInput };
export default TagInput;
