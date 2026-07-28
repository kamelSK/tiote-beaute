# Tiote Beauté — Site vitrine premium (multipage)

Site statique (HTML / CSS / JS), **6 pages**, prêt à héberger. Aucune installation requise.

## Lancer en local
```bash
python -m http.server 5566 --directory site
```
puis ouvrez http://localhost:5566
> Servez le dossier (et non `file://`) pour que la carte Google, les polices et les scripts se chargent parfaitement.

## Pages
| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : hero vidéo, histoire, prestations (teaser), pourquoi nous, avant/après, avis Google, réservation |
| `salon.html` | Le salon : histoire complète, valeurs, statistiques, équipe |
| `prestations.html` | 8 prestations détaillées, déroulé de la visite, grille de tarifs, FAQ |
| `galerie.html` | Galerie immersive (lightbox), **carrousel avant/après** (3 transformations), Instagram |
| `avis.html` | **Carrousel d'avis Google** + grille de témoignages, note 4,9/5 |
| `contact.html` | Coordonnées, carte Google, **module de réservation** (#rdv), infos pratiques |

## Arborescence
```
site/
├── *.html                     ← les 6 pages
├── css/style.css              ← identité + composants + animations
├── js/main.js                 ← expérience (voir plus bas)
└── assets/img/
    ├── salon-interieur.jpg / equipe-devanture.jpg / facade.webp  ← vos 3 vraies photos
    └── generated/*.svg        ← 33 visuels générés (art « mèches » duotone)
```

## Visuels
Les placeholders externes ont été remplacés par **33 visuels SVG générés sur mesure** (mèches soyeuses en cascade, palettes or / rosé / cuivré / prune / émeraude / anthracite). Avantages : 100 % autonomes, ultra-légers, nets sur tout écran, cohérents avec l'identité. Vous pouvez les remplacer par vos propres photos dans `assets/img/` sans rien changer d'autre.

## Expérience & animations (js/main.js)
- **Lenis** : défilement fluide inertiel
- **GSAP + ScrollTrigger** : révélation progressive des textes ligne par ligne (`data-reveal-lines`), fade-up (`data-reveal`), **zoom subtil au scroll** (`data-zoom`), **parallaxe** (`data-parallax`)
- **Fond évolutif** : la couleur d'arrière-plan glisse doucement d'une section à l'autre (`data-bg`)
- **Curseur personnalisé** discret (anneau + point, grandit sur les éléments interactifs) — désactivé sur mobile et si « animations réduites »
- **Boutons magnétiques** (`data-magnetic`) et cartes qui se soulèvent au survol
- **Carrousel avant/après** draggable (souris, tactile, clavier) avec démo animée
- **Carrousel d'avis Google** (auto-défilement + swipe)
- **Galerie lightbox** (clavier ← → Échap)
- Compteurs animés, menu mobile, **mode sombre / clair** mémorisé, bouton haut de page

Tout se désactive proprement avec `prefers-reduced-motion` et fonctionne même si un CDN est bloqué (repli sans animation).

## À personnaliser (checklist)
| Élément | Où | Action |
|---|---|---|
| **Vidéo hero** | `index.html` `<video>` | Déposez `assets/video/hero.mp4` (coiffeuse qui coupe). Poster actuel = photo réelle. |
| **Réservation** | `contact.html` #rdv (+ CTA des autres pages) | Collez le code Planity / Booksy / Calendly dans `.booking__placeholder`. |
| **Téléphone / WhatsApp** | toutes les pages | Remplacez `+33000000000` et `33000000000`. |
| **Adresse + carte** | `contact.html` | Adresse réelle + URL `google.com/maps?q=...` du salon. |
| **Ville (SEO local)** | `<title>`, meta, JSON-LD, contact | Remplacez « Votre Ville » / « 00000 » pour cibler « coiffeur + [ville] ». |
| **Avis** | `avis.html`, `index.html` | Remplacez par vos vrais avis Google + lien « Laisser un avis ». |
| **Instagram / Facebook** | galerie + footers | Vos liens et vignettes. |
| **Tarifs** | `prestations.html` | Ajustez les prix. |

## Régénérer les visuels
Le script se trouve dans le dossier temporaire de session (`gen_svg.py`). Palettes et densité y sont paramétrables si vous souhaitez d'autres teintes.
