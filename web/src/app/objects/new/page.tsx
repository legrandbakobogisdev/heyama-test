"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createObject } from "@/lib/api";

export default function NewObjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!image) {
      setError("Une image est requise");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createObject(title, description, image);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour
        </Link>
        <h1 className="mb-8 text-2xl font-semibold tracking-tight">
          Ajouter un object
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium">
              Titre
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="image" className="text-sm font-medium">
              Image
            </label>
            <Input
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Envoi..." : "Créer"}
          </Button>
        </form>
      </div>
    </main>
  );
}
