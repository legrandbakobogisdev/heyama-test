"use client";

import { useEffect, useState } from "react";
import { fetchImageBlobUrl } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export function ProxiedImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    fetchImageBlobUrl(src).then((url) => {
      if (cancelled) {
        URL.revokeObjectURL(url);
        return;
      }
      objectUrl = url;
      setBlobUrl(url);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!blobUrl) {
    return <Skeleton className={className} />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={blobUrl} alt={alt} className={className} />;
}
