/* cSpell:disable */
/* eslint-disable */

import { useState, useEffect, useRef, useMemo } from "react";
import { CITY_META } from "../data/cityData";

const RI = {
  1: { color: "#10b981", label: "Low", range: "< 1 mm" },
  2: { color: "#3b82f6", label: "Light", range: "1–2 mm" },
  3: { color: "#f59e0b", label: "Moderate", range: "2–10 mm" },
  4: { color: "#f97316", label: "Heavy", range: "10–30 mm" },
  5: { color: "#ef4444", label: "Extreme", range: ">30 mm" },
};

function fmtShort(iso) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function groupByDate(data) {
  const map = {};
  data.forEach((item) => {
    const day = item.date?.slice(0, 10);
    if (!day) return;
    if (!map[day]) map[day] = {};
    map[day][item.city.toLowerCase()] = item;
  });
  return map;
}

export default function NepalRainfallHeatmap() {
  const apiUrl =
    import.meta.env.MODE === "development"
      ? "http://localhost:3000/data"
      : "/data";

  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const markersRef = useRef({});

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [citySearch, setCitySearch] = useState("");

  function initMap() {
    if (mapObjRef.current || !mapRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [28.0, 83.8],
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
      },
    ).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.rectangle(
      [
        [26.3, 80.0],
        [30.5, 88.2],
      ],
      {
        color: "#6366f1",
        weight: 2,
        fill: false,
        dashArray: "8 5",
        opacity: 0.45,
      },
    ).addTo(map);
    mapObjRef.current = map;
    setMapReady(true);
  }

  // ── Load Leaflet ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.L) {
      initMap();
      return;
    }
    if (!document.getElementById("leaflet-css")) {
      const css = document.createElement("link");
      css.id = "leaflet-css";
      css.rel = "stylesheet";
      css.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(css);
    }
    const js = document.createElement("script");
    js.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    js.onload = () => initMap();
    document.head.appendChild(js);
  }, []);

  // ── Fetch data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(apiUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
        const dates = [...new Set(d.map((i) => i.date?.slice(0, 10)))]
          .sort()
          .reverse();
        if (dates.length) setSelectedDate(dates[0]);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const grouped = useMemo(() => groupByDate(data), [data]);
  const dates = useMemo(() => Object.keys(grouped).sort().reverse(), [grouped]);
  const dayData = selectedDate ? grouped[selectedDate] || {} : {};

  const filteredCities = useMemo(() => {
    const q = citySearch.toLowerCase().trim();
    return Object.entries(CITY_META).filter(([, m]) =>
      m.label.toLowerCase().includes(q),
    );
  }, [citySearch]);

  // ── Draw markers ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapObjRef.current || !selectedDate) return;
    const L = window.L;
    const map = mapObjRef.current;
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    Object.entries(CITY_META).forEach(([cityKey, meta]) => {
      const record = dayData[cityKey];
      const ri = record?.rainfall_index ?? "1";
      const cfg = RI[ri] || RI["1"];
      const color = cfg.color;

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
            <div class="nrh-ring" style="position:absolute;width:44px;height:44px;border-radius:50%;background:${color}20;border:1.5px solid ${color}60;"></div>
            <div style="position:absolute;width:22px;height:22px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 0 16px ${color}bb,0 2px 8px rgba(0,0,0,0.25);"></div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        popupAnchor: [0, -26],
      });

      const marker = L.marker([meta.lat, meta.lng], { icon }).addTo(map);

      const popupHtml = record
        ? `
        <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:190px;background:#fff;color:#1e293b;border-radius:14px;padding:14px 16px;border:1.5px solid ${color}66;box-shadow:0 8px 32px rgba(0,0,0,0.15);">
          <div style="font-size:0.68rem;color:${color};letter-spacing:0.14em;text-transform:uppercase;margin-bottom:10px;font-weight:700;">${meta.label}</div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:5px 16px;font-size:0.78rem;line-height:1.6;">
            <span style="color:#64748b;">Rainfall</span><b>${record.rainfall ?? 0} mm</b>
            <span style="color:#64748b;">Index</span><b style="color:${color};">${ri} · ${cfg.label}</b>
            <span style="color:#64748b;">Temp</span><b>${record.temp?.toFixed(1)}°C</b>
            <span style="color:#64748b;">Humidity</span><b>${record.humidity?.toFixed(0)}%</b>
            <span style="color:#64748b;">Wind</span><b>${record.wind_speed?.toFixed(1)} m/s</b>
            <span style="color:#64748b;">Sky</span><b style="font-size:0.7rem;">${record.weather}</b>
          </div>
        </div>
      `
        : `<div style="font-family:'Plus Jakarta Sans',sans-serif;padding:10px 14px;color:#94a3b8;background:#fff;border-radius:10px;border:1px solid #e2e8f0;">${meta.label} — no data</div>`;

      marker.bindPopup(popupHtml, { maxWidth: 240, className: "nrh-popup" });
      marker.on("click", () =>
        setSelectedCity(record ? { ...record, _meta: meta } : null),
      );
      markersRef.current[cityKey] = marker;
    });
  }, [mapReady, selectedDate, dayData]);

  // ── Open popup for selected city ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapObjRef.current || !selectedCity) return;
    const map = mapObjRef.current;
    const cityKey = selectedCity.city.toLowerCase();
    const marker = markersRef.current[cityKey];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedCity]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const vals = Object.values(dayData);
    if (!vals.length) return null;
    return {
      maxRain: Math.max(...vals.map((v) => v.rainfall ?? 0)).toFixed(2),
      avgTemp: (
        vals.reduce((a, b) => a + (b.temp ?? 0), 0) / vals.length
      ).toFixed(1),
      maxIndex: String(
        Math.max(...vals.map((v) => parseInt(v.rainfall_index ?? 1))),
      ),
      count: vals.length,
    };
  }, [dayData]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body, input, button { font-family: 'Plus Jakarta Sans', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .leaflet-popup-content-wrapper { background: transparent !important; padding: 0 !important; border: none !important; box-shadow: none !important; border-radius: 14px !important; }
        .leaflet-popup-tip-container { display: none !important; }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-control-zoom { border: 1px solid #e2e8f0 !important; border-radius: 10px !important; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important; }
        .leaflet-control-zoom a { background: #fff !important; color: #6366f1 !important; border-color: #e2e8f0 !important; font-size: 16px !important; width: 32px !important; height: 32px !important; line-height: 32px !important; }
        .leaflet-control-zoom a:hover { background: #f1f5f9 !important; color: #4f46e5 !important; }
        @keyframes nrh-ring-pulse { 0% { transform: scale(0.7); opacity: 0.9; } 80% { transform: scale(2.2); opacity: 0; } 100% { transform: scale(2.2); opacity: 0; } }
        .nrh-ring { animation: nrh-ring-pulse 2.4s ease-out infinite; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 4px; }
        .date-pill { transition: all 0.15s ease; cursor: pointer; }
        .date-pill:hover { transform: translateY(-1px); }
        .city-row { transition: background 0.12s ease; cursor: pointer; }
        .city-row:hover { background: #eff6ff !important; }
      `}</style>

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 shadow-sm shrink-0 gap-4 flex-wrap">
        <div>
          <p className="mono text-[0.58rem] tracking-[0.2em] text-indigo-400 uppercase mb-0.5">
            Nepal · Precipitation Monitor
          </p>
          <h1 className="text-xl font-bold bg-linear-to-r from-indigo-600 via-violet-500 to-purple-500 bg-clip-text text-transparent leading-tight">
            Rainfall Heatmap
          </h1>
        </div>

        {stats && (
          <div className="flex gap-2 flex-wrap">
            {[
              { l: "Cities", v: stats.count, c: "text-indigo-600" },
              { l: "Max Rain", v: `${stats.maxRain} mm`, c: "text-violet-600" },
              { l: "Avg Temp", v: `${stats.avgTemp}°C`, c: "text-purple-600" },
              {
                l: "Peak Index",
                v: stats.maxIndex,
                c: null,
                ri: stats.maxIndex,
              },
            ].map((s) => (
              <div
                key={s.l}
                className="text-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm"
              >
                <div
                  className={`mono text-base font-bold ${s.c || ""}`}
                  style={s.ri ? { color: RI[s.ri]?.color } : {}}
                >
                  {s.v}
                </div>
                <div className="mono text-[0.55rem] text-slate-400 uppercase tracking-widest">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* ── DATE BAR ── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200 overflow-x-auto shrink-0">
        <span className="mono text-[0.58rem] text-slate-400 uppercase tracking-widest whitespace-nowrap mr-1">
          Date →
        </span>
        {dates.map((d) => {
          const active = d === selectedDate;
          return (
            <button
              key={d}
              onClick={() => {
                setSelectedDate(d);
                setSelectedCity(null);
              }}
              className="date-pill mono text-[0.65rem] whitespace-nowrap px-3 py-1 rounded-lg border"
              style={{
                background: active ? "#eef2ff" : "#f8fafc",
                borderColor: active ? "#6366f1" : "#e2e8f0",
                color: active ? "#4f46e5" : "#94a3b8",
                boxShadow: active ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
                fontWeight: active ? 600 : 400,
              }}
            >
              {fmtShort(d)}
            </button>
          );
        })}
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* MAP */}
        <div className="relative flex-1">
          {loading && (
            <div className="absolute inset-0 z-999 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-5xl mb-3 animate-bounce">🌧️</div>
                <p className="mono text-indigo-500 text-xs tracking-widest">
                  Loading weather data…
                </p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-999 flex items-center justify-center bg-slate-50">
              <div className="text-center max-w-sm p-8 bg-white rounded-2xl border border-red-200 shadow-lg">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-red-500 font-semibold mb-2">
                  Could not load data
                </p>
                <code className="mono text-xs text-slate-500">{error}</code>
                <p className="text-slate-400 text-xs mt-3">
                  Ensure{" "}
                  <span className="text-indigo-500 font-medium">
                    localhost:3000/data
                  </span>{" "}
                  is running with CORS enabled.
                </p>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="w-56 bg-white border-l border-slate-200 flex flex-col overflow-hidden shrink-0 shadow-[-2px_0_8px_rgba(0,0,0,0.04)]">
          {/* Legend */}
          <div className="px-3 pt-3 pb-2.5 border-b border-slate-100 shrink-0">
            <p className="mono text-[0.55rem] tracking-[0.18em] text-slate-400 uppercase mb-2">
              Index Legend
            </p>
            {Object.entries(RI).map(([idx, cfg]) => (
              <div key={idx} className="flex items-center gap-2 mb-5">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    background: cfg.color,
                    boxShadow: `0 0 6px ${cfg.color}88`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[1.1rem] font-semibold leading-none"
                    style={{ color: cfg.color }}
                  >
                    {cfg.label}
                  </div>
                  <div className="mono text-[1rem] text-slate-400 leading-none mt-0.5">
                    {cfg.range}
                  </div>
                </div>
                <div className="mono text-[0.55rem] text-slate-400 bg-slate-100 px-1 rounded">
                  #{idx}
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="px-3 pt-2.5 pb-2 border-b border-slate-100 shrink-0">
            <p className="mono text-[0.55rem] tracking-[0.18em] text-slate-400 uppercase mb-1.5">
              Search City
            </p>
            <div className="relative">
              <svg
                className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="Type city name…"
                className="w-full pl-7 pr-6 py-1.5 rounded-lg text-[0.7rem] bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              {citySearch && (
                <button
                  onClick={() => setCitySearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs leading-none"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* City list — NO hover tooltip, just clickable rows */}
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {filteredCities.length === 0 && (
              <p className="text-slate-400 text-xs text-center py-4">
                No cities found
              </p>
            )}
            {filteredCities.map(([key, meta]) => {
              const rec = dayData[key];
              const ri = rec?.rainfall_index;
              const cfg = RI[ri];
              const isSelected = selectedCity?.city?.toLowerCase() === key;
              return (
                <div
                  key={key}
                  className="city-row flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5"
                  style={{
                    background: isSelected ? "#eef2ff" : "transparent",
                    border: isSelected
                      ? `1px solid ${cfg?.color ?? "#6366f1"}44`
                      : "1px solid transparent",
                  }}
                  onClick={() =>
                    setSelectedCity(rec ? { ...rec, _meta: meta } : null)
                  }
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: cfg?.color || "#cbd5e1",
                      boxShadow: cfg ? `0 0 5px ${cfg.color}88` : "none",
                    }}
                  />
                  {/* city name only — no rainfall mm shown to avoid tooltip-like feel */}
                  <span className="text-[0.73rem] flex-1 text-slate-600 font-medium">
                    {meta.label}
                  </span>
                  {rec ? (
                    <span
                      className="mono text-[0.62rem] font-medium"
                      style={{ color: cfg?.color || "#94a3b8" }}
                    >
                      {rec.rainfall?.toFixed(1)}mm
                    </span>
                  ) : (
                    <span className="mono text-[0.6rem] text-slate-300">—</span>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
