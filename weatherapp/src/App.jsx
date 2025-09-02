import { useState } from "react";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import UnitsToggle from "./components/UnitsToggle";
import Forecast from "./components/Forecast";
import "./App.css";

const API_KEY = import.meta.env.VITE_OW_API_KEY;

export default function App() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [units, setUnits] = useState("metric");

  const fetchWeather = async (city) => {
    setStatus("loading"); setError(""); setData(null); setForecast([]);
    try {
      // geocode
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}, British Columbia, CA&limit=1&appid=${API_KEY}`;
      const g = await fetch(geoUrl);
      const places = await g.json();
      if (!places.length) throw new Error("City not found");
      const { lat, lon, name, country, state } = places[0];

      // current weather
      const wRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`
      );
      const weather = await wRes.json();
      if (!wRes.ok) throw new Error(weather?.message || "Failed to fetch weather");
      weather.name = name;
      weather.sys = { ...(weather.sys || {}), country, state };
      setData(weather);

      // forecast
      const fRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`
      );
      const fJson = await fRes.json();
      if (fRes.ok && Array.isArray(fJson.list)) {
        // pick 1 item around midday for next 5 days
        const daily = [];
        const seen = new Set();
        for (let item of fJson.list) {
          const date = item.dt_txt.split(" ")[0];
          if (!seen.has(date) && item.dt_txt.includes("12:00:00")) {
            seen.add(date);
            daily.push(item);
          }
        }
        setForecast(daily.slice(0, 5));
      }

      setStatus("done");
    } catch (e) {
      setError(e.message || "Network error");
      setStatus("error");
    }
  };

  return (
    <div className="wrap">
      <h1>Weather Forecasting App</h1>
      <UnitsToggle units={units} onToggle={setUnits} />
      <SearchBar onSearch={fetchWeather} />
      {status === "loading" && <p className="muted">Loading…</p>}
      {status === "error" && <p className="error">{error}</p>}
      <WeatherCard data={data} units={units} />
      <Forecast items={forecast} units={units} />
    </div>
  );
}
