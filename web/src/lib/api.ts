import { ObjectItem } from "@/types/object";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// Le plan gratuit ngrok affiche une page d'avertissement HTML aux requetes
// GET venant d'un navigateur (pas aux POST/DELETE, curieusement). Ce header
// la contourne ; inoffensif quand on n'est pas derriere ngrok.
const NGROK_HEADERS = { "ngrok-skip-browser-warning": "true" };

export async function fetchObjects(): Promise<ObjectItem[]> {
  const res = await fetch(`${API_URL}/objects`, { headers: NGROK_HEADERS });
  if (!res.ok) throw new Error("Impossible de récupérer les objects");
  return res.json();
}

export async function fetchObject(id: string): Promise<ObjectItem> {
  const res = await fetch(`${API_URL}/objects/${id}`, {
    headers: NGROK_HEADERS,
  });
  if (!res.ok) throw new Error("Object introuvable");
  return res.json();
}

export async function createObject(
  title: string,
  description: string,
  image: File,
): Promise<ObjectItem> {
  const form = new FormData();
  form.append("title", title);
  form.append("description", description);
  form.append("image", image);

  const res = await fetch(`${API_URL}/objects`, {
    method: "POST",
    headers: NGROK_HEADERS,
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Échec de la création");
  }

  return res.json();
}

export async function deleteObject(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/objects/${id}`, {
    method: "DELETE",
    headers: NGROK_HEADERS,
  });
  if (!res.ok) throw new Error("Échec de la suppression");
}

// Le navigateur ne peut pas ajouter de header a une balise <img> ; on fetch
// donc l'image en JS (avec le header ci-dessus) et on la sert via une blob URL.
export async function fetchImageBlobUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl, { headers: NGROK_HEADERS });
  if (!res.ok) throw new Error("Image introuvable");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
