import React from "react";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell} from "recharts";
import "../styles/Components.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B", "#4ECDC4", "#45B7D1"];

// Grafico de barras - clasificacion
const StandingsChart = ({data}) => {
  if (!data || data.length === 0) return <p className="no-data">No hay datos disponibles</p>;

  const chartData = data.sort((a, b) => a.position - b.position).slice(0, 10);

  return (
    <div className="chart-wrapper">
      <h3>Top 10 Equipos</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical" margin={{top: 20, right: 30, left: 100, bottom: 5}}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
          <Tooltip formatter={(value, name) => [value, name === "points" ? "Points" : name === "wins" ? "Wins" : "Played"]} />
          <Legend />
          <Bar dataKey="points" fill="#8884d8" name="Points" />
          <Bar dataKey="wins" fill="#82ca9d" name="Wins" />
          <Bar dataKey="played" fill="#ffc658" name="Played" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Grafico de líneas - mas goles
const GoalsChart = ({data}) => {
  if (!data || data.length === 0) return <p className="no-data">No hay datos disponibles</p>;

  const chartData = data.sort((a, b) => b.goalsFor - a.goalsFor).slice(0, 8);

  return (
    <div className="chart-wrapper">
      <h3>Top 8 Por Goles</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="goalsFor" stroke="#8884d8" name="Goals For" strokeWidth={2} />
          <Line type="monotone" dataKey="goalsAgainst" stroke="#ff6b6b" name="Goals Against" strokeWidth={2} />
          <Line type="monotone" dataKey="goalDifference" stroke="#4ECDC4" name="Goal Difference" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Grafico circular - porcentaje de victorias
const WinPercentageChart = ({data}) => {
  if (!data || data.length === 0) return <p className="no-data">No hay datos disponibles</p>;

  const pieData = data
    .filter((team) => team.played > 0)
    .sort((a, b) => b.winPercentage - a.winPercentage)
    .slice(0, 6)
    .map((team) => ({
      name: team.name,
      value: Math.round(team.winPercentage),
      wins: team.wins,
      played: team.played,
    }));

  if (pieData.length === 0) return <p className="no-data">No hay datos disponibles</p>;

  return (
    <div className="chart-wrapper">
      <h3>Top 6 Equipos por Porcentaje de Victoria</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie data={pieData} cx="50%" cy="50%" labelLine={true} label={({name, value}) => `${name}: ${value}%`} outerRadius={120} fill="#8884d8" dataKey="value">
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name, props) => [`${value}% (${props.payload.wins} wins of ${props.payload.played} games)`, "Win Percentage"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Tabla de proximos partidos
const FixturesTable = ({data}) => {
  console.log("Fixture Data:", data);
  if (!data || data.length === 0) return <p className="no-data">No hay datos disponibles</p>;

  const upcomingFixtures = data
    .filter((fixture) => new Date(fixture.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 10);

  if (upcomingFixtures.length === 0) return <p className="no-data">No hay datos disponibles</p>;

  return (
    <div className="chart-wrapper">
      <h3>Proximos 10 partidos</h3>
      <div className="fixtures-table-container">
        <table className="fixtures-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Equipo Local</th>
              <th>Equipo Visitante</th>
              <th>Estadio</th>
            </tr>
          </thead>
          <tbody>
            {upcomingFixtures.map((fixture) => (
              <tr key={fixture.id}>
                <td>
                  {new Date(fixture.date).toLocaleDateString()} {new Date(fixture.date).toLocaleTimeString()}
                </td>
                <td className="team-cell">
                  <img src={fixture.homeTeam.logo} alt={fixture.homeTeam.name} className="team-logo" />
                  {fixture.homeTeam.name}
                </td>
                <td className="team-cell">
                  <img src={fixture.awayTeam.logo} alt={fixture.awayTeam.name} className="team-logo" />
                  {fixture.awayTeam.name}
                </td>
                <td>{fixture.venue?.name || "TBA"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TeamRatiosChart = ({data}) => {
  if (!data || data.length === 0) return <p className="no-data">No hay datos disponibles</p>;

  const chartData = data.slice(0, 8);

  return (
    <div className="chart-wrapper">
      <h3>Team Efficiency Ratios (Top 8)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{top: 20, right: 30, left: 20, bottom: 70}}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" />
          <YAxis />
          <Tooltip formatter={(value, name) => [value, name === "pointsPerGame" ? "Points per Game" : name === "winPercentage" ? "Win %" : name === "goalsPerGame" ? "Goals per Game" : name]} />
          <Legend />
          <Bar dataKey="pointsPerGame" fill="#8884d8" name="PPG" />
          <Bar dataKey="winPercentage" fill="#82ca9d" name="Win %" />
          <Bar dataKey="goalsPerGame" fill="#ffc658" name="Goals PG" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Grafico mensual - rendimiento
const TimeAggregationChart = ({data}) => {
  if (!data || data.length === 0) return <p className="no-data">No hay datos disponibles</p>;

  return (
    <div className="chart-wrapper">
      <h3>Análisis Mensual de Rendimiento</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="avgGoalsPerMatch" stroke="#8884d8" name="Avg Goals/Match" strokeWidth={2} />
          <Line yAxisId="left" type="monotone" dataKey="totalGoals" stroke="#82ca9d" name="Total Goals" strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="homeWinPercentage" stroke="#ff6b6b" name="Home Win %" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Grafico de media movil
const MovingAverageChart = ({data}) => {
  if (!data || data.length === 0) return <p className="no-data">No hay datos disponibles</p>;

  return (
    <div className="chart-wrapper">
      <h3>5-Match Moving Averages</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="avgGoals" stroke="#8884d8" name="Avg Goals" strokeWidth={2} />
          <Line type="monotone" dataKey="homeWinPercentage" stroke="#82ca9d" name="Home Win %" strokeWidth={2} />
          <Line type="monotone" dataKey="awayWinPercentage" stroke="#ff6b6b" name="Away Win %" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const Charts = ({activeChart, teamsData, fixturesData, timeAggregations, movingAverages, topTeams}) => {
  const renderChart = () => {
    switch (activeChart) {
      case "standings":
        return <StandingsChart data={teamsData} />;
      case "goals":
        return <GoalsChart data={teamsData} />;
      case "form":
        return <WinPercentageChart data={teamsData} />;
      //   case "fixtures":
      //     return <FixturesTable data={fixturesData} />;
      case "ratios":
        return <TeamRatiosChart data={teamsData} />;
      case "time-analysis":
        return <TimeAggregationChart data={timeAggregations.byMonth} />;
      case "moving-average":
        return <MovingAverageChart data={movingAverages} />;
      default:
        return <StandingsChart data={teamsData} />;
    }
  };

  return <div className="charts-container">{renderChart()}</div>;
};

export default Charts;
