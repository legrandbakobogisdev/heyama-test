import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchObjects } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { ObjectItem } from '@/types/object';

export default function ObjectListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [objects, setObjects] = useState<ObjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchObjects()
      .then(setObjects)
      .finally(() => setLoading(false));

    const socket = getSocket();

    const onCreated = (obj: ObjectItem) => {
      setObjects((current) => [obj, ...current]);
    };
    const onDeleted = (id: string) => {
      setObjects((current) => current.filter((o) => o._id !== id));
    };

    socket.on('object:created', onCreated);
    socket.on('object:deleted', onDeleted);

    return () => {
      socket.off('object:created', onCreated);
      socket.off('object:deleted', onDeleted);
    };
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    fetchObjects()
      .then(setObjects)
      .finally(() => setRefreshing(false));
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator />
          </View>
        ) : objects.length === 0 ? (
          <View style={styles.centered}>
            <ThemedText themeColor="textSecondary">Aucun object pour l&apos;instant.</ThemedText>
          </View>
        ) : (
          <FlatList
            data={objects}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.textSecondary}
              />
            }
            renderItem={({ item }) => (
              <Pressable
                style={[styles.card, { backgroundColor: theme.backgroundElement }]}
                onPress={() => router.push(`/objects/${item._id}`)}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
                <ThemedText type="smallBold" numberOfLines={1} style={styles.cardTitle}>
                  {item.title}
                </ThemedText>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>

      <Link href="/objects/new" asChild>
        <Pressable style={styles.fab}>
          <ThemedText themeColor="background" type="title" style={styles.fabIcon}>
            +
          </ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  cardTitle: {
    padding: Spacing.three,
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B5BDB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabIcon: {
    fontSize: 32,
    lineHeight: 32,
  },
});
