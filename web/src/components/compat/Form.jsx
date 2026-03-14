// Compat layer: Semi Design Form → lightweight form with formApi
import * as React from 'react';
import { cn } from '@/lib/utils';

// --- Form Context ---
const FormContext = React.createContext(null);

const useFormApi = () => React.useContext(FormContext);

// --- formApi implementation ---
const createFormApi = (valuesRef, setValues, onValueChange, rulesRef) => ({
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
  submitForm: () => {},
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
  ...rest
}, ref) => {
  const [values, setValues] = React.useState(initValues || {});
  const valuesRef = React.useRef(initValues || {});
  const rulesRef = React.useRef({});

  // Keep ref in sync
  React.useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const formApi = React.useMemo(
    () => createFormApi(valuesRef, setValues, onValueChange, rulesRef),
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
        'mb-4',
        isHorizontal ? 'flex items-start gap-3' : '',
        className
      )}
      style={style}
    >
      {!noLabel && label && (
        <label
          className={cn(
            'text-sm font-medium text-foreground',
            isHorizontal ? 'flex-shrink-0 pt-2' : 'block mb-1.5',
            required && "after:content-['*'] after:ml-0.5 after:text-destructive"
          )}
          style={labelWidth ? { width: labelWidth } : undefined}
        >
          {label}
        </label>
      )}
      <div className={cn(isHorizontal && 'flex-1')}>
        {typeof children === 'function'
          ? children({ value, onChange: handleChange, formApi, values })
          : React.isValidElement(children)
            ? React.cloneElement(children, { value, [trigger]: handleChange })
            : children
        }
        {helpText && <div className='text-xs text-muted-foreground mt-1'>{helpText}</div>}
        {extraText && <div className='text-xs text-muted-foreground mt-1'>{extraText}</div>}
      </div>
    </div>
  );
};

// --- Form.Input ---
const FormInput = ({ field, label, ...rest }) => {
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
        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
        {...rest}
      />
    </FormField>
  );
};

// --- Form.TextArea ---
const FormTextArea = ({ field, label, ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const value = field ? (values[field] ?? '') : '';
  return (
    <FormField field={field} label={label} {...rest}>
      <textarea
        value={value}
        onChange={(e) => field && formApi.setValue(field, e.target.value)}
        className='flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
        {...rest}
      />
    </FormField>
  );
};

// --- Form.InputNumber ---
const FormInputNumber = ({ field, label, ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const value = field ? (values[field] ?? '') : '';
  return (
    <FormField field={field} label={label} {...rest}>
      <input
        type='number'
        value={value}
        onChange={(e) => field && formApi.setValue(field, e.target.value === '' ? undefined : Number(e.target.value))}
        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
        {...rest}
      />
    </FormField>
  );
};

// --- Form.Select ---
const FormSelect = ({ field, label, optionList, children, multiple, filter, ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const value = field ? (values[field] ?? '') : '';
  return (
    <FormField field={field} label={label} {...rest}>
      <select
        value={value}
        onChange={(e) => field && formApi.setValue(field, e.target.value)}
        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
      >
        {optionList
          ? optionList.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))
          : children
        }
      </select>
    </FormField>
  );
};

// --- Form.Switch ---
const FormSwitch = ({ field, label, ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const checked = field ? (values[field] ?? false) : false;
  return (
    <FormField field={field} label={label} {...rest}>
      <button
        type='button'
        role='switch'
        aria-checked={checked}
        onClick={() => field && formApi.setValue(field, !checked)}
        className={cn(
          'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          checked ? 'bg-primary' : 'bg-input'
        )}
      >
        <span className={cn('pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform', checked ? 'translate-x-4' : 'translate-x-0')} />
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
  return (
    <FormField field={field} label={label} noLabel {...rest}>
      <label className='flex items-center gap-2 cursor-pointer'>
        <input
          type='checkbox'
          checked={checked}
          onChange={(e) => field && formApi.setValue(field, e.target.checked)}
          className='h-4 w-4 rounded border-input accent-[hsl(var(--primary))]'
        />
        {label && <span className='text-sm'>{label}</span>}
      </label>
    </FormField>
  );
};

// --- Form.RadioGroup ---
const FormRadioGroup = ({ field, label, options, ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const value = field ? values[field] : undefined;
  return (
    <FormField field={field} label={label} {...rest}>
      <div className='flex flex-wrap gap-3'>
        {(options || []).map((opt) => {
          const optValue = typeof opt === 'string' ? opt : opt.value;
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          return (
            <label key={optValue} className='flex items-center gap-2 cursor-pointer'>
              <input
                type='radio'
                checked={value === optValue}
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
const FormDatePicker = ({ field, label, type = 'date', ...rest }) => {
  const ctx = useFormApi();
  if (!ctx) return null;
  const { formApi, values } = ctx;
  const value = field ? (values[field] ?? '') : '';
  return (
    <FormField field={field} label={label} {...rest}>
      <input
        type={type === 'dateTime' ? 'datetime-local' : 'date'}
        value={value}
        onChange={(e) => field && formApi.setValue(field, e.target.value)}
        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
      />
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
        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
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
      <div className='flex flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1 min-h-[36px]'>
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
    {text && <div className='text-sm font-semibold text-foreground mb-3 pb-2 border-b'>{text}</div>}
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
