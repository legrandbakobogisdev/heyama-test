# Déploiement en production

## Ressources créées

| Service | Ressource | Détail |
|---|---|---|
| Render | `heyama-api` (srv-d9gas361a83c73bn7410) | Web service, plan gratuit, root dir `api/`, région Oregon |
| Render | `heyama-web` (srv-d9gb07u1a83c73bnes50) | Web service, plan gratuit, root dir `web/`, région Oregon |
| MongoDB Atlas | Org "Le grand's Org", projet `heyama-test` (6a60ab961ea6d2d0c75a72c2) | Cluster `heyama-cluster`, tier M0 (gratuit), AWS us-east-1 |
| MongoDB Atlas | DB user `heyama-api` | Rôle `readWriteAnyDatabase` |
| Cloudflare R2 | Bucket `heyama-objects` | Accès public via URL r2.dev, token API scopé "Object Read & Write" sur ce bucket uniquement |

Les deux services Render sont connectés au repo GitHub `legrandbakobogisdev/heyama-test` avec auto-deploy sur push vers `main`.

## Redéployer après un changement de code

Un simple push sur `main` (via le workflow GitFlow habituel : feature → develop → main) déclenche automatiquement un nouveau build sur les deux services Render. Rien à faire manuellement.

Pour forcer un redeploy sans changement de code (ex. après avoir changé une variable d'env) :
```bash
render deploys create srv-d9gas361a83c73bn7410 --confirm   # api
render deploys create srv-d9gb07u1a83c73bnes50 --confirm   # web
```

## Modifier les variables d'environnement

Via le CLI Render, en passant par l'API REST directement (le CLI n'a pas de sous-commande dédiée pour ça au moment de la rédaction) :
```bash
RENDER_API_KEY=$(grep -A1 "^api:" ~/.render/cli.yaml | grep "key:" | awk '{print $2}')
curl -X PUT "https://api.render.com/v1/services/<SERVICE_ID>/env-vars/<KEY>" \
  -H "Authorization: Bearer $RENDER_API_KEY" -H "Content-Type: application/json" \
  -d '{"value": "<VALEUR>"}'
```
Un changement de variable d'env ne redéploie pas automatiquement — il faut déclencher un `render deploys create` après coup (voir plus haut).

## Rotation des clés

- **R2** : dashboard Cloudflare → R2 → API Tokens → révoquer l'ancien, en créer un nouveau, mettre à jour `S3_ACCESS_KEY`/`S3_SECRET_KEY` sur Render.
- **MongoDB** : `atlas dbusers update heyama-api --password <nouveau> --projectId 6a60ab961ea6d2d0c75a72c2`, puis mettre à jour `MONGO_URI` sur Render.

## Limitations du plan gratuit à connaître

- **Render** : le service se met en veille après ~15 min d'inactivité ; le premier accès qui suit prend 30-60s (cold start). Pas d'IP statique sortante (c'est pourquoi Atlas autorise `0.0.0.0/0` en accès réseau).
- **MongoDB Atlas M0** : 512 Mo de stockage, largement suffisant pour ce test.
- **Cloudflare R2** : 10 Go de stockage gratuit, pas de frais de sortie (egress) — plus généreux que la plupart des alternatives S3 pour ce cas d'usage.
