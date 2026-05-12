import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { products } from './products.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REVIEWS_DIR = path.join(__dirname, 'src', 'content', 'reviews');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Je schrijft voor Proefkonijn.nl als Niek: 25 jaar, woont in Haarlem, koopt veel spullen en test ze eerlijk uit.

## Schrijfstijl
- Casual maar niet slordig
- Eerste persoon waar het past ("ik zou kiezen voor...", "eerlijk gezegd...")
- Korte zinnen, directe taal
- Gewoon Nederlands, geen perfect ABN
- Gebruik soms: "best wel handig", "eerlijk gezegd", "toch wel", "gewoon"
- GEEN bullshit-intro's zoals "In dit artikel gaan we kijken naar..." of "In deze review bespreken we..."
- Begin DIRECT met de kern van het verhaal, geen inleiding, geen context, gewoon beginnen
- Geen marketingtaal ("premium kwaliteit", "uitstekende prestaties")
- Sluit af met een kort eerlijk oordeel: zou jij het kopen of niet?
- Max 2000-2500 woorden per artikel
- Voeg een FAQ sectie toe aan het einde (3-5 vragen)

## ABSOLUTE VERBODEN — gebruik dit NOOIT

**Leestekens:**
- Em-dash (—): VERBODEN. Gebruik nooit een em-dash. Gebruik een komma, puntkomma, dubbele punt, of herschrijf de zin.
  FOUT: "Een goede keuze — als je budget het toelaat"
  GOED: "Een goede keuze, als je budget het toelaat"
  FOUT: "Kamado BBQ — is het de hype waard?"
  GOED: "Kamado BBQ: is het de hype waard?"

**Woorden die een Nederlander nooit typt:**
- "billig" (Duits voor goedkoop) — zeg gewoon "goedkoop"
- "verarbeiding" of "verarbeiding" (Duits: Verarbeitung) — zeg "afwerking" of "kwaliteit"
- "bijdehands" als prijscategorie — dit betekent iets anders
- "plasticiteitten" — bestaat niet
- "solid" (Engels) — zeg "stevig" of "degelijk"
- "premium" — zeg wat je bedoelt: "goed gemaakt", "stevig", "houdt jaren mee"
- "performance" — zeg "hoe goed het werkt"
- "upgrade" — zeg "verbeterd model" of "duurdere versie"

**Zinsbouw:**
- Geen titels of koppen met een em-dash er in
- Geen zinnen die beginnen met "In dit artikel..."
- Geen alinea's die beginnen met "Laten we..."
- Geen "wij van Proefkonijn" — altijd "ik"

## Structuur per artikel
1. Directe opening met een herkenbaar probleem of situatie (begin ZONDER de productnaam in de allereerste zin)
2. Korte uitleg wat je nodig hebt om te kiezen
3. Aanbeveling per budget (gebruik gewone woorden voor budgetcategorieën: "goedkoop", "middencategorie", "duurder")
4. Eerlijk eindoordeel in 2-3 zinnen
5. ## Veelgestelde vragen (3-5 vragen in FAQ-formaat: **vraag** gevolgd door antwoord)

## Affiliate links
Verwerk links NATUURLIJK in de tekst.
Formaat Bol.com: [bekijk hier op Bol.com](BOL_URL) of [te koop op Bol.com](BOL_URL)
Formaat Amazon: [bekijk op Amazon](AMAZON_URL)
Verwerk beide links op een logische plek in de tekst, niet alle twee op dezelfde plek.

## Tone of Voice
| Verboden | Gebruik in plaats daarvan |
|----------|--------------------------|
| "premium kwaliteit" | "goed gemaakt" of "stevig" |
| "uitstekende prestaties" | "doet wat het moet doen" |
| "conclusie:" | "kort gezegd:" of "eerlijk gezegd:" |
| "wij van Proefkonijn" | "ik" |
| superlatieven zonder bewijs | concrete reden geven |
| em-dash (—) | komma of dubbele punt |
| "billig" | "goedkoop" |
| "solid" | "stevig" |

## Voorbeeldstijl (zo klinkt het goed)
> "Ik had eerlijk gezegd niet verwacht dat een gasbarbecue zoveel verschil maakt, maar de Weber Spirit heeft me omgepraat. Hij wordt snel heet, is makkelijk schoon te maken, en hij staat er nog prima bij na anderhalf jaar buiten staan. Als je 400 euro wil uitgeven aan een barbecue: dit is hem gewoon."

## Outputformaat
Schrijf ALLEEN de artikel-tekst in markdown. Geen frontmatter, geen extra uitleg. Begin direct met de eerste zin van het artikel.`;

function buildBolUrl(bolQuery, partnerSiteId) {
  const q = encodeURIComponent(bolQuery);
  if (partnerSiteId) {
    return `https://partnerprogramma.bol.com/click/click?p=1&t=url&s=${partnerSiteId}&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fs%2F%3Fq%3D${q}`;
  }
  return `https://www.bol.com/nl/s/?q=${q}`;
}

function buildAmazonUrl(query) {
  const q = encodeURIComponent(query);
  return `https://www.amazon.nl/s?k=${q}&language=nl_NL`;
}

