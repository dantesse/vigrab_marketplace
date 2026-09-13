import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../apps/server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Node = {
  name: string;
  slug: string;
  icon?: string;
  fieldSchema?: any;
  children?: Node[];
};

const SPECIES: Node[] = [
  { name: 'Gran', slug: 'gran' },
  { name: 'Tall', slug: 'tall' },
  { name: 'Björk', slug: 'bjork' },
  { name: 'Ek', slug: 'ek' },
  { name: 'Bok', slug: 'bok' },
  { name: 'Al', slug: 'al' },
  { name: 'Asp', slug: 'asp' },
  { name: 'Ask', slug: 'ask' },
  { name: 'Övrig', slug: 'ovrig' },
];

const TREE: Node[] = [
  {
    name: 'Timmer & Stockar',
    slug: 'timmer',
    icon: 'tree',
    fieldSchema: {
      fields: [
        { name: 'volume_m3', label: 'Volym (m³)', type: 'number', required: true },
        { name: 'length_m', label: 'Längd (m)', type: 'number', required: true },
        { name: 'quality', label: 'Kvalitet', type: 'select', options: ['A', 'B', 'C', 'D'], required: false },
      ],
    },
    children: SPECIES.map((s) => ({ ...s, slug: `timmer-${s.slug}` })),
  },
  {
    name: 'Träprodukter',
    slug: 'traprodukter',
    icon: 'planks',
    children: [
      {
        name: 'Byggmaterial',
        slug: 'byggmaterial',
        children: [
          {
            name: 'Obehandlad virke',
            slug: 'obehandlad-virke',
            fieldSchema: {
              fields: [
                { name: 'dimensions', label: 'Dimensioner (mm)', type: 'text', required: true },
                { name: 'length_m', label: 'Längd (m)', type: 'number', required: true },
                { name: 'grade', label: 'Kvalitetsklass', type: 'text', required: false },
              ],
            },
            children: SPECIES.map((s) => ({ ...s, slug: `obehandlad-virke-${s.slug}` })),
          },
          {
            name: 'Impregnerad byggvirke',
            slug: 'impregnerad-byggvirke',
            fieldSchema: {
              fields: [
                { name: 'dimensions', label: 'Dimensioner (mm)', type: 'text', required: true },
                { name: 'length_m', label: 'Längd (m)', type: 'number', required: true },
                { name: 'treatment_class', label: 'Träskyddsklass (NTR)', type: 'select', options: ['NTR A', 'NTR AB', 'NTR B', 'NTR Gran'], required: true },
              ],
            },
          },
          {
            name: 'Special bygg sortiment',
            slug: 'special-bygg-sortiment',
            fieldSchema: {
              fields: [
                { name: 'product_type', label: 'Produkttyp', type: 'text', required: true },
                { name: 'dimensions', label: 'Dimensioner', type: 'text', required: false },
              ],
            },
          },
          {
            name: 'Plywood',
            slug: 'plywood',
            fieldSchema: {
              fields: [
                { name: 'thickness_mm', label: 'Tjocklek (mm)', type: 'number', required: true },
                { name: 'sheet_size', label: 'Skivstorlek', type: 'text', required: true },
                { name: 'grade', label: 'Kvalitetsklass', type: 'text', required: false },
              ],
            },
          },
          {
            name: 'Faner',
            slug: 'faner',
            fieldSchema: {
              fields: [
                { name: 'species', label: 'Träslag', type: 'text', required: true },
                { name: 'thickness_mm', label: 'Tjocklek (mm)', type: 'number', required: true },
              ],
            },
          },
          {
            name: 'Limträ / KL-trä',
            slug: 'limtra-kl-tra',
            fieldSchema: {
              fields: [
                { name: 'dimensions', label: 'Dimensioner (mm)', type: 'text', required: true },
                { name: 'length_m', label: 'Längd (m)', type: 'number', required: true },
                { name: 'strength_class', label: 'Hållfasthetsklass', type: 'text', required: false },
              ],
            },
          },
          {
            name: 'OSB',
            slug: 'osb',
            fieldSchema: {
              fields: [
                { name: 'thickness_mm', label: 'Tjocklek (mm)', type: 'number', required: true },
                { name: 'sheet_size', label: 'Skivstorlek', type: 'text', required: true },
              ],
            },
          },
          {
            name: 'Träfiberskivor',
            slug: 'trafiberskivor',
            fieldSchema: {
              fields: [
                { name: 'thickness_mm', label: 'Tjocklek (mm)', type: 'number', required: true },
                { name: 'sheet_size', label: 'Skivstorlek', type: 'text', required: true },
                { name: 'type', label: 'Typ', type: 'select', options: ['MDF', 'HDF', 'Hardboard'], required: false },
              ],
            },
          },
        ],
      },
      {
        name: 'Snickeri',
        slug: 'snickeri',
        children: [
          {
            name: 'Golv',
            slug: 'golv',
            fieldSchema: {
              fields: [
                { name: 'species', label: 'Träslag', type: 'text', required: true },
                { name: 'thickness_mm', label: 'Tjocklek (mm)', type: 'number', required: true },
                { name: 'width_mm', label: 'Bredd (mm)', type: 'number', required: false },
                { name: 'finish', label: 'Ytbehandling', type: 'text', required: false },
              ],
            },
          },
          {
            name: 'Panel',
            slug: 'panel',
            fieldSchema: {
              fields: [
                { name: 'species', label: 'Träslag', type: 'text', required: true },
                { name: 'profile', label: 'Profil', type: 'text', required: false },
                { name: 'dimensions', label: 'Dimensioner', type: 'text', required: false },
              ],
            },
          },
          {
            name: 'Takskivor',
            slug: 'takskivor',
            fieldSchema: {
              fields: [
                { name: 'material', label: 'Material', type: 'text', required: true },
                { name: 'dimensions', label: 'Dimensioner', type: 'text', required: false },
              ],
            },
          },
          {
            name: 'Akustikpaneler',
            slug: 'akustikpaneler',
            fieldSchema: {
              fields: [
                { name: 'species', label: 'Träslag', type: 'text', required: false },
                { name: 'dimensions', label: 'Dimensioner', type: 'text', required: false },
              ],
            },
          },
        ],
      },
      {
        name: 'Möbler',
        slug: 'mobler',
      },
    ],
  },
  {
    name: 'Skogs- & Träbearbetningsmaskiner',
    slug: 'maskiner',
    icon: 'excavator',
    children: [
      {
        name: 'Skogsarbete',
        slug: 'skogsarbete',
        children: [
          {
            name: 'Avverkningsmaskiner',
            slug: 'avverkningsmaskiner',
            fieldSchema: {
              fields: [
                { name: 'brand', label: 'Märke', type: 'text', required: true },
                { name: 'model', label: 'Modell', type: 'text', required: true },
                { name: 'year', label: 'Årsmodell', type: 'number', required: true },
                { name: 'hours', label: 'Motortimmar', type: 'number', required: true },
                { name: 'machine_type', label: 'Maskintyp', type: 'select', options: ['Skördare', 'Skotare', 'Drivare', 'Annat'], required: true },
              ],
            },
          },
          {
            name: 'Handverktyg',
            slug: 'handverktyg',
            fieldSchema: {
              fields: [
                { name: 'brand', label: 'Märke', type: 'text', required: true },
                { name: 'type', label: 'Typ', type: 'text', required: true },
                { name: 'condition', label: 'Skick', type: 'select', options: ['Nytt', 'Begagnat', 'Renoverat'], required: false },
              ],
            },
          },
        ],
      },
      {
        name: 'Sågverk',
        slug: 'sagverk',
        children: [
          {
            name: 'Sågverksenheter',
            slug: 'sagverksenheter',
            fieldSchema: {
              fields: [
                { name: 'brand', label: 'Märke', type: 'text', required: true },
                { name: 'model', label: 'Modell', type: 'text', required: true },
                { name: 'year', label: 'Årsmodell', type: 'number', required: true },
                { name: 'capacity', label: 'Kapacitet (m³/h)', type: 'number', required: false },
              ],
            },
          },
          {
            name: 'Transportörer',
            slug: 'transportorer',
            fieldSchema: {
              fields: [
                { name: 'type', label: 'Typ', type: 'text', required: true },
                { name: 'length_m', label: 'Längd (m)', type: 'number', required: false },
                { name: 'capacity', label: 'Kapacitet', type: 'text', required: false },
              ],
            },
          },
          {
            name: 'Torkar',
            slug: 'torkar',
            fieldSchema: {
              fields: [
                { name: 'brand', label: 'Märke', type: 'text', required: true },
                { name: 'capacity_m3', label: 'Kapacitet (m³)', type: 'number', required: true },
                { name: 'year', label: 'Årsmodell', type: 'number', required: false },
              ],
            },
          },
          {
            name: 'Tillbehör',
            slug: 'sagverk-tillbehor',
          },
        ],
      },
      {
        name: 'Snickerimaskiner',
        slug: 'snickerimaskiner',
        children: [
          {
            name: 'Hyvlar',
            slug: 'hyvlar',
            fieldSchema: {
              fields: [
                { name: 'brand', label: 'Märke', type: 'text', required: true },
                { name: 'model', label: 'Modell', type: 'text', required: true },
                { name: 'year', label: 'Årsmodell', type: 'number', required: true },
                { name: 'width_mm', label: 'Arbetsbredd (mm)', type: 'number', required: false },
              ],
            },
          },
          {
            name: 'Bordssågar',
            slug: 'bordssagar',
            fieldSchema: {
              fields: [
                { name: 'brand', label: 'Märke', type: 'text', required: true },
                { name: 'model', label: 'Modell', type: 'text', required: true },
                { name: 'year', label: 'Årsmodell', type: 'number', required: true },
                { name: 'blade_mm', label: 'Klingdiameter (mm)', type: 'number', required: false },
              ],
            },
          },
          {
            name: 'Överfräsar',
            slug: 'overfrasar',
            fieldSchema: {
              fields: [
                { name: 'brand', label: 'Märke', type: 'text', required: true },
                { name: 'model', label: 'Modell', type: 'text', required: true },
                { name: 'year', label: 'Årsmodell', type: 'number', required: true },
                { name: 'power_kw', label: 'Effekt (kW)', type: 'number', required: false },
              ],
            },
          },
          {
            name: 'Slipmaskiner',
            slug: 'slipmaskiner',
            fieldSchema: {
              fields: [
                { name: 'brand', label: 'Märke', type: 'text', required: true },
                { name: 'model', label: 'Modell', type: 'text', required: true },
                { name: 'type', label: 'Typ', type: 'text', required: false },
              ],
            },
          },
          {
            name: 'Ytbehandlingslinjer',
            slug: 'ytbehandlingslinjer',
            fieldSchema: {
              fields: [
                { name: 'brand', label: 'Märke', type: 'text', required: true },
                { name: 'model', label: 'Modell', type: 'text', required: true },
                { name: 'year', label: 'Årsmodell', type: 'number', required: true },
                { name: 'line_length_m', label: 'Linjelängd (m)', type: 'number', required: false },
              ],
            },
          },
        ],
      },
    ],
  },
];

async function upsertNode(node: Node, parentId: string | null) {
  const created = await prisma.category.upsert({
    where: { slug: node.slug },
    create: {
      name: node.name,
      slug: node.slug,
      icon: node.icon ?? null,
      fieldSchema: node.fieldSchema ?? undefined,
      parentId,
    },
    update: {
      name: node.name,
      icon: node.icon ?? null,
      fieldSchema: node.fieldSchema ?? undefined,
      parentId,
    },
  });
  for (const child of node.children ?? []) {
    await upsertNode(child, created.id);
  }
}

async function seedCategories() {
  // Wipe old categories (cascade-safe: detach auctions first)
  await prisma.auction.updateMany({ data: { categoryId: null } });
  await prisma.category.deleteMany({});

  for (const top of TREE) {
    await upsertNode(top, null);
  }
  console.log('Categories seeded (Swedish taxonomy)');
}

async function main() {
  await seedCategories();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
