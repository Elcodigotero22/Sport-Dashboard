import React, {useState, useEffect} from "react";
import useLocalStorage from "./hooks/useLocalStorage";
import {useCachedData, generateCacheKey, cleanupExpiredCache, getCacheInfo} from "./hooks/useCachedData";
import {joinTeamDataWithPerformance, prepareChartData, prepareFixturesData, calculateTeamRatios, aggregateFixturesByTime, calculateMovingAverages, getTopTeamsByMetrics} from "./utils/dataTransform";
import Header from "./components/Header";
import Filters from "./components/Filters";
import ChartSelector from "./components/ChartSelector";
import Charts from "./components/Charts";
import Loader from "./components/Loader";
import ErrorBoundary from "./components/ErrorBoundary";
import CacheStatus from "./components/CacheStatus";
import "./styles/App.css";

function App() {
  const [league, setLeague] = useLocalStorage("selectedLeague", 135);
  const [season, setSeason] = useLocalStorage("selectedSeason", 2023);
  const [activeChart, setActiveChart] = useLocalStorage("activeChart", "standings");
  const [cacheInfo, setCacheInfo] = useState([]);

  // Limpiar cache al cargar la app
  useEffect(() => {
    cleanupExpiredCache();
    setCacheInfo(getCacheInfo());
  }, []);

  const fetchApiData = async (endpoint, league, season) => {
    const response = await fetch(`/api/proxy?endpoint=${endpoint}&league=${league}&season=${season}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  // Fetch datos con caching
  const {data: standingsData, loading: standingsLoading, error: standingsError, isCached: isStandingsCached} = useCachedData(generateCacheKey("standings", league, season), () => fetchApiData("standings", league, season), [league, season]);

  const {data: fixturesRawData, loading: fixturesLoading, error: fixturesError, isCached: isFixturesCached} = useCachedData(generateCacheKey("fixtures", league, season), () => fetchApiData("fixtures", league, season), [league, season]);

  const {data: teamsRawData, loading: teamsLoading, error: teamsError, isCached: isTeamsCached} = useCachedData(generateCacheKey("teams", league, season), () => fetchApiData("teams", league, season), [league, season]);

  const [transformedData, setTransformedData] = useState({
    teamRatios: [],
    timeAggregations: {byMonth: [], byMatchday: []},
    movingAverages: [],
    topTeams: {},
  });

  useEffect(() => {
    // Procesar datos cuando esten disponibles
    if (standingsData && teamsRawData && fixturesRawData) {
      const joinedData = joinTeamDataWithPerformance(teamsRawData.response, standingsData.response, fixturesRawData.response);

      const chartReadyData = prepareChartData(joinedData);
      const processedFixtures = prepareFixturesData(fixturesRawData.response);

      const teamRatios = calculateTeamRatios(chartReadyData);
      const timeAggregations = aggregateFixturesByTime(fixturesRawData.response);
      const movingAverages = calculateMovingAverages(fixturesRawData.response, 5);
      const topTeams = getTopTeamsByMetrics(teamRatios, 10);

      setTransformedData({
        teamRatios,
        timeAggregations,
        movingAverages,
        topTeams,
        rawData: {
          teams: chartReadyData,
          fixtures: processedFixtures,
        },
      });

      setCacheInfo(getCacheInfo());
    }
  }, [standingsData, teamsRawData, fixturesRawData]);

  const loading = standingsLoading || fixturesLoading || teamsLoading;
  const error = standingsError || fixturesError || teamsError;

  // Estado general del cache
  const isAnyCached = isStandingsCached || isFixturesCached || isTeamsCached;
  const allCached = isStandingsCached && isFixturesCached && isTeamsCached;

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Parece que ha ocurrido un error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );

  return (
    <ErrorBoundary>
      <div className="app">
        <Header title="Analíticas de Fútbol" />

        <div className="app-main">
          <div className="controls-panel">
            <div className="controls-left">
              <Filters league={league} season={season} onLeagueChange={setLeague} onSeasonChange={setSeason} />
            </div>

            <div className="controls-right">
              <ChartSelector activeChart={activeChart} onChartChange={setActiveChart} hasAdvancedData={transformedData.teamRatios.length > 0} />
            </div>
          </div>

          <Charts
            activeChart={activeChart}
            teamsData={transformedData.teamRatios}
            fixturesData={transformedData.rawData?.fixtures || []}
            timeAggregations={transformedData.timeAggregations}
            movingAverages={transformedData.movingAverages}
            topTeams={transformedData.topTeams}
            isDataCached={isAnyCached}
          />

          <div class="transformations-info">
            <h3>📊 Características de Analíticas</h3>
            <div class="features-grid">
              <div class="feature-item">
                <span class="feature-icon">🔗</span>
                <span>Integración de Datos</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📈</span>
                <span>Métricas de Rendimiento</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">⏰</span>
                <span>Análisis Temporal</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🏆</span>
                <span>Clasificaciones Principales</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📊</span>
                <span>Medias Móviles</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">💾</span>
                <span>Almacenamiento en Caché Inteligente</span>
              </div>
            </div>
          </div>
        </div>

        <div className="data-info">
          <p>
            <strong>Datos:</strong> {transformedData.teamRatios.length} Equipos |<strong> Cache:</strong> {isAnyCached ? "Datos de Cache" : "Datos recién"} |<strong> Actualización:</strong> Cada 12 horas
          </p>
          <CacheStatus
            cacheInfo={cacheInfo}
            onClearCache={() => {
              localStorage.clear();
              window.location.reload();
            }}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
