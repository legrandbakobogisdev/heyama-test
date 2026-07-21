import { ObjectItem } from "@/types/object";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function fetchObjects(): Promise<ObjectItem[]> {
  const res = await fetch(`${API_URL}/objects`);
  if (!res.ok) throw new Error("Impossible de récupérer les objects");
  return res.json();
}

export async function fetchObject(id: string): Promise<ObjectItem> {
  const res = await fetch(`${API_URL}/objects/${id}`);
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
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Échec de la création");
  }

  return res.json();
}

export async function deleteObject(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/objects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Échec de la suppression");
}
