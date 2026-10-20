import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';
import { MATCHES_URL } from '../config';
import type { MatchesData } from '../matches';

const statuses = new Map([
  ['scheduled', 'Предстоит'],
  ['finished', 'Завершён'],
  ['live', 'В прямом эфире'],
  ['postponed', 'Перенесён'],
]);

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function MatchesScreen() {
  const [data, setData] = useState<MatchesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

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
          data={data?.matches ?? []}
          keyExtractor={(match) => match.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.state}>
              <Text variant="titleMedium">Матчей пока нет</Text>
              <Text variant="bodyMedium" style={styles.stateText}>
                Здесь появятся расписание и результаты тура.
              </Text>
            </View>
          }
          renderItem={({ item: match }) => (
            <Card mode="outlined" style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.meta}>
                  <Text variant="labelMedium" style={[
                    styles.status,
                    match.status === 'live' && styles.live,
                  ]}>
                    {statuses.get(match.status) ?? 'Статус неизвестен'}
                    {match.status === 'live' && match.minute !== undefined ? ` · ${match.minute}′` : ''}
                  </Text>
                  <Text variant="bodySmall" style={styles.muted}>
                    {match.startsAt ? dateFormat.format(new Date(match.startsAt)) : 'Дата уточняется'}
                  </Text>
                </View>
                <View style={styles.team}>
                  <Text variant="titleMedium" style={styles.teamName}>{match.home.name}</Text>
                  <Text variant="titleLarge" style={styles.score}>{match.score?.home ?? '—'}</Text>
                </View>
                <View style={styles.team}>
                  <Text variant="titleMedium" style={styles.teamName}>{match.away.name}</Text>
                  <Text variant="titleLarge" style={styles.score}>{match.score?.away ?? '—'}</Text>
                </View>
              </Card.Content>
            </Card>
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
  list: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16 },
  cardContent: { gap: 8 },
  meta: { gap: 4, paddingBottom: 8 },
  status: { color: '#596579' },
  live: { color: '#b42332' },
  team: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  teamName: { flex: 1, flexShrink: 1 },
  score: { minWidth: 28, textAlign: 'center', fontWeight: '700', fontVariant: ['tabular-nums'] },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  stateText: { textAlign: 'center', color: '#596579' },
});
