import { useState, useEffect } from 'react';

const CACHE_PREFIX = 'football_data_';
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 horas en milisegundos

export const useCachedData = (key, fetchFunction, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCached, setIsCached] = useState(false);

    const cacheKey = `${CACHE_PREFIX}${key}`;

    const getFromCache = () => {
        try {
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const { data: cachedData, timestamp } = JSON.parse(cached);

            // Verificar si el cache ha expirado
            const isExpired = Date.now() - timestamp > CACHE_DURATION;

            if (isExpired) {
                localStorage.removeItem(cacheKey);
                return null;
            }

            return cachedData;
        } catch (error) {
            console.error('Error reading cache:', error);
            return null;
        }
    };

    const saveToCache = (dataToCache) => {
        try {
            const cacheItem = {
                data: dataToCache,
                timestamp: Date.now(),
                expires: Date.now() + CACHE_DURATION
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    };

    const clearCache = () => {
        try {
            localStorage.removeItem(cacheKey);
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const cachedData = getFromCache();

            // Verificar si existe en cache
            if (cachedData) {
                setData(cachedData);
                setIsCached(true);
                setLoading(false);
                return;
            }

            const result = await fetchFunction();
            // Si no está, hacer fetch y guardar
            saveToCache(result);
            setData(result);
            setIsCached(false);

        } catch (err) {
            setError(err.message);
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const refetch = async () => {
        clearCache();
        await fetchData();
    };

    useEffect(() => {
        fetchData();
    }, dependencies);

    return { data, loading, error, refetch, isCached };
};

// Generar keys unicas de cache
export const generateCacheKey = (endpoint, league, season, chartType = '') => {
    return `${endpoint}_${league}_${season}_${chartType}`.toLowerCase();
};

// Limpiar cache
export const cleanupExpiredCache = () => {
    try {
        const now = Date.now();
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (now - item.timestamp > CACHE_DURATION) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    // Si hay error limpiar el item
                    localStorage.removeItem(key);
                }
            }
        }
    } catch (error) {
        console.error('Error cleaning cache:', error);
    }
};

// Obtener info del cache
export const getCacheInfo = () => {
    try {
        const cacheInfo = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    cacheInfo.push({
                        key: key.replace(CACHE_PREFIX, ''),
                        timestamp: item.timestamp,
                        expires: item.expires,
                        size: JSON.stringify(item).length
                    });
                } catch (e) {
                }
            }
        }
        return cacheInfo;
    } catch (error) {
        console.error('Error getting cache info:', error);
        return [];
    }
};