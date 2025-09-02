export default function UnitsToggle({ units, onToggle }) {
  return (
    <div className="units-toggle">
      <button
        className={units === "metric" ? "active" : ""}
        onClick={() => onToggle("metric")}
      >
        °C
      </button>
      <button
        className={units === "imperial" ? "active" : ""}
        onClick={() => onToggle("imperial")}
      >
        °F
      </button>
    </div>
  );
}
