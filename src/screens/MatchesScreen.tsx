import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, SegmentedButtons, Text } from 'react-native-paper';
import { MATCHES_URL } from '../config';
import type { MatchesData } from '../matches';
import { MatchCard } from '../components/MatchCard';
import { useFavorites } from '../hooks/useFavorites';

export function MatchesScreen() {
  const { isFavorite, toggle } = useFavorites();
  const [data, setData] = useState<MatchesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const controller = new AbortController();

    async function loadMatches() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(MATCHES_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Не удалось загрузить матчи (HTTP ${response.status}).`);
        }
        const result: MatchesData = await response.json();
        if (!result || typeof result.round !== 'number' || !Array.isArray(result.matches)) {
          throw new Error('Сервер вернул некорректные данные матчей.');
        }
        if (!controller.signal.aborted) setData(result);
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

  const matches = (data?.matches ?? []).filter((match) => filter === 'all' || match.status === filter);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="labelLarge" style={styles.eyebrow}>ФУТБОЛ</Text>
        <Text variant="headlineMedium" accessibilityRole="header" style={styles.title}>
          Матчи тура
        </Text>
        <Text variant="bodyMedium" style={styles.muted}>
          {data ? `Тур ${data.round}` : 'Расписание и результаты'}
        </Text>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          style={styles.filters}
          buttons={[
            { value: 'all', label: 'Все', style: { flex: 0.5 } },
            { value: 'scheduled', label: 'Предстоящие' },
            { value: 'finished', label: 'Завершённые' },
          ]}
        />
      </View>

      {loading ? (
        <View style={styles.state} accessibilityLiveRegion="polite">
          <ActivityIndicator accessibilityLabel="Загрузка матчей" />
          <Text variant="bodyLarge" style={styles.muted}>Загружаем матчи…</Text>
        </View>
      ) : error ? (
        <View style={styles.state} accessibilityLiveRegion="polite">
          <Text variant="titleMedium">Не удалось загрузить матчи</Text>
          <Text variant="bodyMedium" style={styles.stateText}>{error}</Text>
          <Button mode="contained" onPress={() => setAttempt((value) => value + 1)}>
            Повторить
          </Button>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(match) => match.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.state}>
              <Text variant="titleMedium">
                {filter === 'all' ? 'Матчей пока нет' : 'Нет матчей в этой категории'}
              </Text>
              <Text variant="bodyMedium" style={styles.stateText}>
                {filter === 'all'
                  ? 'Здесь появятся расписание и результаты тура.'
                  : 'Выберите другой фильтр, чтобы посмотреть матчи.'}
              </Text>
            </View>
          }
          renderItem={({ item: match }) => (
            <MatchCard
              match={match}
              isFavorite={isFavorite(match.id)}
              onToggleFavorite={() => toggle(match.id)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, gap: 6 },
  eyebrow: { color: '#2458c6', letterSpacing: 2 },
  title: { fontWeight: '700' },
  muted: { color: '#596579' },
  filters: { marginTop: 12 },
  list: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  stateText: { textAlign: 'center', color: '#596579' },
});
