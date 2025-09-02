export default function WeatherCard({ data, units }) {
  if (!data) return null;

  const { name, sys, main, wind, weather } = data;
  const w = weather && weather[0];
  const icon = w ? `https://openweathermap.org/img/wn/${w.icon}@2x.png` : null;

  // Generic location label: City, State (if any), Country
  const locationLabel = (() => {
    const parts = [name];
    if (sys?.state) parts.push(sys.state);
    if (sys?.country) parts.push(sys.country);
    return parts.join(", ");
  })();

  // Wind: metric -> km/h (OpenWeather gives m/s), imperial -> mph
  const windLabel = (() => {
    if (wind?.speed === undefined || wind?.speed === null) return "";
    return units === "metric"
      ? `${Math.round(wind.speed * 3.6)} km/h`
      : `${Math.round(wind.speed)} mph`;
  })();

  const niceDesc = w?.description
    ? w.description.charAt(0).toUpperCase() + w.description.slice(1)
    : "";

  return (
    <div className="card fade-in">
      <div className="header">
        <h2>{locationLabel}</h2>
        {icon && <img src={icon} alt={w?.description || "Weather icon"} />}
      </div>
      <div className="grid">
        <div><span>Temp</span><strong>{Math.round(main.temp)}°{units === "metric" ? "C" : "F"}</strong></div>
        <div><span>Feels</span><strong>{Math.round(main.feels_like)}°{units === "metric" ? "C" : "F"}</strong></div>
        <div><span>Humidity</span><strong>{main.humidity}%</strong></div>
        <div><span>Wind</span><strong>{windLabel}</strong></div>
        {niceDesc && <div className="desc">{niceDesc}</div>}
      </div>
    </div>
  );
}
