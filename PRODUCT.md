# Product

## Register

product

## Users

Développeurs et recruteurs qui font tourner et évaluent un test technique en local (24h). L'interface web est un client parmi deux (avec mobile) pour un outil de gestion d'un catalogue d'"Objects" (titre, description, image). Utilisation courte, sur un seul poste, pas de contexte multi-utilisateur ni de session longue.

## Product Purpose

CRUD simple sur des Objects : lister, créer (titre + description + image), voir le détail, supprimer. Toute création se propage en temps réel (Socket.io) entre les clients connectés. Le succès = un outil qui se scanne vite visuellement (grille d'images) et dont chaque action (créer, voir, supprimer) est claire et sans friction.

## Brand Personality

Sobre, technique, fonctionnel. Un outil interne, pas un produit marketing — la confiance vient de la clarté et de la cohérence, pas de la décoration. Neutre en ton, direct dans la copie.

## Anti-references

Pas de gabarit SaaS générique (cream background, gradient text, eyebrows en majuscules au-dessus de chaque section, grilles de cards identiques avec icône+titre+texte). Pas de glassmorphism décoratif. Le produit ne doit pas ressembler à une landing page marketing générée par IA.

## Design Principles

- La grille d'images prime : l'image de l'Object est l'élément de scan principal, tout le reste est secondaire.
- Un seul accent contrôlé, pas de palette bruyante — la sobriété sert la lisibilité.
- Chaque état (vide, chargement, erreur) est explicite, jamais un écran blanc silencieux.
- Le mouvement sert le feedback (chargement, apparition realtime d'un item), jamais la décoration gratuite.
- Cohérence stricte entre les trois pages (liste, création, détail) : même densité, mêmes composants.

## Accessibility & Inclusion

Contraste WCAG AA (texte ≥4.5:1) sur fond clair et sombre. Respect de `prefers-reduced-motion` pour toute animation ajoutée. Pas de besoin d'accessibilité spécifique au-delà des standards.
