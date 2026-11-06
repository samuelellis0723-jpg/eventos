import { ContentField } from './content-fields.jsx';

const types = [['texto','Texto'], ['numerica','Numérica'], ['escala','Escala'], ['opcion_unica','Opción única'], ['opcion_multiple','Opción múltiple'], ['si_no','Sí / No']];
function move(items, index, direction) {
  const result = [...items];
  [result[index], result[index + direction]] = [result[index + direction], result[index]];
  return result;
}
export default function SurveyEditor({ questions, locked, onChange }) {
  function update(index, changes) { onChange(questions.map((q, at) => at === index ? { ...q, ...changes } : q)); }
  function changeType(index, type) {
    update(index, { tipo_respuesta: type, valor_minimo: null, valor_maximo: null,
      opciones: type === 'si_no' ? [{ etiqueta: 'Sí', valor: 'si' }, { etiqueta: 'No', valor: 'no' }]
        : ['opcion_unica','opcion_multiple'].includes(type) ? [{ etiqueta: '', valor: 'opcion-1' }, { etiqueta: '', valor: 'opcion-2' }] : [] });
  }
  return (
    <section className="content-subsection" aria-labelledby="questions-heading">
      <h3 id="questions-heading">Preguntas y opciones</h3>
      {locked && <p className="admin-notice" role="note">Esta encuesta tiene participaciones. Sus preguntas y opciones se conservan para mantener el significado de las respuestas. Puedes editar la publicación y vigencia; para cambiar el cuestionario, crea otra encuesta.</p>}
      <fieldset className="content-question-fieldset" disabled={locked}>
        <legend className="sr-only">Configuración del cuestionario</legend>
        {questions.length === 0 && <p className="content-field-hint">Agrega al menos una pregunta antes de publicar.</p>}
        {questions.map((question, index) => (
          <section className="content-nested-card" key={question.id || `new-${index}`} aria-labelledby={`question-heading-${index}`}>
            <div className="content-nested-heading">
              <h4 id={`question-heading-${index}`}>Pregunta {index + 1}</h4>
              <div className="content-order-actions">
                <button type="button" disabled={index === 0} onClick={() => onChange(move(questions,index,-1))} aria-label={`Mover pregunta ${index+1} arriba`}>Subir</button>
                <button type="button" disabled={index === questions.length-1} onClick={() => onChange(move(questions,index,1))} aria-label={`Mover pregunta ${index+1} abajo`}>Bajar</button>
              </div>
            </div>
            <ContentField idPrefix={`question-${index}`} field={{ name:'texto', label:'Texto de la pregunta', type:'textarea', required:true, maxLength:500 }} value={question.texto} onChange={value => update(index,{texto:value})} />
            <ContentField idPrefix={`question-${index}`} field={{ name:'tipo_respuesta',label:'Tipo de respuesta',type:'select',options:types }} value={question.tipo_respuesta} onChange={value => changeType(index,value)} />
            <ContentField idPrefix={`question-${index}`} field={{name:'obligatoria',label:'Pregunta obligatoria',type:'checkbox'}} value={question.obligatoria} onChange={value => update(index,{obligatoria:value})} />
            {['numerica','escala'].includes(question.tipo_respuesta) && <div className="content-field-grid">
              {['valor_minimo','valor_maximo'].map((key,at) => <div className="admin-field" key={key}>
                <label htmlFor={`question-${index}-${key}`}>{at ? 'Valor máximo' : 'Valor mínimo'}</label>
                <input id={`question-${index}-${key}`} type="number" step="1" min="-32768" max="32767" value={question[key] ?? ''} onChange={event => update(index,{[key]:event.target.value === '' ? null : Number(event.target.value)})} />
              </div>)}
              <p className="content-field-hint content-field--wide">{question.tipo_respuesta === 'escala' ? 'Para publicar una escala, ambos límites son necesarios: mínimo menor que máximo, con hasta 101 valores.' : 'Los límites numéricos son opcionales. El mínimo no puede superar al máximo.'}</p>
            </div>}
            {['opcion_unica','opcion_multiple','si_no'].includes(question.tipo_respuesta) && <div className="content-options">
              <p className="content-field-hint">Al menos dos opciones para publicar. El valor identifica la opción y debe ser único en esta pregunta.</p>
              {(question.opciones || []).map((option,at) => <div className="content-option" key={option.id || `new-${at}`}>
                <ContentField idPrefix={`question-${index}-option-${at}`} field={{name:'etiqueta',label:`Opción ${at+1}: etiqueta`,type:'text',required:true,maxLength:200}} value={option.etiqueta} onChange={value => update(index,{opciones:question.opciones.map((item,i) => i===at ? {...item,etiqueta:value}:item)})} />
                <ContentField idPrefix={`question-${index}-option-${at}`} field={{name:'valor',label:'Valor',type:'text',required:true,maxLength:100}} value={option.valor} onChange={value => update(index,{opciones:question.opciones.map((item,i) => i===at ? {...item,valor:value}:item)})} />
                <div className="content-order-actions">
                  <button type="button" disabled={at===0} aria-label={`Subir opción ${at+1} de pregunta ${index+1}`} onClick={() => update(index,{opciones:move(question.opciones,at,-1)})}>Subir</button>
                  <button type="button" disabled={at===question.opciones.length-1} aria-label={`Bajar opción ${at+1} de pregunta ${index+1}`} onClick={() => update(index,{opciones:move(question.opciones,at,1)})}>Bajar</button>
                  <button type="button" onClick={() => update(index,{opciones:question.opciones.filter((_,i)=>i!==at)})}>Quitar opción</button>
                </div>
              </div>)}
              <button className="content-inline-button" type="button" disabled={(question.opciones||[]).length>=50} onClick={() => update(index,{opciones:[...(question.opciones||[]),{etiqueta:'',valor:''}]})}>Agregar opción</button>
            </div>}
            <button className="content-inline-button content-inline-button--danger" type="button" onClick={() => onChange(questions.filter((_,at)=>at!==index))}>Eliminar pregunta {index+1}</button>
          </section>
        ))}
        <button className="admin-button admin-button--secondary" type="button" disabled={questions.length>=100} onClick={() => onChange([...questions,{texto:'',tipo_respuesta:'texto',obligatoria:true,valor_minimo:null,valor_maximo:null,opciones:[]}])}>Agregar pregunta</button>
      </fieldset>
    </section>
  );
}
