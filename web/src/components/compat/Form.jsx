// Compat layer: Semi Design Form → lightweight form with formApi
import * as React from 'react';
import { cn } from '@/lib/utils';

// --- Form Context ---
const FormContext = React.createContext(null);

const useFormApi = () => React.useContext(FormContext);

// --- formApi implementation ---
const createFormApi = (valuesRef, setValues, onValueChange, rulesRef, submitRef) => ({
  getValues: () => ({ ...valuesRef.current }),
  getValue: (field) => valuesRef.current[field],
  setValue: (field, value) => {
    valuesRef.current[field] = value;
    setValues((prev) => ({ ...prev, [field]: value }));
    onValueChange?.({ [field]: value }, { ...valuesRef.current });
  },
  setValues: (newValues) => {
    Object.assign(valuesRef.current, newValues);
    setValues((prev) => ({ ...prev, ...newValues }));
    onValueChange?.(newValues, { ...valuesRef.current });
  },
  reset: (fields) => {
    if (fields) {
      fields.forEach((f) => { valuesRef.current[f] = undefined; });
      setValues((prev) => {
        const next = { ...prev };
        fields.forEach((f) => { next[f] = undefined; });
        return next;
      });
    } else {
      valuesRef.current = {};
      setValues({});
    }
  },
  validate: () => Promise.resolve(valuesRef.current),
  setError: () => {},
  getError: () => undefined,
  scrollToField: () => {},
  submitForm: () => { submitRef.current?.(); },
});

// --- Form ---
const Form = React.forwardRef(({
  children,
  initValues,
  onValueChange,
  onSubmit,
  onChange,
  getFormApi: getFormApiProp,
  layout = 'vertical',
  labelPosition,
  labelWidth,
  labelAlign,
  labelCol,
  wrapperCol,
  className,
  style,
  render,
  component,
  allowEmpty,
  validateFields,
  trigger,
  ...rest
}, ref) => {
  const [values, setValues] = React.useState(initValues || {});
  const valuesRef = React.useRef(initValues || {});
  const rulesRef = React.useRef({});
  const submitRef = React.useRef(null);

  // Keep ref in sync
  React.useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const formApi = React.useMemo(
    () => createFormApi(valuesRef, setValues, onValueChange, rulesRef, submitRef),
    [onValueChange]
  );

  // Expose formApi
  React.useEffect(() => {
    getFormApiProp?.(formApi);
  }, [formApi, getFormApiProp]);

  React.useImperativeHandle(ref, () => formApi, [formApi]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    onSubmit?.(valuesRef.current);
  };

  // Keep submitRef pointing to latest handleSubmit
  submitRef.current = handleSubmit;

  const effectiveLayout = labelPosition === 'left' ? 'horizontal' : (layout || 'vertical');

  const ctx = {
    formApi,
    values,
    layout: effectiveLayout,
    labelWidth,
    labelAlign,
    labelCol,
    wrapperCol,
  };

  const Tag = component || 'form';

  return (
    <FormContext.Provider value={ctx}>
      <Tag
        ref={component ? undefined : ref}
        className={cn(className)}
        style={style}
        onSubmit={Tag === 'form' ? handleSubmit : undefined}
        {...rest}
      >
        {typeof render === 'function' ? render({ formApi, values }) : (typeof children === 'function' ? children({ formApi, values }) : children)}
      </Tag>
    </FormContext.Provider>
  );
});
Form.displayName = 'Form';

