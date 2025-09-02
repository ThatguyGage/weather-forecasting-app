import { useEffect, useState } from "react";
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
  const [lastPlace, setLastPlace] = useState(null); // { lat, lon, name, country, state }

  // Helper: fetch weather+forecast by coords using current units
  const fetchByCoords = async (place) => {
    const { lat, lon, name, country, state } = place;

    // current weather
    const wRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`
    );
    const weather = await wRes.json();
    if (!wRes.ok) throw new Error(weather?.message || "Failed to fetch weather");
    weather.name = name;
    weather.sys = { ...(weather.sys || {}), country, state };
    setData(weather);

    // 5-day forecast (choose around noon)
    const fRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`
    );
    const fJson = await fRes.json();
    if (fRes.ok && Array.isArray(fJson.list)) {
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
  };

  // Search flow: geocode globally, pick best, then fetchByCoords
  const fetchWeather = async (rawInput) => {
    setStatus("loading");
    setError("");
    setData(null);
    setForecast([]);

    try {
      const city = (rawInput || "").trim();
      if (!city) throw new Error("Please enter a city");

      // Parse optional hints (e.g., "Paris, FR", "Victoria, BC")
      const parts = city.split(",").map(s => s.trim()).filter(Boolean);
      const hintCity = parts[0] || "";
      const hintRegion = (parts[1] || "").toLowerCase();
      const hintCountry = (parts[2] || "").toLowerCase();

      // Geocode (no BC lock)
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(hintCity)}&limit=5&appid=${API_KEY}`;
      const gRes = await fetch(geoUrl);
      const places = await gRes.json();
      if (!Array.isArray(places) || places.length === 0) {
        throw new Error("City not found");
      }

      // Rank results by hints + population when available
      const scored = places.map(p => {
        let score = 0;
        if ((p.name || "").toLowerCase() === hintCity.toLowerCase()) score += 10;
        if (hintRegion) {
          const st = (p.state || "").toLowerCase();
          const ctry = (p.country || "").toLowerCase();
          if (st === hintRegion || st.includes(hintRegion)) score += 100;
          if (ctry === hintRegion) score += 80;
        }
        if (hintCountry) {
          const ctry = (p.country || "").toLowerCase();
          if (ctry === hintCountry) score += 120;
        }
        if (typeof p.population === "number") score += Math.floor(p.population / 100000);
        return { place: p, score };
      }).sort((a, b) => b.score - a.score);

      const pick = scored[0].place;
      const chosen = {
        lat: pick.lat,
        lon: pick.lon,
        name: pick.name,
        country: pick.country,
        state: pick.state
      };

      setLastPlace(chosen);
      await fetchByCoords(chosen);

      setStatus("done");
    } catch (e) {
      setError(e.message || "Network error");
      setStatus("error");
    }
  };

  // When units change, refetch for the last place
  useEffect(() => {
    const refetch = async () => {
      if (!lastPlace) return;
      try {
        setStatus("loading");
        setError("");
        await fetchByCoords(lastPlace);
        setStatus("done");
      } catch (e) {
        setError(e.message || "Network error");
        setStatus("error");
      }
    };
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]); // depend only on units; we use lastPlace snapshot

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
``