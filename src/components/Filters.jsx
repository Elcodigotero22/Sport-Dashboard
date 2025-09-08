import React from "react";
import "../styles/Components.css";

const Filters = ({league, season, onLeagueChange, onSeasonChange}) => {
  const leagues = [
    {id: 39, name: "Premier League"},
    {id: 140, name: "La Liga"},
    {id: 135, name: "Serie A"},
    {id: 78, name: "Bundesliga"},
    {id: 61, name: "Ligue 1"},
  ];

  // La temporada 2024 esta limitada por el plan gratuito
  const seasons = [2024, 2023, 2022, 2021];

  return (
    <div className="filters-container">
      <h3 className="filters-title">📋 Filtros</h3>
      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="league-select" className="filter-label">
            Liga
          </label>
          <select id="league-select" value={league} onChange={(e) => onLeagueChange(Number(e.target.value))} className="filter-select">
            {leagues.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="season-select" className="filter-label">
            Temporada
          </label>
          <select id="season-select" value={season} onChange={(e) => onSeasonChange(Number(e.target.value))} className="filter-select">
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}/{s + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
