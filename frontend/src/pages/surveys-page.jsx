import { useEffect, useRef, useState } from 'react';
import EmptyState from '../components/empty-state.jsx';
import PaginationControls from '../components/pagination-controls.jsx';
import RequestState from '../components/request-state.jsx';
import SiteFooter from '../components/site-footer.jsx';
import SiteHeader from '../components/site-header.jsx';
import SurveyQuestion from '../components/survey-question.jsx';
import useApiResource from '../hooks/use-api-resource.js';
import { apiFetch } from '../services/api.js';
import { getQuestionError, serializeAnswers } from '../services/survey-validation.js';

const PAGE_SIZE = 6;

const surveyTypeLabels = {
  nps: 'NPS',
  satisfaccion: 'Satisfacción',
  conocimiento_marca: 'Conocimiento de marca',
  estudio_mercado: 'Estudio de mercado',
  post_venta: 'Postventa',
};

export default function SurveysPage() {
  const [page, setPage] = useState(1);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const submitting = useRef(false);
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
    setSubmitError('');
  }, [activeSlug]);

  function selectSurvey(survey) {
    if (submitting.current) return;
    setSelectedSlug(survey.slug);
    setAnswers({});
    setErrors({});
    setSubmitted(false);
    setSubmitError('');
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

  async function handleSubmit(event) {
    event.preventDefault();
    if (detailRequest.status !== 'success' || !selectedSurvey || !selectedSurvey.permite_anonimas || submitting.current || submitted) return;

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
      const field = document.getElementById(`survey-question-${firstInvalid.id}`);
      (field?.querySelector('input, textarea') || field)?.focus();
      return;
    }

    submitting.current = true;
    setPending(true);
    setSubmitError('');
    try {
      await apiFetch(`/public/encuestas/${encodeURIComponent(selectedSurvey.slug)}/respuestas`, {
        method: 'POST', body: JSON.stringify(serializeAnswers(questions, answers)),
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || 'No se pudieron guardar las respuestas. Puedes intentarlo de nuevo.');
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main>
        <p className="preview-banner page-shell">
          Las encuestas habilitadas permiten responder de forma anónima. No incluyas datos personales.
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
                        disabled={pending}
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
                  onPageChange={next => { if (!pending) setPage(next); }}
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

                  <form className="survey-form" noValidate onSubmit={handleSubmit} aria-busy={pending}>
                    <p className="survey-required-note" role="note">
                      {selectedSurvey.permite_anonimas ? 'Tus respuestas se guardarán de forma anónima. Las preguntas obligatorias deben responderse.' : 'Esta encuesta no está habilitada para recibir respuestas anónimas desde el sitio público.'}
                    </p>
                    <fieldset className="survey-response-fields" disabled={pending || submitted || !selectedSurvey.permite_anonimas}>
                      <legend className="sr-only">Respuestas de la encuesta</legend>
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
                    </fieldset>

                    {submitError && <p className="admin-notice admin-notice--error" role="alert">{submitError} Tus respuestas permanecen en el formulario.</p>}

                    {submitted && (
                      <p className="survey-status" role="status" aria-live="polite">
                        Tus respuestas se guardaron de forma anónima. Gracias por participar.
                      </p>
                    )}

                    <button className="button survey-submit" type="submit" disabled={pending || submitted || !selectedSurvey.permite_anonimas}>
                      {pending ? 'Enviando…' : submitted ? 'Respuestas enviadas' : 'Enviar respuestas'}
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
