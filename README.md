# New Museum

New Museum est une expérience de musée numérique que j’ai imaginée pour proposer une autre manière de découvrir des œuvres d’art en ligne.

L’objectif n’était pas simplement de créer une galerie classique, mais un site vivant, dans lequel la navigation, le mouvement et les transitions participent pleinement à la découverte des œuvres. L’identité visuelle repose sur une direction artistique assez minimaliste, inspirée des espaces d’exposition : de grands aplats, une typographie très présente, beaucoup d’espace et quelques touches de bleu électrique.

> Le projet est toujours en cours de création et d’amélioration. Certaines parties peuvent donc encore évoluer, aussi bien visuellement que techniquement.

## Expériences à découvrir

Pour profiter du projet comme je l’ai pensé, je conseille de tester particulièrement :

- l’introduction et l’apparition du hero sur la page d’accueil ;
- la spirale d’œuvres en Three.js, qui réagit au scroll ;
- le passage de la spirale vers la fiche d’une œuvre en cliquant sur un tableau ;
- la collection et son système de parallaxe ;
- les transitions entre la collection et une œuvre, dans les deux sens ;
- la transition entre deux œuvres depuis la section « Continuez à regarder » ;
- les différentes transitions de page et animations de titres ;
- le changement de langue entre le français et l’anglais ;
- les favoris et la billetterie lorsqu’un compte est connecté.

Il y a également une expérience spéciale appelée **Singularity**, accessible depuis la page d’accueil ou directement depuis `/fr/singularity`. Je recommande de la découvrir avec le son, sans trop chercher à savoir ce qu’il va se passer avant de la lancer.

## Animations et technologies

Le projet est développé avec **Next.js**, **React** et **Tailwind CSS**.

J’ai utilisé **GSAP** pour construire la majorité des animations : les reveals typographiques, les transitions de page, les changements d’œuvre et les différents raccords visuels entre les pages. La spirale de la page d’accueil est réalisée avec **Three.js**, tandis que **Lenis** est utilisé pour rendre le scroll plus fluide.

Le site comprend également :

- une interface disponible en français et en anglais ;
- un système d’authentification avec Better Auth ;
- une base de données PostgreSQL avec Drizzle ORM ;
- des favoris liés au compte utilisateur ;
- une billetterie avec conservation des billets dans le profil ;
- une sélection d’œuvres similaires sur chaque fiche.

## Lancer le projet

Installer les dépendances :

```bash
npm install
```

Créer un fichier `.env` ou `.env.local` avec les variables nécessaires au projet, notamment :

```bash
DATABASE_URL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Puis lancer le serveur de développement :

```bash
npm run dev
```

Le site est ensuite disponible sur [http://localhost:3000](http://localhost:3000).

## Scripts utiles

```bash
npm run dev      # lancer le projet en développement
npm run lint     # vérifier le code avec Biome
npm run build    # créer le build de production
npm run start    # lancer le build de production
```

## À propos du projet

New Museum est avant tout un terrain d’expérimentation autour du web créatif, de l’animation et de la mise en scène numérique des œuvres. Le site continue d’être amélioré : les animations, les performances, l’accessibilité et certaines fonctionnalités sont encore amenées à évoluer.
