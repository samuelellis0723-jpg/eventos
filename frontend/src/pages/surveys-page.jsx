import { useEffect, useState } from 'react';
import EmptyState from '../components/empty-state.jsx';
import PaginationControls from '../components/pagination-controls.jsx';
import RequestState from '../components/request-state.jsx';
import SiteFooter from '../components/site-footer.jsx';
import SiteHeader from '../components/site-header.jsx';
import SurveyQuestion from '../components/survey-question.jsx';
import useApiResource from '../hooks/use-api-resource.js';

const PAGE_SIZE = 6;

const surveyTypeLabels = {
  nps: 'NPS',
  satisfaccion: 'Satisfacción',
  conocimiento_marca: 'Conocimiento de marca',
  estudio_mercado: 'Estudio de mercado',
  post_venta: 'Postventa',
};

function getQuestionError(question, answer) {
  if (question.tipo_respuesta === 'texto') {
    return question.obligatoria && !String(answer ?? '').trim() ? 'Escribe una respuesta para continuar.' : '';
  }

  if (question.tipo_respuesta === 'numerica') {
    const hasAnswer = answer !== undefined && answer !== null && answer !== '';
    if (!hasAnswer) return question.obligatoria ? 'Ingresa un número para continuar.' : '';

    const numericAnswer = Number(answer);
    if (!Number.isFinite(numericAnswer)) return 'Ingresa un número válido.';
    if (question.valor_minimo != null && numericAnswer < question.valor_minimo) {
      return `El valor mínimo es ${question.valor_minimo}.`;
    }
    if (question.valor_maximo != null && numericAnswer > question.valor_maximo) {
      return `El valor máximo es ${question.valor_maximo}.`;
    }
    return '';
  }

  if (question.tipo_respuesta === 'escala') {
    const hasAnswer = answer !== undefined && answer !== null && answer !== '';
    if (!hasAnswer) return question.obligatoria ? 'Selecciona una respuesta para continuar.' : '';
    const numericAnswer = Number(answer);
    if (numericAnswer < question.valor_minimo || numericAnswer > question.valor_maximo) {
      return 'Selecciona un valor dentro de la escala.';
    }
    return '';
  }

  const allowedValues = (question.opciones || []).map((option) => option.valor);
  if (question.tipo_respuesta === 'opcion_multiple') {
    const selected = Array.isArray(answer) ? answer : [];
    if (question.obligatoria && selected.length === 0) return 'Selecciona una o más respuestas para continuar.';
    if (selected.some((value) => !allowedValues.includes(value))) return 'Selecciona opciones válidas.';
    return '';
  }

  if (question.tipo_respuesta === 'opcion_unica' || question.tipo_respuesta === 'si_no') {
    if (!answer) return question.obligatoria ? 'Selecciona una respuesta para continuar.' : '';
    return allowedValues.includes(answer) ? '' : 'Selecciona una respuesta válida.';
  }

  return '';
}