// --- Form Field wrapper ---
const FormField = ({
  field,
  label,
  children,
  required,
  rules,
  helpText,
  extraText,
  noLabel,
  labelPosition: fieldLabelPosition,
  className,
  style,
  initValue,
  trigger = 'onChange',
  convert,
  validate,
  pure,
  name,
  _noInject,
  ...rest
}) => {
  const ctx = useFormApi();
  if (!ctx) return children;

  const { formApi, values, layout, labelWidth } = ctx;
  const fieldName = field || name;

  // Init value
  React.useEffect(() => {
    if (initValue !== undefined && fieldName && formApi.getValue(fieldName) === undefined) {
      formApi.setValue(fieldName, initValue);
    }
  }, []);

  const value = fieldName ? values[fieldName] : undefined;

  const handleChange = (val) => {
    if (fieldName) {
      const converted = convert ? convert(val) : val;
      formApi.setValue(fieldName, converted);
    }
  };

  const isHorizontal = (fieldLabelPosition || layout) === 'horizontal';

  return (
    <div
      className={cn(
        pure ? 'mb-0' : 'mb-4',
        isHorizontal ? 'flex items-start gap-3' : '',
        className
      )}
      style={style}
    >
      {!noLabel && label && (
        <label
          className={cn(
            'text-xs font-medium text-foreground/70',
            isHorizontal ? 'flex-shrink-0 pt-2' : 'block mb-1.5',
            required && "after:content-['*'] after:ml-0.5 after:text-destructive"
          )}
          style={labelWidth ? { width: labelWidth } : undefined}
        >
          {label}
        </label>
      )}
      <div className={cn(isHorizontal && 'flex-1')}>
        {_noInject
          ? children
          : typeof children === 'function'
            ? children({ value, onChange: handleChange, formApi, values })
            : React.isValidElement(children)
              ? React.cloneElement(children, { value, [trigger]: handleChange })
              : children
        }
        {helpText && <div className='text-xs text-foreground/55 mt-1'>{helpText}</div>}
        {extraText && <div className='text-xs text-foreground/55 mt-1'>{extraText}</div>}
      </div>
    </div>
  );
};

// --- Form.Input ---
const FormInput = ({ field, label, prefix, suffix, mode, addonBefore, addonAfter, showClear, onEnterPress, onChange: onChangeProp, value: valueProp, ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const formValue = field ? (values[field] ?? '') : '';
  const value = valueProp !== undefined ? valueProp : formValue;
  const inputType = mode === 'password' ? 'password' : 'text';
  const { placeholder, disabled, className: inputClassName, style: inputStyle, size, initValue, rules, helpText, extraText, noLabel, labelPosition, convert, validate: _v, pure, trigger, required, name, ...safeRest } = rest;
  return (
    <FormField field={field} label={label} required={required} helpText={helpText} extraText={extraText} noLabel={noLabel} labelPosition={labelPosition} pure={pure} _noInject>
      <div className='flex items-center w-full rounded-md border border-border bg-background transition-colors focus-within:border-foreground/30'>
        {prefix && <span className='flex items-center pl-3 text-foreground/55'>{prefix}</span>}
        <input
          id={field}
          type={inputType}
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            if (field) formApi.setValue(field, val);
            // Semi onChange signature: (value, e) => void
            if (onChangeProp) onChangeProp(val, e);
          }}
          onKeyDown={(e) => { if (e.key === 'Enter' && onEnterPress) onEnterPress(e); }}
          placeholder={placeholder}
          disabled={disabled}
          style={inputStyle}
          className='flex h-9 w-full bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
        />
        {suffix && <span className='flex items-center pr-3 text-foreground/55'>{suffix}</span>}
      </div>
    </FormField>
  );
};

// --- Form.TextArea ---
const FormTextArea = ({ field, label, autosize, maxCount, onChange: onChangeProp, ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const value = field ? (values[field] ?? '') : '';
  const { placeholder, disabled, className: cls, style, rows: rowsProp, initValue, rules, helpText, extraText, noLabel, labelPosition, convert, validate: _v, pure, trigger, required, ...safeRest } = rest;
  const textareaRef = React.useRef(null);

  // Compute rows from autosize prop
  const minRows = autosize ? (typeof autosize === 'object' ? autosize.minRows || 3 : 3) : (rowsProp || 3);
  const maxRows = autosize ? (typeof autosize === 'object' ? autosize.maxRows || 20 : 20) : undefined;

  // Auto-resize effect
  React.useEffect(() => {
    if (!autosize || !textareaRef.current) return;
    const el = textareaRef.current;
    el.style.height = 'auto';
    const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 20;
    const minH = minRows * lineHeight + 16; // 16 for padding
    const maxH = maxRows ? maxRows * lineHeight + 16 : Infinity;
    const scrollH = el.scrollHeight;
    el.style.height = Math.min(Math.max(scrollH, minH), maxH) + 'px';
  }, [value, autosize, minRows, maxRows]);

  return (
    <FormField field={field} label={label} required={required} helpText={helpText} extraText={extraText} noLabel={noLabel} labelPosition={labelPosition} pure={pure} _noInject>
      <textarea
        id={field}
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          if (field) formApi.setValue(field, e.target.value);
          if (onChangeProp) onChangeProp(e.target.value);
        }}
        placeholder={placeholder}
        disabled={disabled}
        rows={minRows}
        style={{ ...style, overflow: autosize ? 'hidden' : undefined, resize: autosize ? 'none' : undefined }}
        className='flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-foreground/30 disabled:cursor-not-allowed disabled:opacity-50'
      />
    </FormField>
  );
};

