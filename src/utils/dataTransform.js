export const joinTeamDataWithPerformance = (teamsData, standingsData, fixturesData) => {
    if (!teamsData || !standingsData || !fixturesData) return [];

    const leagueStandings = standingsData[0]?.league?.standings[0] || [];

    return teamsData.map(team => {
        // Buscar el equipo en los standings
        const teamStanding = leagueStandings.find(s => s.team.id === team.team.id);

        // Calcular estadisticas de fixtures
        const teamFixtures = fixturesData.filter(f =>
            f.teams.home.id === team.team.id || f.teams.away.id === team.team.id
        );

        const completedFixtures = teamFixtures.filter(f =>
            f.fixture.status.short === 'FT' || f.fixture.status.short === 'AET'
        );

        const wins = completedFixtures.filter(f => {
            const isHome = f.teams.home.id === team.team.id;
            return (isHome && f.teams.home.winner) || (!isHome && f.teams.away.winner);
        }).length;

        const draws = completedFixtures.filter(f =>
            f.teams.home.winner === null && f.teams.away.winner === null
        ).length;

        const losses = completedFixtures.length - wins - draws;

        return {
            id: team.team.id,
            name: team.team.name,
            logo: team.team.logo,
            country: team.team.country,
            founded: team.team.founded,
            venue: team.venue,
            position: teamStanding?.rank || 0,
            points: teamStanding?.points || 0,
            wins: teamStanding?.all?.win || wins,
            draws: teamStanding?.all?.draw || draws,
            losses: teamStanding?.all?.lose || losses,
            goalsFor: teamStanding?.all?.goals?.for || 0,
            goalsAgainst: teamStanding?.all?.goals?.against || 0,
            goalDifference: teamStanding?.goalsDiff || 0,
            form: teamStanding?.form || '',
            played: teamStanding?.all?.played || completedFixtures.length,
            winPercentage: completedFixtures.length > 0 ? (wins / completedFixtures.length) * 100 : 0
        };
    });
};

export const groupFixturesByDate = (fixturesData) => {
    if (!fixturesData) return [];

    return fixturesData.reduce((acc, fixture) => {
        const date = fixture.fixture.date.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(fixture);
        return acc;
    }, {});
};

export const getTopTeams = (teamsData, limit = 10, criteria = 'points') => {
    if (!teamsData) return [];

    return [...teamsData]
        .sort((a, b) => b[criteria] - a[criteria])
        .slice(0, limit);
};

// Funcion para procesar datos para graficos
export const prepareChartData = (teamsData) => {
    if (!teamsData || teamsData.length === 0) return [];

    return teamsData.map(team => ({
        name: team.name,
        points: team.points,
        wins: team.wins,
        draws: team.draws,
        losses: team.losses,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
        goalDifference: team.goalDifference,
        winPercentage: team.winPercentage,
        position: team.position,
        played: team.played
    }));
};

// Funcion para preparar datos de fixtures
export const prepareFixturesData = (fixturesData) => {
    if (!fixturesData) return [];

    return fixturesData.map(fixture => ({
        id: fixture.fixture.id,
        date: fixture.fixture.date,
        timestamp: fixture.fixture.timestamp,
        status: fixture.fixture.status,
        homeTeam: {
            id: fixture.teams.home.id,
            name: fixture.teams.home.name,
            logo: fixture.teams.home.logo,
            winner: fixture.teams.home.winner
        },
        awayTeam: {
            id: fixture.teams.away.id,
            name: fixture.teams.away.name,
            logo: fixture.teams.away.logo,
            winner: fixture.teams.away.winner
        },
        goals: fixture.goals,
        venue: fixture.fixture.venue,
        league: fixture.league
    }));
};

// Estadisticas de rendimiento por equipo
export const calculateTeamRatios = (teamsData) => {
    if (!teamsData || teamsData.length === 0) return [];

    return teamsData.map(team => {
        const pointsPerGame = team.played > 0 ? (team.points / team.played).toFixed(2) : 0;
        const winPercentage = team.played > 0 ? (team.wins / team.played) * 100 : 0;
        const lossPercentage = team.played > 0 ? (team.losses / team.played) * 100 : 0;
        const goalsPerGame = team.played > 0 ? (team.goalsFor / team.played).toFixed(2) : 0;
        const goalsConcededPerGame = team.played > 0 ? (team.goalsAgainst / team.played).toFixed(2) : 0;

        const offensiveEfficiency = team.played > 0 ? (team.goalsFor / (team.goalsFor + team.goalsAgainst)) * 100 : 0;
        const defensiveEfficiency = team.played > 0 ? (team.goalsAgainst / (team.goalsFor + team.goalsAgainst)) * 100 : 0;

        return {
            ...team,
            pointsPerGame: parseFloat(pointsPerGame),
            winPercentage: parseFloat(winPercentage.toFixed(1)),
            lossPercentage: parseFloat(lossPercentage.toFixed(1)),
            goalsPerGame: parseFloat(goalsPerGame),
            goalsConcededPerGame: parseFloat(goalsConcededPerGame),
            offensiveEfficiency: parseFloat(offensiveEfficiency.toFixed(1)),
            defensiveEfficiency: parseFloat(defensiveEfficiency.toFixed(1)),
            efficiencyRatio: parseFloat((offensiveEfficiency / defensiveEfficiency).toFixed(2))
        };
    });
};