export default function SurveysPage() {
  const [page, setPage] = useState(1);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const surveysRequest = useApiResource(`/public/encuestas?page=${page}&limit=${PAGE_SIZE}`);
  const surveys = surveysRequest.data || [];
  const activeSlug = surveys.some((survey) => survey.slug === selectedSlug)
    ? selectedSlug
    : (surveys[0]?.slug ?? '');
  const detailRequest = useApiResource(
    activeSlug ? `/public/encuestas/${encodeURIComponent(activeSlug)}` : null,
  );
  const selectedSurvey = detailRequest.data;

  useEffect(() => {
    setAnswers({});
    setErrors({});
    setSubmitted(false);
  }, [activeSlug]);

  function selectSurvey(survey) {
    setSelectedSlug(survey.slug);
    setAnswers({});
    setErrors({});
    setSubmitted(false);
  }

  function updateAnswer(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
    setSubmitted(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (detailRequest.status !== 'success' || !selectedSurvey) return;

    const nextErrors = {};
    const questions = selectedSurvey.preguntas || [];
    questions.forEach((question) => {
      const error = getQuestionError(question, answers[question.id]);
      if (error) nextErrors[question.id] = error;
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(false);
      const firstInvalid = questions.find((question) => nextErrors[question.id]);
      document
        .getElementById(`survey-question-${firstInvalid.id}`)
        ?.querySelector('input, textarea')
        ?.focus();
      return;
    }

    setSubmitted(true);
  }

  return (
    <>
      <SiteHeader />
      <main>
        <p className="preview-banner page-shell">
          Las encuestas son públicas. Las respuestas de este formulario no se guardan.
        </p>

        <section className="survey-intro page-shell" aria-labelledby="surveys-title">
          <p className="eyebrow">Encuestas</p>
          <h1 id="surveys-title">Encuestas</h1>
          <p>Selecciona una encuesta publicada para consultar sus preguntas.</p>
        </section>

        <section className="survey-workspace page-shell" aria-label="Encuestas disponibles">
          <RequestState
            status={surveysRequest.status}
            label="encuestas"
            onRetry={surveysRequest.retry}
          />
          {surveysRequest.status === 'success' && surveys.length === 0 && (
            <EmptyState
              title="No hay encuestas disponibles por ahora"
              description="Las encuestas aparecerán aquí cuando haya publicaciones públicas vigentes."
              href="/"
              action="Volver a Inicio"
            />
          )}
          {surveysRequest.status === 'success' && surveys.length > 0 && (
            <div className="survey-layout">
              <aside className="survey-picker" aria-labelledby="survey-picker-title">
                <div className="survey-picker__heading">
                  <h2 id="survey-picker-title">Encuestas disponibles</h2>
                  <p>Selecciona una para consultar sus preguntas.</p>
                </div>
                <div className="survey-picker__list">
                  {surveys.map((survey) => {
                    const isSelected = survey.slug === activeSlug;
                    return (
                      <button
                        className={`survey-choice-card${isSelected ? ' survey-choice-card--selected' : ''}`}
                        type="button"
                        key={survey.slug}
                        aria-pressed={isSelected}
                        onClick={() => selectSurvey(survey)}
                      >
                        <span className="survey-example-badge">Encuesta pública</span>
                        <span className="survey-choice-card__title">{survey.titulo}</span>
                        <span className="survey-choice-card__description">{survey.introduccion}</span>
                        <span className="survey-choice-card__type">
                          {surveyTypeLabels[survey.tipo] || survey.tipo}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <PaginationControls
                  pagination={surveysRequest.pagination}
                  label="encuestas"
                  onPageChange={setPage}
                />
              </aside>

              {detailRequest.status !== 'success' ? (
                <section className="survey-form-panel" aria-label="Detalle de encuesta">
                  <RequestState
                    status={detailRequest.status}
                    label="la encuesta"
                    onRetry={detailRequest.retry}
                  />
                </section>
              ) : selectedSurvey && (
                <section className="survey-form-panel" aria-labelledby="selected-survey-title">
                  <header className="survey-form-panel__header">
                    <div>
                      <span className="survey-example-badge">Encuesta pública</span>
                      <h2 id="selected-survey-title">{selectedSurvey.titulo}</h2>
                      <p>{selectedSurvey.introduccion}</p>
                    </div>
                    <span className="survey-form-panel__type">
                      {surveyTypeLabels[selectedSurvey.tipo] || selectedSurvey.tipo}
                    </span>
                  </header>

                  <form className="survey-form" noValidate onSubmit={handleSubmit}>
                    <p className="survey-required-note" role="note">
                      Las respuestas no se guardan. Las preguntas marcadas como obligatorias deben responderse.
                    </p>
                    <div className="survey-question-list">
                      {(selectedSurvey.preguntas || [])
                        .slice()
                        .sort((left, right) => left.orden - right.orden)
                        .map((question) => (
                          <SurveyQuestion
                            key={question.id}
                            question={question}
                            answer={answers[question.id]}
                            error={errors[question.id]}
                            onAnswer={updateAnswer}
                          />
                        ))}
                    </div>

                    {submitted && (
                      <p className="survey-status" role="status" aria-live="polite">
                        Demostración: tus respuestas no se guardaron
                      </p>
                    )}

                    <button className="button survey-submit" type="submit">
                      Mostrar resultado (sin guardar)
                    </button>
                  </form>
                </section>
              )}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
