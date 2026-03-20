import * as z from 'zod';

export const StatusEnum = z.enum([
  'initieel',
  'in_aanvraag',
  'gereed',
  'actief',
  'ingetrokken',
  'geweigerd',
  'verlopen',
]);

export const FrequentieEnum = z.enum([
  'eenmalig',
  'maandelijks',
  'jaarlijks',
]);

export const ToegestaneStatussenEnum = z.enum([
  'initieel',
  'in_aanvraag',
  'gereed',
  'actief',
  'ingetrokken',
  'geweigerd',
  'verlopen',
]);

export const EigenaarSchema = z.object({ // Very ugly but the API returns empty strings instead of not returning some fields...
  uuid: z.uuid(),
  bsn: z.preprocess(val => val === '' ? undefined : val, z.string().optional()),
  kvk_nummer: z.preprocess(val => val === '' ? undefined : val, z.string().optional()),
  vestigingsnummer: z.preprocess(val => val === '' ? undefined : val, z.string().max(24).optional()),
  klantnummer: z.preprocess(val => val === '' ? undefined : val, z.string().max(50).optional()),
});

export const NestedDocumentSchema = z.object({
  uuid: z.uuid(),
  url: z.url().nullable().optional(),
  urn: z.string().nullable().optional(),
});

export const NestedZaakSchema = z.object({
  uuid: z.uuid(),
  url: z.url().nullable().optional(),
  urn: z.string().nullable().optional(),
});

export const NestedTaakSchema = z.object({
  uuid: z.uuid(),
  url: z.url().nullable().optional(),
  urn: z.string().nullable().optional(),
});

export const NestedProductTypeSchema = z.object({
  uuid: z.uuid(),
  code: z.string().max(255),
  keywords: z.array(z.string().max(100)).optional(),
  uniforme_product_naam: z.string(),
  toegestane_statussen: z.array(ToegestaneStatussenEnum).optional(),
  gepubliceerd: z.boolean().optional(),
  publicatie_start_datum: z.string().nullable().optional(),
  publicatie_eind_datum: z.string().nullable().optional(),
  aanmaak_datum: z.iso.datetime({ offset: true }).optional(),
  update_datum: z.iso.datetime({ offset: true }).optional(),
});

export const ProductSchema = z.object({
  uuid: z.uuid(),
  url: z.url(),
  naam: z.string().max(255),
  start_datum: z.string().nullable().optional(),
  eind_datum: z.string().nullable().optional(),
  aanmaak_datum: z.iso.datetime({ offset: true }),
  update_datum: z.iso.datetime({ offset: true }),
  producttype: NestedProductTypeSchema,
  gepubliceerd: z.boolean().optional(),
  eigenaren: z.array(EigenaarSchema),
  documenten: z.array(NestedDocumentSchema).optional(),
  zaken: z.array(NestedZaakSchema).optional(),
  taken: z.array(NestedTaakSchema).optional(),
  status: StatusEnum.optional(),
  prijs: z.string().nullable().optional(),
  frequentie: FrequentieEnum.nullable().optional(),
  verbruiksobject: z.record(z.string(), z.unknown()).nullable().optional(),
  dataobject: z.record(z.string(), z.unknown()).nullable().optional(),
  aanvraag_zaak_urn: z.string().nullable().optional(),
  aanvraag_zaak_url: z.url().nullable().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type Eigenaar = z.infer<typeof EigenaarSchema>;
export type NestedProductType = z.infer<typeof NestedProductTypeSchema>;
