import React from "react";
import "../styles/Components.css";

const ChartSelector = ({activeChart, onChartChange}) => {
  const chartTypes = [
    {id: "standings", label: "🏆 Clasificación", icon: "🏆"},
    {id: "goals", label: "⚽ Goles", icon: "⚽"},
    {id: "form", label: "📊 Forma", icon: "📊"},
    // {id: "fixtures", label: "📅 Partidos", icon: "📅"},
    {id: "ratios", label: "📈 Ratios", icon: "📈"},
    {id: "time-analysis", label: "⏰ Análisis temporal", icon: "⏰"},
    {id: "moving-average", label: "📉 Media móvil", icon: "📉"},
  ];

  return (
    <div className="chart-selector-container">
      <h3 className="chart-selector-title">📊 Gráficos</h3>
      <div className="chart-buttons-grid">
        {chartTypes.map((chart) => (
          <button key={chart.id} className={`chart-btn ${activeChart === chart.id ? "active" : ""}`} onClick={() => onChartChange(chart.id)} title={chart.label}>
            <span className="chart-btn-icon">{chart.icon}</span>
            <span className="chart-btn-text">{chart.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChartSelector;
