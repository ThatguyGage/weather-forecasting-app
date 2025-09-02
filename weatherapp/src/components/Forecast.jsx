export default function Forecast({ items, units }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="forecast">
      <h3>5-Day Forecast</h3>
      <div className="forecast-grid">
        {items.map((day) => {
          const w = day.weather[0];
          const icon = `https://openweathermap.org/img/wn/${w.icon}@2x.png`;
          return (
            <div key={day.dt} className="forecast-card fade-in">
              <div>{new Date(day.dt_txt).toLocaleDateString(undefined, { weekday: "short" })}</div>
              <img src={icon} alt={w.description} />
              <div>{Math.round(day.main.temp)}°{units === "metric" ? "C" : "F"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
