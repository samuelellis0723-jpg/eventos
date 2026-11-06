import { isValidScale } from '../services/survey-validation.js';

function QuestionLabel({ question }) {
  return (
    <>
      <span className="survey-question__text">{question.texto}</span>
      <span className="survey-question__requirement">
        {question.obligatoria ? 'Obligatoria' : 'Opcional'}
      </span>
    </>
  );
}

function getHint(question) {
  if (question.tipo_respuesta === 'escala') {
    return `Selecciona un valor de ${question.valor_minimo} a ${question.valor_maximo}.`;
  }
  if (question.tipo_respuesta === 'opcion_multiple') {
    return 'Puedes elegir más de una opción.';
  }
  if (question.tipo_respuesta === 'texto') {
    return 'No escribas datos personales.';
  }
  if (question.tipo_respuesta === 'numerica' && question.valor_minimo != null && question.valor_maximo != null) {
    return `Ingresa un número de ${question.valor_minimo} a ${question.valor_maximo}.`;
  }
  return '';
}

export default function SurveyQuestion({ question, answer, error, onAnswer }) {
  const fieldId = `survey-question-${question.id}`;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const hint = getHint(question);
  const describedBy = [hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined;
  const required = Boolean(question.obligatoria);

  const questionLabel = (
    <QuestionLabel question={question} />
  );

  if (question.tipo_respuesta === 'texto') {
    return (
      <div className="survey-question" id={fieldId} data-question-id={question.id}>
        <label className="survey-question__prompt" htmlFor={`${fieldId}-input`}>
          {questionLabel}
        </label>
        {hint && <p className="survey-question__hint" id={hintId}>{hint}</p>}
        <textarea
          id={`${fieldId}-input`}
          className="survey-control"
          rows="3"
          maxLength={5000}
          value={answer ?? ''}
          required={required}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => onAnswer(question.id, event.target.value)}
        />
        {error && <p className="survey-error" id={errorId} role="alert">{error}</p>}
      </div>
    );
  }

  if (question.tipo_respuesta === 'numerica') {
    return (
      <div className="survey-question" id={fieldId} data-question-id={question.id}>
        <label className="survey-question__prompt" htmlFor={`${fieldId}-input`}>
          {questionLabel}
        </label>
        {hint && <p className="survey-question__hint" id={hintId}>{hint}</p>}
        <input
          id={`${fieldId}-input`}
          className="survey-control survey-control--number"
          type="number"
          min={question.valor_minimo ?? undefined}
          max={question.valor_maximo ?? undefined}
          step="0.01"
          value={answer ?? ''}
          required={required}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => onAnswer(question.id, event.target.value)}
        />
        {error && <p className="survey-error" id={errorId} role="alert">{error}</p>}
      </div>
    );
  }

  if (question.tipo_respuesta === 'escala') {
    if (!isValidScale(question)) return (
      <div className="survey-question" id={fieldId} tabIndex={-1}>
        <p className="survey-question__prompt">{questionLabel}</p>
        <p className="survey-error" role="alert">La escala no tiene límites válidos. Esta encuesta necesita una corrección antes de recibir respuestas.</p>
      </div>
    );
    const first = Number(question.valor_minimo);
    const last = Number(question.valor_maximo);
    const values = Array.from({ length: Math.max(0, last - first + 1) }, (_, index) => first + index);

    return (
      <fieldset
        className="survey-question"
        id={fieldId}
        data-question-id={question.id}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      >
        <legend className="survey-question__prompt">{questionLabel}</legend>
        {hint && <p className="survey-question__hint" id={hintId}>{hint}</p>}
        <div className="survey-scale">
          {values.map((value) => (
            <label className="survey-scale__option" htmlFor={`${fieldId}-value-${value}`} key={value}>
              <input
                id={`${fieldId}-value-${value}`}
                type="radio"
                name={fieldId}
                value={value}
                checked={String(answer ?? '') === String(value)}
                required={required}
                aria-required={required}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                aria-label={`${value} de ${last}`}
                onChange={(event) => onAnswer(question.id, event.target.value)}
              />
              <span aria-hidden="true">{value}</span>
            </label>
          ))}
        </div>
        {error && <p className="survey-error" id={errorId} role="alert">{error}</p>}
      </fieldset>
    );
  }

  if (question.tipo_respuesta === 'opcion_unica' || question.tipo_respuesta === 'si_no') {
    return (
      <fieldset
        className="survey-question"
        id={fieldId}
        data-question-id={question.id}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      >
        <legend className="survey-question__prompt">{questionLabel}</legend>
        {hint && <p className="survey-question__hint" id={hintId}>{hint}</p>}
        <div className="survey-choice-list">
          {(question.opciones || []).map((option) => (
            <label className="survey-choice" htmlFor={`${fieldId}-option-${option.id}`} key={option.id}>
              <input
                id={`${fieldId}-option-${option.id}`}
                type="radio"
                name={fieldId}
                value={option.id}
                checked={String(answer) === String(option.id)}
                required={required}
                aria-required={required}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                onChange={(event) => onAnswer(question.id, event.target.value)}
              />
              <span>{option.etiqueta}</span>
            </label>
          ))}
        </div>
        {error && <p className="survey-error" id={errorId} role="alert">{error}</p>}
      </fieldset>
    );
  }

  if (question.tipo_respuesta === 'opcion_multiple') {
    const selected = Array.isArray(answer) ? answer : [];

    return (
      <fieldset
        className="survey-question"
        id={fieldId}
        data-question-id={question.id}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      >
        <legend className="survey-question__prompt">{questionLabel}</legend>
        {hint && <p className="survey-question__hint" id={hintId}>{hint}</p>}
        <div className="survey-choice-list">
          {(question.opciones || []).map((option) => {
            const optionId = `${fieldId}-option-${option.id}`;
            const isChecked = selected.includes(String(option.id));
            return (
              <label className="survey-choice" htmlFor={optionId} key={option.id}>
                <input
                  id={optionId}
                  type="checkbox"
                  name={`${fieldId}[]`}
                  value={option.id}
                  checked={isChecked}
                  aria-required={required}
                  aria-invalid={Boolean(error)}
                  aria-describedby={describedBy}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...selected, String(option.id)]
                      : selected.filter((value) => value !== String(option.id));
                    onAnswer(question.id, next);
                  }}
                />
                <span>{option.etiqueta}</span>
              </label>
            );
          })}
        </div>
        {error && <p className="survey-error" id={errorId} role="alert">{error}</p>}
      </fieldset>
    );
  }

  return null;
}
