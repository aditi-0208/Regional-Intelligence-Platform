// src/pages/reports/GenericReport.jsx
export default function GenericReport({ title }) {
  return (
    <>
      <section className="panel">
        <h3>{title} Overview</h3>
        <p>Replace this with KPIs, filters, and charts for {title}.</p>
      </section>
      <section className="panel">
        <h3>{title} Details</h3>
        <ul><li>Chart placeholder</li><li>Table placeholder</li><li>Notes</li></ul>
      </section>
    </>
  );
}