async function generateReview(product) {
  const bolUrl = buildBolUrl(product.bolQuery, process.env.BOL_PARTNER_ID);
  const amazonUrl = buildAmazonUrl(product.amazonQuery || product.bolQuery);

  const userPrompt = `Schrijf een eerlijke review artikel over: ${product.title}

Prijsrange: ${product.priceRange}
Categorie: ${product.category}
Beschrijving: ${product.description}

Context en achtergrond (gebruik dit als kennisbasis, niet letterlijk overnemen):
${product.context}

Bol.com zoeklink: ${bolUrl} — gebruik als BOL_URL in de tekst
Amazon.nl zoeklink: ${amazonUrl} — gebruik als AMAZON_URL in de tekst

Verwerk beide links op een logische plek. Niet twee links naast elkaar, maar verspreid door het artikel.

Schrijf nu het volledige artikel (1500-2500 woorden) in Niek's stem. Begin direct zonder inleiding.`;

  console.log(`  Genereer: ${product.title}...`);

  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  });

  let articleText = '';
  process.stdout.write('  ');
  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      articleText += event.delta.text;
      process.stdout.write('.');
    }
  }
  process.stdout.write('\n');

  const finalMessage = await stream.finalMessage();
  const usage = finalMessage.usage;

  return { articleText, usage, bolUrl, amazonUrl };
}

function buildMarkdownFile(product, articleText, bolUrl, amazonUrl) {
  const today = new Date().toISOString().split('T')[0];

  const frontmatter = `---
title: "${product.title}"
description: "${product.description}"
category: "${product.category}"
priceRange: "${product.priceRange}"
rating: ${product.rating}
date: "${today}"
bolUrl: "${bolUrl}"
amazonUrl: "${amazonUrl}"
image: "${product.image || ''}"
---

`;

  return frontmatter + articleText;
}

async function run() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Fout: ANTHROPIC_API_KEY niet gevonden in .env');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let toGenerate = products;

  if (args.includes('--only')) {
    const idx = args.indexOf('--only');
    const slug = args[idx + 1];
    toGenerate = products.filter(p => p.slug === slug);
    if (toGenerate.length === 0) {
      console.error(`Product met slug "${slug}" niet gevonden.`);
      console.log('Beschikbare slugs:', products.map(p => p.slug).join(', '));
      process.exit(1);
    }
  }

  if (!args.includes('--force')) {
    const existing = new Set();
    try {
      const files = await fs.readdir(REVIEWS_DIR);
      files.forEach(f => existing.add(f.replace('.md', '')));
    } catch {}

    const before = toGenerate.length;
    toGenerate = toGenerate.filter(p => !existing.has(p.slug));
    if (before !== toGenerate.length) {
      console.log(`${before - toGenerate.length} artikel(en) al aanwezig, overgeslagen.`);
      console.log('Gebruik --force om opnieuw te genereren.\n');
    }
  }

  if (toGenerate.length === 0) {
    console.log('Niets te genereren. Klaar!');
    return;
  }

  console.log(`\n🐇 Proefkonijn — content generatie`);
  console.log(`Genereer ${toGenerate.length} artikel(en) via Claude API\n`);

  let totalInput = 0;
  let totalOutput = 0;
  let totalCacheRead = 0;
  let totalCacheWrite = 0;

  for (const product of toGenerate) {
    try {
      const { articleText, usage, bolUrl, amazonUrl } = await generateReview(product);

      const markdown = buildMarkdownFile(product, articleText, bolUrl, amazonUrl);
      const filePath = path.join(REVIEWS_DIR, `${product.slug}.md`);
      await fs.writeFile(filePath, markdown, 'utf-8');

      totalInput += usage.input_tokens;
      totalOutput += usage.output_tokens;
      totalCacheRead += usage.cache_read_input_tokens ?? 0;
      totalCacheWrite += usage.cache_creation_input_tokens ?? 0;

      const cacheInfo = usage.cache_read_input_tokens
        ? ` (cache hit: ${usage.cache_read_input_tokens} tokens)`
        : '';
      console.log(`  Opgeslagen: src/content/reviews/${product.slug}.md${cacheInfo}\n`);

    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) {
        console.error(`  Rate limit, wacht 60s en probeer opnieuw...`);
        await new Promise(r => setTimeout(r, 60000));
      } else {
        console.error(`  Fout bij "${product.title}":`, err.message);
      }
    }
  }

  const inputCost = (totalInput * 0.001) / 1000;
  const outputCost = (totalOutput * 0.005) / 1000;

  console.log('─'.repeat(50));
  console.log(`Tokens gebruikt:`);
  console.log(`  Input:       ${totalInput.toLocaleString()}`);
  console.log(`  Output:      ${totalOutput.toLocaleString()}`);
  if (totalCacheRead > 0) {
    console.log(`  Cache reads: ${totalCacheRead.toLocaleString()} (bespaard!)`);
  }
  if (totalCacheWrite > 0) {
    console.log(`  Cache write: ${totalCacheWrite.toLocaleString()}`);
  }
  console.log(`Geschatte kosten: ~€${(inputCost + outputCost).toFixed(4)}`);
  console.log(`\nKlaar! Start de site met: npm run dev`);
}

run();
