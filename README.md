# Análisis de Fútbol - Dashboard
Un panel interactivo para visualizar estadísticas y análisis de fútbol en tiempo real, con caching inteligente y transformaciones de datos avanzadas.

Fuente de Datos
API Principal: API-Sports Football API
Endpoint: https://v3.football.api-sports.io/
Plan: Free tier (100 requests por día)

Endpoints Utilizados:

GET /teams - Información de equipos

GET /standings - Tabla de posiciones

GET /fixtures - Partidos y resultados

GET /fixtures/events - Eventos de partidos

Datos Mock (Respaldo):
Cuando la API no está disponible, se utilizan datos de ejemplo basados en la Serie A 2023.

npm install -> Instalar dependencias
npm run dev -> Iniciar el Frontend
npm run server -> Iniciar Backend

Variables de Entorno
Crear un archivo .env en la raíz del proyecto:

API_SPORTS_KEY=tu_api_key_aqui

PORT=3001

Archivo .env.example incluido como referencia.

# Transformaciones Implementadas
1. Unión entre Endpoints
Fórmula: Combinación de datos de equipos, standings y fixtures
// Unión de datos de múltiples endpoints
teamData + standingsData + fixturesData → joinedData

2. Cálculos de Tasa
Métricas calculadas:
pointsPerGame = points / played
winPercentage = (wins / played) * 100
goalsPerGame = goalsFor / played
offensiveEfficiency = (goalsFor / (goalsFor + goalsAgainst)) * 100

3. Agregación Temporal
Agrupación por:
Mes (YYYY-MM)
Jornada (Matchday X)
Métricas por período:
Goles totales y promedios
Porcentajes de victorias locales/visitantes
Empates por período

4. Rankings Top-N
Clasificaciones por:
Puntos totales
Goles a favor
Porcentaje de victorias
Eficiencia ofensiva/defensiva
Mejor defensa (menos goles en contra)

5. Media Móvil
Ventana móvil de 5 partidos:
movingAverage = Σ(goals_in_last_5_matches) / 5
winPercentage = (wins_in_last_5 / 5) * 100

6. Normalización de Datos
Estandarización de formatos de fecha
Unificación de nombres de equipos
Conversión de tipos de datos
Manejo de valores nulos/undefined

# Decisiones de Diseño y Trade-offs
Arquitectura:
Frontend/Backend separados - Mejor escalabilidad pero mayor complejidad
Caching en localStorage - Reduce llamadas a API pero requiere gestión de expiración
Transformaciones en cliente - Mayor flexibilidad pero más procesamiento en navegador

UX/UI:
Diseño responsive - Funciona en móviles y desktop pero CSS más complejo
Panel de controles unificado - Mejor usabilidad pero layout más elaborado
Iconos y señales visuales - Mejor experiencia visual

Performance:
Debounce en filtros - Mejor performance pero feedback menos inmediato
Cache por 12 horas - Balance entre datos frescos y limitaciones de API

Trade-offs Aceptados:
Latencia vs Freshness: Cache de 12 horas para evitar rate limits (derivado de la recomendación del proveedor - 1 request/día)

# Flujo de Datos
Fetch: Obtención de datos de API o cache
Transform: Aplicación de transformaciones
Cache: Almacenamiento en localStorage
Visualize: Renderizado de gráficos
Interact: Filtros y actualizaciones

Estados de la Aplicación
Loading: Cargando datos iniciales
Success: Datos cargados y mostrados
Error: Manejo de errores de API
Cached: Usando datos almacenados
Empty: Sin datos disponibles

Diseño Responsive
El dashboard se adapta a:
Desktop: Layout completo con sidebars
Tablet: Reorganización de paneles
Mobile: Apilamiento vertical de componentes

Tecnologías Utilizadas
Frontend: React 18 + Vite + Recharts
Backend: Node.js + Express
Storage: localStorage API
Styling: CSS3 con variables custom
Build Tool: Vite

# Nota: Este proyecto requiere una API key gratuita de API-Sports. 
