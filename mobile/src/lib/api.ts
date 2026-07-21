import { ObjectItem } from '@/types/object';

// IP locale du PC hôte requise ici (pas localhost) pour que le téléphone
// physique joigne l'API sur le même réseau Wi-Fi.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.100:3000';

export async function fetchObjects(): Promise<ObjectItem[]> {
  const res = await fetch(`${API_URL}/objects`);
  if (!res.ok) throw new Error('Impossible de récupérer les objects');
  return res.json();
}

export async function fetchObject(id: string): Promise<ObjectItem> {
  const res = await fetch(`${API_URL}/objects/${id}`);
  if (!res.ok) throw new Error('Object introuvable');
  return res.json();
}

export async function createObject(
  title: string,
  description: string,
  image: { uri: string; name: string; type: string },
): Promise<ObjectItem> {
  const form = new FormData();
  form.append('title', title);
  form.append('description', description);
  // React Native accepte cette forme spéciale (uri/name/type) pour FormData
  form.append('image', image as unknown as Blob);

  const res = await fetch(`${API_URL}/objects`, {
    method: 'POST',
    body: form,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Échec de la création');
  }

  return res.json();
}

export async function deleteObject(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/objects/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Échec de la suppression');
}