// Rendimiento mensual
export const aggregateFixturesByTime = (fixturesData) => {
    if (!fixturesData || fixturesData.length === 0) return { byMonth: [], byMatchday: [] };

    const byMonth = {};
    const byMatchday = {};

    fixturesData.forEach(fixture => {
        if (!fixture.fixture || !fixture.league) return;

        const date = new Date(fixture.fixture.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const matchday = fixture.league.round || 'Unknown';

        if (!byMonth[monthKey]) {
            byMonth[monthKey] = {
                month: monthKey,
                totalGoals: 0,
                totalMatches: 0,
                homeWins: 0,
                awayWins: 0,
                draws: 0
            };
        }

        if (!byMatchday[matchday]) {
            byMatchday[matchday] = {
                matchday,
                totalGoals: 0,
                totalMatches: 0,
                homeWins: 0,
                awayWins: 0,
                draws: 0
            };
        }

        const goals = fixture.goals.home + fixture.goals.away;
        byMonth[monthKey].totalGoals += goals;
        byMonth[monthKey].totalMatches += 1;

        byMatchday[matchday].totalGoals += goals;
        byMatchday[matchday].totalMatches += 1;

        if (fixture.teams.home.winner) {
            byMonth[monthKey].homeWins += 1;
            byMatchday[matchday].homeWins += 1;
        } else if (fixture.teams.away.winner) {
            byMonth[monthKey].awayWins += 1;
            byMatchday[matchday].awayWins += 1;
        } else {
            byMonth[monthKey].draws += 1;
            byMatchday[matchday].draws += 1;
        }
    });

    // Calcular promedios y ratios
    const processTimeData = (data) => {
        return Object.values(data).map(item => ({
            ...item,
            avgGoalsPerMatch: item.totalMatches > 0 ? (item.totalGoals / item.totalMatches).toFixed(2) : 0,
            homeWinPercentage: item.totalMatches > 0 ? (item.homeWins / item.totalMatches) * 100 : 0,
            awayWinPercentage: item.totalMatches > 0 ? (item.awayWins / item.totalMatches) * 100 : 0,
            drawPercentage: item.totalMatches > 0 ? (item.draws / item.totalMatches) * 100 : 0
        }));
    };

    return {
        byMonth: processTimeData(byMonth).sort((a, b) => a.month.localeCompare(b.month)),
        byMatchday: processTimeData(byMatchday).sort((a, b) => {
            const aNum = parseInt(a.matchday.replace(/\D/g, '')) || 0;
            const bNum = parseInt(b.matchday.replace(/\D/g, '')) || 0;
            return aNum - bNum;
        })
    };
};

// Media movil, window de 5 partidos
export const calculateMovingAverages = (fixturesData, windowSize = 5) => {
    if (!fixturesData || fixturesData.length === 0) return [];

    // Ordenar fixtures por fecha
    const sortedFixtures = [...fixturesData].sort((a, b) =>
        new Date(a.fixture.date) - new Date(b.fixture.date)
    );

    const movingAverages = [];

    for (let i = windowSize - 1; i < sortedFixtures.length; i++) {
        const window = sortedFixtures.slice(i - windowSize + 1, i + 1);

        const totalGoals = window.reduce((sum, fixture) => sum + fixture.goals.home + fixture.goals.away, 0);
        const avgGoals = totalGoals / windowSize;

        const homeWins = window.filter(f => f.teams.home.winner).length;
        const awayWins = window.filter(f => f.teams.away.winner).length;
        const draws = window.filter(f => !f.teams.home.winner && !f.teams.away.winner).length;

        movingAverages.push({
            date: window[window.length - 1].fixture.date,
            period: `Match ${i - windowSize + 2} to ${i + 1}`,
            avgGoals: parseFloat(avgGoals.toFixed(2)),
            homeWinPercentage: (homeWins / windowSize) * 100,
            awayWinPercentage: (awayWins / windowSize) * 100,
            drawPercentage: (draws / windowSize) * 100,
            totalMatches: windowSize
        });
    }

    return movingAverages;
};

// TOP equipos por metricas
export const getTopTeamsByMetrics = (teamsData, limit = 10) => {
    if (!teamsData || teamsData.length === 0) return {};

    return {
        byPoints: [...teamsData].sort((a, b) => b.points - a.points).slice(0, limit),
        byGoals: [...teamsData].sort((a, b) => b.goalsFor - a.goalsFor).slice(0, limit),
        byWinPercentage: [...teamsData]
            .filter(team => team.played > 0)
            .sort((a, b) => b.winPercentage - a.winPercentage)
            .slice(0, limit),
        byEfficiency: [...teamsData]
            .filter(team => team.played > 5) // Minimo 5 partidos para datos significativos
            .sort((a, b) => (b.efficiencyRatio || 0) - (a.efficiencyRatio || 0))
            .slice(0, limit),
        byDefense: [...teamsData].sort((a, b) => a.goalsAgainst - b.goalsAgainst).slice(0, limit)
    };
};