export default function WeatherCard({ data, units }) {
  if (!data) return null;

  const { name, sys, main, wind, weather } = data;
  const w = weather && weather[0];
  const icon = w ? `https://openweathermap.org/img/wn/${w.icon}@2x.png` : null;

  // Format heading: prefer BC → else state → else country
  const locationLabel = (() => {
    const state = (sys?.state || "").toLowerCase();
    if (state.includes("british columbia")) return `${name}, BC`;
    if (sys?.state) return `${name}, ${sys.state}`;
    if (sys?.country) return `${name}, ${sys.country}`;
    return name;
  })();

  return (
    <div className="card fade-in">
      <div className="header">
        <h2>{locationLabel}</h2>
        {icon && <img src={icon} alt={w.description} />}
      </div>
      <div className="grid">
        <div>
          <span>Temp</span>
          <strong>{Math.round(main.temp)}°{units === "metric" ? "C" : "F"}</strong>
        </div>
        <div>
          <span>Feels</span>
          <strong>{Math.round(main.feels_like)}°{units === "metric" ? "C" : "F"}</strong>
        </div>
        <div>
          <span>Humidity</span>
          <strong>{main.humidity}%</strong>
        </div>
        <div>
          <span>Wind</span>
          <strong>
            {Math.round(wind.speed)} {units === "metric" ? "m/s" : "mph"}
          </strong>
        </div>
        {w?.description && (
          <div className="desc">{w.description}</div>
        )}
      </div>
    </div>
  );
}
