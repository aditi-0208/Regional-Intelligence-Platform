import { Link } from "react-router-dom";

export const chartTooltipStyle = {
  fontSize: 12,
  borderRadius: 6,
  border: "1px solid #E4E4E0",
};

export function StoryStatBar({ stats }) {
  return (
    <section className="story-stat-bar">
      <div className="container story-stat-inner">
        {stats.map((stat) => (
          <div key={stat.label} className="story-stat">
            <div className="story-stat-num">{stat.value}</div>
            <div className="story-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StoryCallout({ children }) {
  return (
    <div className="story-callout">
      <div className="story-callout-label">Key finding</div>
      <p>{children}</p>
    </div>
  );
}

export function StoryTakeaways({ items }) {
  return (
    <>
      <h2 className="story-section-title">Three things to watch</h2>
      <ul className="story-takeaways">
        {items.map((item) => (
          <li key={item.title}>
            <strong>{item.title}:</strong> {item.text}
          </li>
        ))}
      </ul>
    </>
  );
}

export function StoryMethodNote({ source }) {
  return (
    <div className="story-method-note">
      <strong>Methodology note:</strong> {source} See our{" "}
      <Link to="/methodology">methodology page</Link> for full indicator definitions.
    </div>
  );
}
