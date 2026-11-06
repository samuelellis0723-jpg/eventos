export function ContentField({ field, value, onChange, idPrefix = 'content' }) {
  const id = `${idPrefix}-${field.name}`;
  if (field.type === 'checkbox') return (
    <label className="content-checkbox" htmlFor={id}>
      <input id={id} type="checkbox" checked={Boolean(value)} onChange={event => onChange(event.target.checked)} />
      <span>{field.label}</span>
    </label>
  );
  const props = { id, name: field.name, required: field.required, value: value ?? '', onChange: event => onChange(field.type === 'number' ? event.target.value === '' ? null : Number(event.target.value) : event.target.value), 'aria-describedby': field.hint ? `${id}-hint` : undefined };
  return (
    <div className={`admin-field${field.wide ? ' content-field--wide' : ''}`}>
      <label htmlFor={id}>{field.label}{field.required ? ' *' : ''}</label>
      {field.type === 'textarea' ? <textarea {...props} rows={4} maxLength={field.maxLength} />
        : field.type === 'select' ? <select {...props}>{field.options.map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select>
          : <input {...props} type={field.type} maxLength={field.maxLength} pattern={field.pattern} min={field.min} max={field.max} step={field.step} />}
      {field.hint && <p className="content-field-hint" id={`${id}-hint`}>{field.hint}</p>}
    </div>
  );
}

export default function ContentFields({ fields, data, onChange }) {
  return <div className="content-field-grid">{fields.map(field => <ContentField key={field.name} field={field} value={data[field.name]} onChange={value => onChange(field.name, value)} />)}</div>;
}
