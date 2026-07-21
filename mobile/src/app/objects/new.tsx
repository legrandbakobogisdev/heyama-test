import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { createObject } from '@/lib/api';

export default function ObjectCreateScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Accès à la galerie refusé");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  }

  async function handleSubmit() {
    if (!image) {
      setError('Une image est requise');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createObject(title, description, {
        uri: image.uri,
        name: image.fileName ?? 'photo.jpg',
        type: image.mimeType ?? 'image/jpeg',
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <View style={styles.field}>
          <ThemedText type="smallBold">Titre</ThemedText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold">Description</ThemedText>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={[
              styles.input,
              styles.textarea,
              { color: theme.text, borderColor: theme.backgroundSelected },
            ]}
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold">Image</ThemedText>
          <Pressable
            onPress={handlePickImage}
            style={[styles.imagePicker, { borderColor: theme.backgroundSelected }]}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.previewImage} contentFit="cover" />
            ) : (
              <ThemedText themeColor="textSecondary">Choisir une image</ThemedText>
            )}
          </Pressable>
        </View>

        {error && (
          <ThemedText style={styles.error} themeColor="text">
            {error}
          </ThemedText>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}>
          <ThemedText themeColor="background" type="smallBold">
            {submitting ? 'Envoi...' : 'Créer'}
          </ThemedText>
        </Pressable>
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
    padding: Spacing.three,
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  error: {
    color: '#E03131',
  },
  submitButton: {
    backgroundColor: '#3B5BDB',
    borderRadius: 8,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
});
