# Vigrab Marketplace — Development Procedures

This document captures the conventions, data model, and patterns introduced while
turning the original BidRealm starter into the **Vigrab** marketplace for timber,
wood products, and forest/wood-processing machinery.

It is meant as an onboarding guide for new contributors and as a quick reference
when adding new categories, fields, or pages.

---

## 1. Stack & repo layout

Turborepo monorepo. Only the parts we actively touched are listed here.

```
vigrab_marketplace/
├── apps/
│   ├── client/                 # Next.js 14 app router (the storefront)
│   ├── server/                 # WebSocket + bidding server
│   └── email-notification-server/
├── packages/
│   ├── db/                     # Prisma schema, generated client, seed
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/index.ts        # exports `prisma` singleton + Prisma namespace
│   ├── ui/                     # shared shadcn components
│   └── eslint-config/
├── .env                        # root .env loaded by seed script
└── DEVELOPMENT.md              # this file
```

**Key tools:** Next.js (App Router), Prisma + PostgreSQL, Lucia (auth),
TanStack Query, Tailwind + shadcn/ui, Zod, react-hook-form, lucide-react icons,
UploadThing (images).

---

## 2. Data model

### 2.1 Category (self-referencing tree)

```prisma
model Category {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  icon        String?    // logical icon key, mapped to a component on the client
  fieldSchema Json?      // dynamic per-listing fields (see §4)
  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  auctions    Auction[]
}
```

Properties to remember:

- **Arbitrary depth.** `parentId` is self-referencing, so the tree can grow as deep
  as needed. We currently use up to **4 levels** (top → sub → product type → species).
- **Slugs are globally unique** — namespace them when the same word repeats in
  different branches (e.g. `obehandlad-virke-gran` vs `timmer-gran`).
- **`icon` is a logical key**, not a path. The client maps keys → components:
  - `tree` → `TreePine`
  - `planks` → `Layers`
  - `excavator` → `Wrench`

  When you introduce a new top category with a new icon, update **two places**:
  `apps/client/components/Navbar.tsx` and `apps/client/components/CategoryMegaMenu.tsx`.

### 2.2 Auction (extended)

```prisma
model Auction {
  ...
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  extraFields Json?     // per-category attributes (Märke, Årsmodell, NTR-klass, …)
}
```

`extraFields` mirrors the keys defined in the chosen category's `fieldSchema`.
It's deliberately schemaless to keep adding new categories cheap — no migration
needed when introducing a new attribute.

