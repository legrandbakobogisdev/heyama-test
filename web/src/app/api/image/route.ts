// Proxy d'image : évite que le navigateur du testeur touche directement
// l'URL ngrok (qui affiche une page d'avertissement HTML aux navigateurs
// au lieu de l'image). On fetch côté serveur avec le header qui contourne
// cet avertissement, puis on relaie les octets tels quels.
export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");

  if (!url) {
    return Response.json({ message: "Paramètre url manquant" }, { status: 400 });
  }

  const res = await fetch(url, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });

  if (!res.ok || !res.body) {
    return Response.json({ message: "Image introuvable" }, { status: 404 });
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
