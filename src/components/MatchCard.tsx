import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import type { Match } from '../matches';
import { FavoriteButton } from './FavoriteButton';

type Props = {
  match: Match;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

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

export function MatchCard({ match, isFavorite, onToggleFavorite }: Props) {
  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
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
          <FavoriteButton active={isFavorite} onPress={onToggleFavorite} />
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
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16 },
  cardContent: { gap: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  meta: { flex: 1, gap: 4, paddingBottom: 8 },
  status: { color: '#596579' },
  live: { color: '#b42332' },
  muted: { color: '#596579' },
  team: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  teamName: { flex: 1, flexShrink: 1 },
  score: { minWidth: 28, textAlign: 'center', fontWeight: '700', fontVariant: ['tabular-nums'] },
});
