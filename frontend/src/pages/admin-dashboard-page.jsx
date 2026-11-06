import { Link } from 'react-router';
const modules = [
  { number: '01', title: 'Eventos', description: 'Gestión de eventos.' },
  { number: '02', title: 'Promociones', description: 'Gestión de promociones.' },
  { number: '03', title: 'Lealtad', description: 'Gestión de programas de lealtad.' },
  { number: '04', title: 'Encuestas', description: 'Gestión de encuestas.' },
];

export default function AdminDashboardPage() {
  return (
    <div className="admin-dashboard">
      <header className="admin-page-heading">
        <p className="admin-eyebrow">Área privada</p>
        <h1>Panel administrativo</h1>
        <p>Espacio de gestión de Eventos+.</p>
      </header>

      <section className="admin-status-note" aria-label="Estado del panel">
        <span className="admin-status-note__marker" aria-hidden="true" />
        <p>Crea borradores, revisa el contenido y publícalo desde cada módulo. La vigencia y visibilidad determinan qué aparece en el sitio público.</p>
      </section>

      <section className="admin-module-section" aria-labelledby="admin-modules-title">
        <div className="admin-section-heading">
          <h2 id="admin-modules-title">Módulos</h2>
          <span>4 secciones</span>
        </div>
        <div className="admin-module-grid">
          {modules.map((module) => (
            <article className="admin-module-card" key={module.title}>
              <div className="admin-module-card__heading">
                <p className="admin-module-card__number">{module.number} / {module.title}</p>
                <span className="admin-module-card__status">Disponible</span>
              </div>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <Link className="text-link" to={`/admin/${module.title.toLowerCase()}`}>Gestionar {module.title.toLowerCase()}</Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
