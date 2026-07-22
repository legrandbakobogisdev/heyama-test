"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteObject, fetchObject, proxiedImageUrl } from "@/lib/api";
import { ObjectItem } from "@/types/object";

function BackLink() {
  return (
    <Link
      href="/"
      className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
    >
      ← Retour
    </Link>
  );
}

export default function ObjectDetailPage() {
  const { id } = useParams<{ id: string }>();
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

  async function handleDelete() {
    if (!window.confirm("Supprimer définitivement cet object ?")) return;

    setDeleting(true);
    await deleteObject(id);
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-md">
          <BackLink />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </main>
    );
  }

  if (notFound || !object) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-md">
          <BackLink />
          <p className="text-sm text-muted-foreground">Object introuvable.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-md">
        <BackLink />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={proxiedImageUrl(object.imageUrl)}
          alt={object.title}
          className="mb-6 h-64 w-full rounded-lg object-cover"
        />
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
          {object.title}
        </h1>
        <p className="mb-4 text-muted-foreground">{object.description}</p>
        <p className="mb-6 text-sm text-muted-foreground">
          Créé le {new Date(object.createdAt).toLocaleString("fr-FR")}
        </p>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </main>
  );
}
