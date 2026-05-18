# Eerstetest.nl — Affiliate Website

## Wat is dit project?

Geautomatiseerde Nederlandse affiliate reviewsite. Eerlijke productreviews in Niek's eigen stem, gegenereerd via Claude Haiku API. Bezoekers kopen via Bol.com (en straks Amazon.nl) affiliate links.

**Doel:** €1000/maand passief inkomen binnen 8-12 maanden.

---

## Domein & Hosting

| Item | Waarde |
|------|--------|
| Domein | eerstetest.nl (geregistreerd bij TransIP, mei 2026) |
| Hosting | Vercel (gratis, auto-deploy bij git push naar master) |
| GitHub | github.com/niekfennis-rgb/eerstetest |
| DNS A record | `@` → `216.198.79.1` |
| DNS CNAME | `www` → `8cf93201621142ce.vercel-dns-017.com` |

---

## Persona / Brand Voice

- **Naam:** Niek, 25 jaar, woont in **Haarlem** (NIET IJmuiden)
- **Rol:** Puur productreviewer — geen vermelding van werk of werkgever
- **Toon:** Casual, direct, eerste persoon, gewoon Nederlands

### Verboden taalgebruik
| Verboden | Gebruik in plaats daarvan |
|----------|--------------------------|
| Em-dash (—) | Komma of dubbele punt |
| "billig" | "goedkoop" |
| "verarbeiding" | "afwerking" |
| "bijdehands" | — (vermijden) |
| "solid" | "stevig", "solide" |
| "premium" | beschrijf concreet wat het goed maakt |

### Structuur per artikel
- Begint met een concreet probleem dat de lezer herkent
- Eindigt altijd met: "Zou ik het zelf kopen? Ja / Nee"

---

## Technische stack

| Component | Details |
|-----------|---------|
| Framework | Astro.js v4 (statisch, geen server) |
| Styling | Tailwind CSS + custom `.review-content` CSS |
| Content generatie | `generate.js` → Claude Haiku API → markdown in `src/content/reviews/` |
| AI model | `claude-haiku-4-5-20251001` |
| Sitemap | Handmatig in `public/sitemap.xml` |
| Google verificatie | Meta tag in `src/layouts/Layout.astro` |

**LET OP:** `@astrojs/sitemap` plugin NIET gebruiken — crasht met Astro v4.
**LET OP:** `@tailwindcss/typography` plugin NIET gebruiken — crasht PostCSS.

---

## npm scripts

```bash
npm run dev                                    # lokale dev server
npm run build                                  # statische build (test voor pushen)
npm run generate                               # genereer alle artikelen
npm run generate -- --only rookloze-vuurkorf   # één artikel
npm run generate -- --force                    # overschrijf bestaande artikelen
```

## Updates deployen

```powershell
cd "C:\Users\Niek\Desktop\Projecten Claude Code\Proefkonijn"
git add .
git commit -m "Omschrijving"
git push
# Vercel deployt automatisch binnen 1-2 minuten
```

**Altijd eerst lokaal builden voor pushen:**
```powershell
.\node_modules\.bin\astro.cmd build
```

---

## Affiliate accounts

| Platform | Status | ID/Code |
|----------|--------|---------|
| Bol.com | Actief | Partner ID `1519838` |
| Amazon.nl | Nog aan te melden | — |

Bol.com tracking-URL patroon:
```
https://www.bol.com/nl/nl/s/?searchtext=QUERY&utm_source=eerstetest&utm_medium=affiliate&utm_campaign=review&partner_id=1519838
```

Amazon.nl zoek-URL patroon (geen affiliate account):
```
https://www.amazon.nl/s?k=QUERY
```

---

## SEO

- **Google Search Console:** geverifieerd via meta tag in Layout.astro
- **Sitemap ingediend:** `https://www.eerstetest.nl/sitemap.xml`
- **robots.txt:** `public/robots.txt` — alles toegestaan, sitemap pointer

---

## Bestandsstructuur