When writing to it from a server action, use `Prisma.JsonNull` rather than the
JS literal `null` (Prisma's typed JSON columns reject `null`):

```ts
extraFields: data.extraFields ?? Prisma.JsonNull,
```

---

## 3. Category taxonomy (current state)

Single source of truth: `packages/db/prisma/seed.ts`. Re-running the seed
**wipes all categories** (auctions are detached, not deleted) and re-creates the
tree, so changes here are safe.

```
1. Timmer & Stockar   (icon: tree)
   └── Gran · Tall · Björk · Ek · Bok · Al · Asp · Ask · Övrig
       (fieldSchema lives on the parent: volume_m3, length_m, quality)

2. Träprodukter   (icon: planks)
   ├── Byggmaterial
   │   ├── Obehandlad virke   ← own species sub-tree (4th level)
   │   │   └── Gran · Tall · Björk · Ek · Bok · Al · Asp · Ask · Övrig
   │   ├── Impregnerad byggvirke   (NTR A / NTR AB / NTR B / NTR Gran)
   │   ├── Special bygg sortiment
   │   ├── Plywood
   │   ├── Faner
   │   ├── Limträ / KL-trä
   │   ├── OSB
   │   └── Träfiberskivor   (MDF / HDF / Hardboard)
   ├── Snickeri
   │   ├── Golv · Panel · Takskivor · Akustikpaneler
   └── Möbler   (open-ended, no fieldSchema)

3. Skogs- & Träbearbetningsmaskiner   (icon: excavator)
   ├── Skogsarbete
   │   ├── Avverkningsmaskiner   (Skördare / Skotare / Drivare / Annat)
   │   └── Handverktyg
   ├── Sågverk
   │   ├── Sågverksenheter · Transportörer · Torkar · Tillbehör
   └── Snickerimaskiner
       ├── Hyvlar · Bordssågar · Överfräsar · Slipmaskiner · Ytbehandlingslinjer
```

**All names are Swedish.** When adding sub-categories, keep them Swedish — the UI
labels are not currently i18n-wrapped.

---

## 4. Dynamic field schema (`fieldSchema`)

`fieldSchema` is JSON of shape:

```ts
{
  fields: [
    { name: 'brand',  label: 'Märke',      type: 'text',   required: true },
    { name: 'year',   label: 'Årsmodell',  type: 'number', required: true },
    { name: 'class',  label: 'NTR-klass',  type: 'select',
      options: ['NTR A', 'NTR AB', 'NTR B', 'NTR Gran'], required: true },
  ]
}
```

Supported `type`s: `text`, `number`, `select` (requires `options`).

### Where to attach the schema

`fieldSchema` may live on **any node**, not just leaves. The form picks up the
**deepest non-empty schema on the selected path**. Use this to model:

- **Common attributes that apply to many leaves** → attach at the parent.
  Example: *Timmer & Stockar* has `{volume_m3, length_m, quality}` at the top;
  species (Gran, Tall, …) are pure leaves with no schema.
- **Per-product specifics** → attach at the leaf.
  Example: *Sågverk → Torkar* has its own `{brand, capacity_m3, year}`.
- **Two-axis taxonomies** → mix both.
  Example: *Träprodukter → Byggmaterial → Obehandlad virke* has
  `{dimensions, length_m, grade}` AND a species sub-tree under it.

### Conventions for new fields

- `name` is **snake_case** and stable (it's the JSON key in `extraFields`).
- `label` is **Swedish** and displayed verbatim in the form.
- Units belong in the label, e.g. `'Volym (m³)'`, `'Effekt (kW)'`.
- Mark a field `required: true` only if the listing is genuinely incomplete
  without it. Required fields are enforced client-side in `CreateAuction.tsx`.

---

## 5. Mega menu — discovery

File: `apps/client/components/CategoryMegaMenu.tsx`.

Architecture:

1. `app/layout.tsx` calls `getCategoryTree()` server-side **once per request**
   and passes the tree to `<Navbar tree={…} />`.
2. The navbar renders the three top categories as triggers, centered between
   the logo and the auth buttons.
3. On hover, an absolutely-positioned panel opens beneath the trigger. Layout:
   - **2-level branches** (e.g. Timmer → species) → 3-column flat grid.
   - **3-level branches** (e.g. Träprodukter → Byggmaterial → leaves) → one
     column per sub-branch.
   - **4-level branches** (Obehandlad virke → species) render the deepest level
     indented with a left border under its parent.

When adding new top categories, also add their icon mapping in **both**
`CategoryMegaMenu.tsx` and `Navbar.tsx` (mobile sheet uses the same map).

A mobile fallback lives in the Navbar's `<Sheet>` — same tree, rendered as an
accordion-style list with `ChevronRight` indents.

---

## 6. Listing creation — cascading picker

File: `apps/client/components/pages/CreateAuction.tsx`.
Picker: `apps/client/components/CategoryCascadePicker.tsx`.

Flow:

1. Form fetches the tree via `useQuery(['categoryTree'], getCategoryTree)`.
2. `<CategoryCascadePicker>` renders **N dependent dropdowns** that grow as the
   user drills down. Picking a level resets every level below it.
3. Each change emits a `CascadeSelection`:
   ```ts
   {
     categoryId: string | null,     // deepest selected node
     path: CategoryNode[],          // top → … → deepest
     fieldSchema: FieldSchema | null // deepest non-empty schema on the path
   }
   ```
4. The form renders a "Produktdetaljer" block beneath the picker, populated by
   `fieldSchema.fields`. Values land in `extraValues: Record<string, string>`.
5. On submit:
   - Block if no category picked.
   - Block if the chosen node still has children (force a more specific pick).
   - Block if any `required` dynamic field is empty.
   - Send `{ ...formData, extraFields: extraValues }` to the `createAuction`
     server action.

A breadcrumb under the picker (`Träprodukter › Byggmaterial › …`) gives the
user a visual confirmation of the path.

---

## 7. Server actions

Located in `apps/client/actions/`. All are marked `'use server'` and import the
prisma singleton from `@repo/db`.

- `GetCategories.ts`
  - `getTopCategories()` — top-level categories with direct children. Used by the
    homepage cards.
  - `getCategoryBySlug(slug)` — for category landing pages.
  - `getLeafCategories()` — kept for backwards compat / sidebar filters.
  - `getCategoryTree()` — **the canonical tree fetch**. Returns up to 4 levels
    including `fieldSchema` on each node. Single query, builds the tree in JS.
- `CreateAuction.ts`
  - Persists `categoryId` and `extraFields` (JSON).
  - Uses `Prisma.JsonNull` for null JSON values.

---

## 8. Local development

### One-time setup

```bash
# Install
yarn

# Provide DATABASE_URL etc. — root .env is the one the seed uses
cp .env.example .env

# Schema + client + initial migration
yarn prisma migrate dev
yarn prisma generate
```

### Seeding the category tree

```bash
# From the repo root — dotenv inside seed.ts loads ../../../.env
npx ts-node packages/db/prisma/seed.ts
```

The seed is **idempotent on slugs**: same slugs re-`upsert`, removed slugs
disappear, attached auctions have their `categoryId` set to `null` before
re-seeding so categories can be safely deleted.

### Type-checking the client

```bash
npx tsc --noEmit -p apps/client/tsconfig.json
```

This must return **zero errors** before merging.

### Running the app

```bash
yarn run dev
# http://localhost:3000
```

---

## 9. How to add a new category

1. **Edit the seed** (`packages/db/prisma/seed.ts`).
2. Pick a unique `slug` (namespace if needed).
3. Decide *where* the `fieldSchema` belongs (see §4).
4. Re-run `npx ts-node packages/db/prisma/seed.ts`.
5. Refresh — the homepage cards, mega menu, mobile sheet, and listing form all
   read from the tree, so no other code changes are needed for a leaf or
   sub-category.
6. **Only** if you added a new top category with a new icon:
   - Add the icon mapping in `CategoryMegaMenu.tsx` and `Navbar.tsx`.

---

## 10. How to add a new dynamic field type

Currently `text | number | select`. To add e.g. `boolean` or `date`:

1. Update the `FieldSchema` type in `apps/client/types/auction.ts`.
2. Add a render branch in `CreateAuction.tsx` (the "Produktdetaljer" block).
3. Decide how the value is coerced before being written to `extraFields` —
   keep all values JSON-serialisable.

---

## 11. Conventions cheat-sheet

| Area              | Convention                                                       |
|-------------------|------------------------------------------------------------------|
| Display language  | Swedish. No i18n yet — write Swedish directly in labels.         |
| Slugs             | kebab-case, ASCII-only (`obehandlad-virke`, not `obehandlad_virke`). |
| `extraFields` keys| snake_case, stable forever once shipped.                         |
| Units             | In the label, not the key (`'Längd (m)'`, key `length_m`).        |
| Icons             | Logical key in DB → component map on the client.                 |
| Required fields   | Enforced client-side; server trusts the validated payload.       |
| JSON nulls        | `Prisma.JsonNull`, never JS `null`.                              |
| Type-checks       | `npx tsc --noEmit -p apps/client/tsconfig.json` must be clean.   |

---

## 12. Roadmap (next likely steps)

- **`/auctions` browse page** — read the `category` query param, filter by
  `categoryId IN (descendants(slug))`, render the sub-tree as a sidebar.
- **Listing card / detail enhancements** — display `extraFields` (Märke,
  Årsmodell, NTR-klass, …) so buyers see the structured attributes.
- **Multi-image upload** — replace single-image `ImageUpload` with a gallery;
  machinery especially needs several shots.
- **Saved searches / category alerts** — once browse exists, email users when a
  new listing matches a category they follow.
- **Seller onboarding** — split `/sign-up` into buyer vs seller flows; sellers
  get a profile + verification.
