import { ContentField } from './content-fields.jsx';

export default function BenefitsEditor({ benefits, onChange }) {
  function update(index, key, value) { onChange(benefits.map((item, at) => at === index ? { ...item, [key]: value } : item)); }
  return (
    <section className="content-subsection" aria-labelledby="benefits-heading">
      <h3 id="benefits-heading">Beneficios del programa</h3>
      {benefits.length === 0 && <p className="content-field-hint">Todavía no hay beneficios en este programa.</p>}
      {benefits.map((benefit,index) => (
        <div className="content-nested-card" key={benefit.id || `new-${index}`}>
          <h4>Beneficio {index + 1}</h4>
          <ContentField idPrefix={`benefit-${index}`} field={{ name: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 150 }} value={benefit.nombre} onChange={value => update(index,'nombre',value)} />
          <ContentField idPrefix={`benefit-${index}`} field={{ name: 'descripcion', label: 'Descripción', type: 'textarea', maxLength: 20000 }} value={benefit.descripcion} onChange={value => update(index,'descripcion',value)} />
          <ContentField idPrefix={`benefit-${index}`} field={{ name: 'activo', label: 'Beneficio activo', type: 'checkbox' }} value={benefit.activo} onChange={value => update(index,'activo',value)} />
          {!benefit.id && <button className="content-inline-button" type="button" onClick={() => onChange(benefits.filter((_,at) => at !== index))}>Quitar beneficio nuevo</button>}
        </div>
      ))}
      <button className="admin-button admin-button--secondary" type="button" disabled={benefits.length >= 100} onClick={() => onChange([...benefits, { nombre: '', descripcion: '', activo: true }])}>Agregar beneficio</button>
    </section>
  );
}
