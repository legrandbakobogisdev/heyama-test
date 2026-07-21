import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { deleteObject, fetchObject } from '@/lib/api';
import { ObjectItem } from '@/types/object';

export default function ObjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [object, setObject] = useState<ObjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchObject(id)
      .then(setObject)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  function confirmDelete() {
    Alert.alert('Supprimer', 'Supprimer définitivement cet object ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          await deleteObject(id);
          router.back();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (notFound || !object) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary">Object introuvable.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <Image source={{ uri: object.imageUrl }} style={styles.image} contentFit="cover" />
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            {object.title}
          </ThemedText>
          <ThemedText themeColor="textSecondary">{object.description}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Créé le {new Date(object.createdAt).toLocaleString('fr-FR')}
          </ThemedText>

          <Pressable
            onPress={confirmDelete}
            disabled={deleting}
            style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}>
            <ThemedText type="smallBold" style={styles.deleteButtonText}>
              {deleting ? 'Suppression...' : 'Supprimer'}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
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
  image: {
    width: '100%',
    height: 280,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  deleteButton: {
    marginTop: Spacing.three,
    borderRadius: 8,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    backgroundColor: 'rgba(224, 49, 49, 0.1)',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#E03131',
  },
});
