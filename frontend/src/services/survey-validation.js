export function isValidScale(question) {
  return question.valor_minimo != null && question.valor_maximo != null
    && Number.isInteger(question.valor_minimo) && Number.isInteger(question.valor_maximo)
    && question.valor_minimo < question.valor_maximo && question.valor_maximo - question.valor_minimo <= 100;
}
export function getQuestionError(question, answer) {
  if (question.tipo_respuesta === 'escala' && !isValidScale(question)) return 'Esta escala no tiene límites válidos. No se puede enviar la encuesta.';
  const empty = answer == null || answer === '' || (typeof answer === 'string' && !answer.trim()) || (Array.isArray(answer) && !answer.length);
  if (empty) return question.obligatoria ? 'Responde esta pregunta obligatoria.' : '';
  if (question.tipo_respuesta === 'texto') return typeof answer !== 'string' || answer.trim().length > 5000 ? 'Usa como máximo 5000 caracteres.' : '';
  if (['numerica', 'escala'].includes(question.tipo_respuesta)) {
    const value = Number(answer);
    if (!Number.isFinite(value) || Math.abs(value) > 99999999.99 || Math.abs(value * 100 - Math.round(value * 100)) > 0.000001) return 'Ingresa un número válido con hasta dos decimales.';
    if (question.tipo_respuesta === 'escala' && !Number.isInteger(value)) return 'Selecciona un valor entero de la escala.';
    if ((question.valor_minimo != null && value < question.valor_minimo) || (question.valor_maximo != null && value > question.valor_maximo)) return 'La respuesta está fuera del rango permitido.';
    return '';
  }
  const allowed = (question.opciones || []).map(option => String(option.id));
  const values = question.tipo_respuesta === 'opcion_multiple' ? answer : [answer];
  if (!Array.isArray(values) || new Set(values).size !== values.length || values.some(value => !allowed.includes(String(value)))) return 'Selecciona opciones válidas de esta pregunta.';
  return '';
}
export function serializeAnswers(questions, answers) {
  return { respuestas: questions.flatMap(question => {
    const value = answers[question.id];
    if (value == null || value === '' || (Array.isArray(value) && !value.length) || (typeof value === 'string' && !value.trim())) return [];
    return [{ pregunta_id: question.id, valor: question.tipo_respuesta === 'texto' ? value.trim()
      : question.tipo_respuesta === 'opcion_multiple' ? value.map(Number) : Number(value) }];
  }) };
}