```
Proefkonijn/
├── CLAUDE.md                      ← dit bestand
├── astro.config.mjs               ← Astro config (geen sitemap plugin!)
├── products.js                    ← productdefinities (slug, title, images, queries)
├── generate.js                    ← artikel generator via Claude Haiku API
├── package.json
│
├── public/
│   ├── sitemap.xml                ← handmatige sitemap (NIET via plugin)
│   └── robots.txt
│
└── src/
    ├── content/
    │   └── reviews/               ← gegenereerde markdown artikelen
    ├── layouts/
    │   └── Layout.astro           ← globale layout (wide prop, Google verificatie)
    ├── pages/
    │   ├── index.astro            ← homepage (wide, featured review, 3-koloms grid)
    │   ├── over.astro             ← Over-pagina
    │   └── reviews/
    │       └── [slug].astro       ← review detailpagina (foto, Bol + Amazon knoppen)
    ├── components/
    │   └── ProductCard.astro      ← kaart met foto, badge, rating
    └── styles/
        └── global.css             ← custom .review-content CSS
```

---

## Huidige producten (8)

| Slug | Product | Prijsrange |
|------|---------|-----------|
| rookloze-vuurkorf | Rookloze vuurkorf | €80–€350 |
| robotmaaier-kleine-tuin | Robotmaaier kleine tuin | €200–€600 |
| loungeset-buiten | Loungeset tuin | €150–€700 |
| kamado-bbq | Kamado BBQ | €250–€900 |
| zweefparasol-tuin | Zweefparasol | €60–€350 |
| solar-tuinverlichting | Solar tuinverlichting | €15–€100 |
| opblaasbare-jacuzzi | Opblaasbare jacuzzi | €200–€600 |
| accu-grasmaaier | Accu-grasmaaier | €80–€300 |

**Foto's:** picsum.photos seed-based placeholders — volgende stap is Bol.com productfoto's.

---

## Inhouds­strategie (geleerd uit YouTube videos)

**Twee soorten content:**
1. **Transactioneel** (reviews): "Beste rookloze vuurkorf 2026" → koopintentie, directe klik
2. **Informatief** (how-to): "Hoe kies je een robotmaaier?" → autoriteit opbouwen

**Volume:** 8 artikelen is te weinig. Doel: **30-50 artikelen** voor Google-autoriteit.

**Conversie:** bezoekers skimmen — doel is de bezoeker zo snel mogelijk naar Bol.com sturen.

**Tijdlijn:**
- Maanden 1-3: content bouwen, Google indexeert
- Maanden 3-6: eerste organisch traffic
- Maanden 6-12: groei en schalen naar andere niches

---

## Niches (volgorde)

1. **Tuin & Outdoor** ← actief (8 artikelen, doel: 30-50)
2. Smart Home
3. Feest & Events
4. Koffiemachines
5. Sport & Fitness

---

## Volgende stappen (prioriteit)

1. **Bol.com productfoto's** toevoegen in `products.js` (vervang picsum URLs)
2. **Eigen foto** van Niek voor de Over-pagina
3. **Uitbreiden naar 30-50 artikelen** — meer producten + informatieve artikelen
4. **Amazon.nl Partnerprogramma** aanmelden
5. **Google Search Console** monitoren na 2-4 weken
6. **Volgende niche** (Smart Home) pas als tuin/outdoor volledig uitgebouwd is

---

## Bekende bugs & oplossingen

| Probleem | Oplossing |
|----------|-----------|
| `@tailwindcss/typography` crash | Plugin verwijderd, custom CSS in global.css |
| `Astro.glob()` op lege map | `import.meta.glob(..., { eager: true })` |
| `@astrojs/sitemap` crash op Astro v4 | Handmatige `public/sitemap.xml` |
| Em-dashes in gegenereerde artikelen | Expliciet verboden in SYSTEM_PROMPT van generate.js |
| Google HTML verificatiebestand → 404 | Gebruik meta tag verificatie in Layout.astro |
| Site deployt niet na push | Controleer Vercel build log; test eerst lokaal met `astro.cmd build` |
