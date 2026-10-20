import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, SegmentedButtons, Text } from 'react-native-paper';
import { MatchCard } from '../components/MatchCard';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { useFavorites } from '../hooks/useFavorites';
import { useMatches } from '../hooks/useMatches';

export function MatchesScreen() {
  const { isFavorite, toggle } = useFavorites();
  const { data, loading, error, updatedAt, reload } = useMatches();
  const [filter, setFilter] = useState('all');

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
        <View style={styles.refresh}>
          <Button mode="outlined" onPress={reload} loading={loading} disabled={loading}>
            Обновить
          </Button>
          {updatedAt && <UpdatedAgo since={updatedAt} />}
        </View>
        {error && data && (
          <Text variant="bodyMedium" style={styles.error} accessibilityLiveRegion="polite">
            Не удалось обновить. {error}
          </Text>
        )}
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          style={styles.filters}
          buttons={[
            { value: 'all', label: 'Все', style: { flex: 0.5, minWidth: 48 }, labelStyle: styles.filterLabel },
            { value: 'scheduled', label: 'Предстоящие', labelStyle: styles.filterLabel },
            { value: 'finished', label: 'Завершённые', labelStyle: styles.filterLabel },
          ]}
        />
      </View>

      {loading && !data ? (
        <View style={styles.state} accessibilityLiveRegion="polite">
          <ActivityIndicator accessibilityLabel="Загрузка матчей" />
          <Text variant="bodyLarge" style={styles.muted}>Загружаем матчи…</Text>
        </View>
      ) : error && !data ? (
        <View style={styles.state} accessibilityLiveRegion="polite">
          <Text variant="titleMedium">Не удалось загрузить матчи</Text>
          <Text variant="bodyMedium" style={styles.stateText}>{error}</Text>
          <Button mode="contained" onPress={reload}>
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
  refresh: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 8 },
  error: { color: '#b42332' },
  filters: { marginTop: 12 },
  filterLabel: { fontSize: 12 },
  list: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  stateText: { textAlign: 'center', color: '#596579' },
});
