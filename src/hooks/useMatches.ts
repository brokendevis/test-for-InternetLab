import { useEffect, useState } from 'react';
import { MATCHES_URL } from '../config';
import type { MatchesData } from '../matches';

export function useMatches() {
  const [data, setData] = useState<MatchesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  function reload() {
    setLoading(true);
    setAttempt((value) => value + 1);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadMatches() {
      setError(null);
      try {
        const response = await fetch(MATCHES_URL, { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Не удалось загрузить матчи (HTTP ${response.status}).`);
        }
        const result: MatchesData = await response.json();
        if (!result || typeof result.round !== 'number' || !Array.isArray(result.matches)) {
          throw new Error('Сервер вернул некорректные данные матчей.');
        }
        if (!controller.signal.aborted) {
          setData(result);
          setUpdatedAt(new Date());
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Проверьте подключение к интернету.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadMatches();
    return () => controller.abort();
  }, [attempt]);

  return { data, loading, error, updatedAt, reload };
}
