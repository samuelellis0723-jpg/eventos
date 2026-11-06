import test from 'node:test';
import assert from 'node:assert/strict';
import { getQuestionError, isValidScale, serializeAnswers } from '../src/services/survey-validation.js';
import { toApiData } from '../src/services/admin-content-config.js';

test('Una escala nula, invertida o demasiado grande nunca se convierte en una escala 0..0', () => {
  for (const [min,max] of [[null,null],[null,5],[5,null],[5,1],[0,0],[0,101]]) {
    const question={id:1,tipo_respuesta:'escala',valor_minimo:min,valor_maximo:max,obligatoria:false};
    assert.equal(isValidScale(question),false);
    assert.match(getQuestionError(question,''),/límites válidos/);
  }
  assert.equal(isValidScale({valor_minimo:0,valor_maximo:10}),true);
});
test('Validación de obligatorias, rangos y opciones por identificador', () => {
  assert(getQuestionError({tipo_respuesta:'texto',obligatoria:true},'   '));
  assert(getQuestionError({tipo_respuesta:'numerica',obligatoria:true,valor_minimo:1,valor_maximo:5},6));
  assert(getQuestionError({tipo_respuesta:'opcion_unica',opciones:[{id:3},{id:4}]},'7'));
  assert.equal(getQuestionError({tipo_respuesta:'opcion_multiple',obligatoria:true,opciones:[{id:3},{id:4}]},['3','4']),'');
  assert(getQuestionError({tipo_respuesta:'opcion_multiple',opciones:[{id:3}]},['3','3']));
});
test('El envío incluye solo respuestas tipadas e IDs; omite opcionales vacías', () => {
  const questions=[{id:1,tipo_respuesta:'texto'},{id:2,tipo_respuesta:'numerica'},{id:3,tipo_respuesta:'opcion_multiple'},{id:4,tipo_respuesta:'opcion_unica'},{id:5,tipo_respuesta:'texto'}];
  assert.deepEqual(serializeAnswers(questions,{1:' Ficticio ',2:'2.5',3:['10','11'],4:'12'}),{respuestas:[{pregunta_id:1,valor:'Ficticio'},{pregunta_id:2,valor:2.5},{pregunta_id:3,valor:[10,11]},{pregunta_id:4,valor:12}]});
});
test('Editar metadatos de encuestas respondidas conserva el grafo sin reenviarlo', () => {
  const source = { titulo: 'Título editado', tiene_respuestas: true, preguntas: [{id:1,texto:'Pregunta original'}] };
  const result = toApiData('encuestas',source);
  assert.equal(result.titulo,'Título editado');
  assert.equal(Object.hasOwn(result,'preguntas'),false);
  assert.equal(source.preguntas[0].texto,'Pregunta original');
  assert.deepEqual(toApiData('encuestas',{...source,tiene_respuestas:false}).preguntas,source.preguntas);
});