// --- Form.InputNumber ---
const FormInputNumber = ({ field, label, min, max, step, prefix, suffix, ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const value = field ? (values[field] ?? '') : '';
  const { placeholder, disabled, style, initValue, rules, helpText, extraText, noLabel, labelPosition, convert, validate: _v, pure, trigger, required, ...safeRest } = rest;
  return (
    <FormField field={field} label={label} required={required} helpText={helpText} extraText={extraText} noLabel={noLabel} labelPosition={labelPosition} pure={pure} _noInject>
      <input
        type='number'
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => field && formApi.setValue(field, e.target.value === '' ? undefined : Number(e.target.value))}
        placeholder={placeholder}
        disabled={disabled}
        style={style}
        className='flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-foreground/30 disabled:cursor-not-allowed disabled:opacity-50'
      />
    </FormField>
  );
};

// --- Form.Select ---
const FormSelect = ({ field, label, optionList, children, multiple, filter, placeholder, disabled, onChange: onChangeProp, showClear, loading, allowCreate, renderSelectedItem, onSearch, innerBottomSlot, searchPosition, autoClearSearchValue, allowAdditions, additionLabel, ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const rawValue = field ? values[field] : undefined;
  const { initValue, rules, helpText, extraText, noLabel, labelPosition, convert, validate: _v, pure, trigger, required, style, className: cls, size, ...safeRest } = rest;

  // Collect options from children (Select.Option) or optionList
  const options = React.useMemo(() => {
    if (optionList) return optionList;
    const opts = [];
    React.Children.forEach(children, (child) => {
      if (child && child.props) {
        opts.push({ value: child.props.value ?? '', label: child.props.children || child.props.value });
      }
    });
    return opts;
  }, [optionList, children]);

  // --- Multiple select mode ---
  if (multiple) {
    const selected = Array.isArray(rawValue) ? rawValue : (rawValue ? [rawValue] : []);
    const [searchVal, setSearchVal] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef(null);
    const inputRef = React.useRef(null);

    // Close dropdown on outside click
    React.useEffect(() => {
      const handler = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filteredOptions = React.useMemo(() => {
      let opts = options;
      if (searchVal && filter !== false) {
        const q = searchVal.toLowerCase();
        opts = opts.filter((o) => String(o.label || o.value).toLowerCase().includes(q));
      }
      return opts;
    }, [options, searchVal, filter]);

    const updateValue = (newArr) => {
      if (field) formApi.setValue(field, newArr);
      if (onChangeProp) onChangeProp(newArr);
    };

    const toggleOption = (optValue) => {
      const strVal = String(optValue);
      const next = selected.includes(strVal)
        ? selected.filter((v) => v !== strVal)
        : [...selected, strVal];
      updateValue(next);
    };

    const removeTag = (val) => {
      updateValue(selected.filter((v) => v !== val));
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && searchVal.trim()) {
        e.preventDefault();
        const trimmed = searchVal.trim();
        if (allowCreate || allowAdditions) {
          if (!selected.includes(trimmed)) {
            updateValue([...selected, trimmed]);
          }
        } else {
          // Select first matching option
          const match = filteredOptions.find((o) => !selected.includes(String(o.value)));
          if (match) toggleOption(match.value);
        }
        if (autoClearSearchValue !== false) setSearchVal('');
      } else if (e.key === 'Backspace' && !searchVal && selected.length > 0) {
        updateValue(selected.slice(0, -1));
      }
    };

    const getLabel = (val) => {
      const opt = options.find((o) => String(o.value) === String(val));
      return opt ? (opt.label || opt.value) : val;
    };

    return (
      <FormField field={field} label={label} required={required} helpText={helpText} extraText={extraText} noLabel={noLabel} labelPosition={labelPosition} pure={pure} _noInject>
        <div ref={containerRef} className='relative' style={style}>
          <div
            className='flex flex-wrap items-center gap-1 min-h-[36px] w-full rounded-md border border-border bg-background px-2 py-1 text-sm focus-within:border-foreground/30 cursor-text'
            onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}
          >
            {selected.map((val) => {
              let tagContent = getLabel(val);
              if (renderSelectedItem) {
                const result = renderSelectedItem({ value: val, label: getLabel(val) });
                if (result && result.content) tagContent = result.content;
              }
              return (
                <span key={val} className='inline-flex items-center gap-1 bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 text-xs max-w-[200px]'>
                  <span className='truncate'>{tagContent}</span>
                  <button type='button' className='ml-0.5 hover:text-destructive' onClick={(e) => { e.stopPropagation(); removeTag(val); }}>×</button>
                </span>
              );
            })}
            <input
              ref={inputRef}
              type='text'
              value={searchVal}
              onChange={(e) => { setSearchVal(e.target.value); onSearch?.(e.target.value); }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={selected.length === 0 ? placeholder : ''}
              disabled={disabled || loading}
              className='flex-1 min-w-[60px] bg-transparent outline-none text-sm placeholder:text-muted-foreground'
            />
            {showClear && selected.length > 0 && (
              <button type='button' className='text-foreground/45 hover:text-foreground ml-1' onClick={(e) => { e.stopPropagation(); updateValue([]); }}>×</button>
            )}
          </div>
          {isOpen && (
            <div className='absolute z-[9999] mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover shadow-sm'>
              {filteredOptions.length === 0 && !allowCreate && !allowAdditions ? (
                <div className='px-3 py-2 text-sm text-foreground/50'>
                  {searchVal ? '无匹配结果' : '无选项'}
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = selected.includes(String(opt.value));
                  return (
                    <div
                      key={String(opt.value)}
                      className={cn(
                        'flex items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-muted',
                        isSelected && 'bg-muted'
                      )}
                      onClick={() => toggleOption(opt.value)}
                    >
                      <span className={cn('mr-2 w-4 text-center', isSelected ? 'text-foreground' : 'text-transparent')}>✓</span>
                      <span className='truncate'>{opt.label || opt.value}</span>
                    </div>
                  );
                })
              )}
              {(allowCreate || allowAdditions) && searchVal.trim() && !options.some((o) => String(o.value) === searchVal.trim()) && (
                <div
                  className='flex items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-muted text-foreground'
                  onClick={() => {
                    const trimmed = searchVal.trim();
                    if (!selected.includes(trimmed)) updateValue([...selected, trimmed]);
                    if (autoClearSearchValue !== false) setSearchVal('');
                  }}
                >
                  {additionLabel || '创建 '}{searchVal.trim()}
                </div>
              )}
              {innerBottomSlot}
            </div>
          )}
        </div>
        {extraText && <div className='text-xs text-foreground/55 mt-1'>{extraText}</div>}
      </FormField>
    );
  }

  // --- Single select mode ---
  // Build a lookup to recover original typed values (numbers, booleans)
  const valueTypeMap = React.useMemo(() => {
    const m = new Map();
    options.forEach((opt) => m.set(String(opt.value), opt.value));
    return m;
  }, [options]);

  const value = rawValue ?? '';
  return (
    <FormField field={field} label={label} required={required} helpText={helpText} extraText={extraText} noLabel={noLabel} labelPosition={labelPosition} pure={pure} _noInject>
      <select
        value={value}
        onChange={(e) => {
          const strVal = e.target.value;
          // Recover original type (e.g. number) from option list
          const val = valueTypeMap.has(strVal) ? valueTypeMap.get(strVal) : strVal;
          if (field) formApi.setValue(field, val);
          if (onChangeProp) onChangeProp(val);
        }}
        disabled={disabled || loading}
        style={style}
        className='flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:border-foreground/30 disabled:cursor-not-allowed disabled:opacity-50'
      >
        {placeholder && !value && <option value=''>{placeholder}</option>}
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </FormField>
  );
};

