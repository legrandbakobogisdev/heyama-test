"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchObjects, proxiedImageUrl } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { ObjectItem } from "@/types/object";

export default function Home() {
  const [objects, setObjects] = useState<ObjectItem[]>([]);
  const [loading, setLoading] = useState(true);

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

    socket.on("object:created", onCreated);
    socket.on("object:deleted", onDeleted);

    return () => {
      socket.off("object:created", onCreated);
      socket.off("object:deleted", onDeleted);
    };
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Objects</h1>
          <Button render={<Link href="/objects/new" />} nativeButton={false}>
            Ajouter
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        ) : objects.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun object pour l&apos;instant.
            </p>
            <Button
              variant="outline"
              render={<Link href="/objects/new" />}
              nativeButton={false}
            >
              Créer le premier
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {objects.map((object) => (
              <Link key={object._id} href={`/objects/${object._id}`}>
                <Card className="h-full overflow-hidden py-0 transition-colors hover:border-ring">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proxiedImageUrl(object.imageUrl)}
                    alt={object.title}
                    className="h-40 w-full object-cover"
                  />
                  <CardHeader className="pb-4">
                    <CardTitle className="line-clamp-1">
                      {object.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