// --- Form.Switch ---
const FormSwitch = ({ field, label, checkedText, uncheckedText, ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const checked = field ? (values[field] ?? false) : false;
  const { initValue, rules, helpText, extraText, noLabel, labelPosition, convert, validate: _v, pure, trigger, required, disabled, ...safeRest } = rest;
  return (
    <FormField field={field} label={label} required={required} helpText={helpText} extraText={extraText} noLabel={noLabel} labelPosition={labelPosition} pure={pure} _noInject>
      <button
        type='button'
        role='switch'
        aria-checked={checked}
        disabled={disabled}
        onClick={() => field && formApi.setValue(field, !checked)}
        className={cn(
          'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:border-foreground/30',
          checked ? 'bg-foreground' : 'bg-muted',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className={cn('pointer-events-none block h-4 w-4 rounded-full bg-background shadow-sm ring-0 transition-transform', checked ? 'translate-x-4' : 'translate-x-0')} />
      </button>
    </FormField>
  );
};

// --- Form.Checkbox ---
const FormCheckbox = ({ field, label, ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const checked = field ? (values[field] ?? false) : false;
  const { initValue, rules, helpText, extraText, noLabel, labelPosition, convert, validate: _v, pure, trigger, required, disabled, ...safeRest } = rest;
  return (
    <FormField field={field} label={label} noLabel required={required} helpText={helpText} extraText={extraText} labelPosition={labelPosition} pure={pure} _noInject>
      <label className='flex items-center gap-2 cursor-pointer'>
        <input
          type='checkbox'
          checked={checked}
          disabled={disabled}
          onChange={(e) => field && formApi.setValue(field, e.target.checked)}
          className='h-4 w-4 rounded border-border accent-[hsl(var(--primary))]'
        />
        {label && <span className='text-sm'>{label}</span>}
      </label>
    </FormField>
  );
};

// --- Form.RadioGroup ---
const FormRadioGroup = ({ field, label, options, direction, ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const value = field ? values[field] : undefined;
  const { initValue, rules, helpText, extraText, noLabel, labelPosition, convert, validate: _v, pure, trigger, required, disabled, ...safeRest } = rest;
  return (
    <FormField field={field} label={label} required={required} helpText={helpText} extraText={extraText} noLabel={noLabel} labelPosition={labelPosition} pure={pure} _noInject>
      <div className={cn('flex gap-3', direction === 'vertical' ? 'flex-col' : 'flex-wrap')}>
        {(options || []).map((opt) => {
          const optValue = typeof opt === 'string' ? opt : opt.value;
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          return (
            <label key={optValue} className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                checked={value === optValue}
                disabled={disabled}
                onChange={() => field && formApi.setValue(field, optValue)}
                className='h-4 w-4 accent-[hsl(var(--primary))]'
              />
              <span className='text-sm'>{optLabel}</span>
            </label>
          );
        })}
      </div>
    </FormField>
  );
};

// --- Form.DatePicker ---
const FormDatePicker = ({ field, label, type = 'date', presets, showClear, placeholder, ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const value = field ? (values[field] ?? (type === 'dateTimeRange' || type === 'dateRange' ? [null, null] : '')) : '';
  const { initValue, rules, helpText, extraText, noLabel, labelPosition, convert, validate: _v, pure, trigger, required, size, className: cls, ...safeRest } = rest;

  const isRange = type === 'dateTimeRange' || type === 'dateRange';
  const inputType = type === 'dateTime' || type === 'dateTimeRange' ? 'datetime-local' : 'date';

  const formatForInput = (d) => {
    if (!d) return '';
    if (d instanceof Date) {
      if (inputType === 'datetime-local') {
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
      return d.toISOString().split('T')[0];
    }
    return String(d);
  };

  if (isRange) {
    const rangeVal = Array.isArray(value) ? value : [null, null];
    const placeholders = Array.isArray(placeholder) ? placeholder : ['开始', '结束'];

    const handleRangeChange = (idx, newVal) => {
      const updated = [...rangeVal];
      updated[idx] = newVal ? new Date(newVal) : null;
      if (field) formApi.setValue(field, updated);
    };

    const handleClear = () => {
      if (field) formApi.setValue(field, [null, null]);
    };

    const applyPreset = (preset) => {
      if (field) formApi.setValue(field, [preset.start, preset.end]);
    };

    return (
      <FormField field={field} label={label} required={required} helpText={helpText} extraText={extraText} noLabel={noLabel} labelPosition={labelPosition} pure={pure} _noInject>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-1'>
            <input
              type={inputType}
              value={formatForInput(rangeVal[0])}
              onChange={(e) => handleRangeChange(0, e.target.value)}
              placeholder={placeholders[0]}
              className='flex h-8 flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:border-foreground/30'
            />
            <span className='text-foreground/50 text-xs'>~</span>
            <input
              type={inputType}
              value={formatForInput(rangeVal[1])}
              onChange={(e) => handleRangeChange(1, e.target.value)}
              placeholder={placeholders[1]}
              className='flex h-8 flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:border-foreground/30'
            />
            {showClear && (rangeVal[0] || rangeVal[1]) && (
              <button type='button' onClick={handleClear} className='text-foreground/45 hover:text-foreground text-xs px-1'>✕</button>
            )}
          </div>
          {presets && presets.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type='button'
                  onClick={() => applyPreset(preset)}
                  className='text-xs px-2 py-0.5 rounded border border-border bg-background hover:bg-muted text-foreground/50 hover:text-foreground transition-colors'
                >
                  {preset.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </FormField>
    );
  }

  // Single date/datetime
  return (
    <FormField field={field} label={label} required={required} helpText={helpText} extraText={extraText} noLabel={noLabel} labelPosition={labelPosition} pure={pure} _noInject>
      <div className='flex items-center gap-1'>
        <input
          type={inputType}
          value={formatForInput(value)}
          onChange={(e) => field && formApi.setValue(field, e.target.value ? new Date(e.target.value) : null)}
          placeholder={typeof placeholder === 'string' ? placeholder : undefined}
          className='flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:border-foreground/30'
        />
        {showClear && value && (
          <button type='button' onClick={() => field && formApi.setValue(field, null)} className='text-foreground/45 hover:text-foreground text-sm px-1'>✕</button>
        )}
      </div>
    </FormField>
  );
};

// --- Form.AutoComplete ---
const FormAutoComplete = ({ field, label, data = [], ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const value = field ? (values[field] ?? '') : '';
  return (
    <FormField field={field} label={label} {...rest}>
      <input
        type='text'
        value={value}
        onChange={(e) => field && formApi.setValue(field, e.target.value)}
        list={`autocomplete-${field}`}
        className='flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:border-foreground/30'
      />
      <datalist id={`autocomplete-${field}`}>
        {data.map((item) => (
          <option key={typeof item === 'string' ? item : item.value} value={typeof item === 'string' ? item : item.value}>
            {typeof item === 'string' ? item : item.label}
          </option>
        ))}
      </datalist>
    </FormField>
  );
};

// --- Form.Upload ---
const FormUpload = ({ field, label, action, accept, children, ...rest }) => {
  return (
    <FormField field={field} label={label} {...rest}>
      <input type='file' accept={accept} className='text-sm' />
    </FormField>
  );
};

// --- Form.TagInput ---
const FormTagInput = ({ field, label, ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const value = field ? (values[field] ?? []) : [];
  const [inputVal, setInputVal] = React.useState('');

  const addTag = (v) => {
    const trimmed = v.trim();
    if (!trimmed || value.includes(trimmed)) return;
    const newTags = [...value, trimmed];
    formApi.setValue(field, newTags);
  };

  const removeTag = (idx) => {
    const newTags = value.filter((_, i) => i !== idx);
    formApi.setValue(field, newTags);
  };

  return (
    <FormField field={field} label={label} {...rest}>
      <div className='flex flex-wrap items-center gap-1 rounded-md border border-border bg-background px-2 py-1 min-h-[36px]'>
        {value.map((tag, idx) => (
          <span key={`${tag}-${idx}`} className='inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium'>
            {tag}
            <button type='button' onClick={() => removeTag(idx)} className='hover:opacity-70'>✕</button>
          </span>
        ))}
        <input
          type='text'
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(inputVal); setInputVal(''); } }}
          placeholder={value.length === 0 ? rest.placeholder : ''}
          className='flex-1 min-w-[60px] bg-transparent outline-none text-sm'
        />
      </div>
    </FormField>
  );
};

// --- Form.Section ---
const FormSection = ({ text, children, className, style, ...rest }) => (
  <div className={cn('mb-6', className)} style={style} {...rest}>
    {text && <div className='text-xs font-medium uppercase tracking-wider text-foreground/50 mb-3 pb-2 border-b border-border/50'>{text}</div>}
    {children}
  </div>
);

// --- Form.Slot ---
const FormSlot = ({ children, label, className, style, ...rest }) => (
  <div className={cn('mb-4', className)} style={style} {...rest}>
    {label && <label className='text-sm font-medium text-foreground block mb-1.5'>{label}</label>}
    {children}
  </div>
);

// Attach sub-components
Form.Input = FormInput;
Form.TextArea = FormTextArea;
Form.InputNumber = FormInputNumber;
Form.Select = FormSelect;
// Form.Select.Option is a data-only component — FormSelect reads its props, not its render output
Form.Select.Option = ({ value, children, ...rest }) => null;
Form.Switch = FormSwitch;
Form.Checkbox = FormCheckbox;
Form.RadioGroup = FormRadioGroup;
Form.DatePicker = FormDatePicker;
Form.AutoComplete = FormAutoComplete;
Form.Upload = FormUpload;
Form.TagInput = FormTagInput;
Form.Section = FormSection;
Form.Slot = FormSlot;

export { Form };
export default Form;
