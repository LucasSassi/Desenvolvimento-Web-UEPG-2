import { z } from 'zod';

export const brazilianStates = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
} as const;

export const viaCepSchema = z.object({
  cep: z.string().regex(/^\d{5}-?\d{3}$/),
  localidade: z.string().trim().min(1),
  uf: z.enum(Object.keys(brazilianStates) as [keyof typeof brazilianStates, ...(keyof typeof brazilianStates)[]]),
  bairro: z.string().nullish(),
  logradouro: z.string().nullish(),
});

export const viaCepResponseSchema = z.union([
  z.object({ erro: z.union([z.literal(true), z.literal('true')]) }),
  viaCepSchema.extend({ erro: z.union([z.literal(false), z.literal('false')]).optional() }),
]);

export const geocodingResultSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  country_code: z.string().length(2),
  admin1: z.string().optional(),
  admin2: z.string().optional(),
  feature_code: z.string().optional(),
});

export const geocodingResponseSchema = z.object({
  results: z.array(geocodingResultSchema).optional(),
  error: z.literal(false).optional(),
});

export type ViaCepLocation = z.infer<typeof viaCepSchema>;
export type GeocodingResult = z.infer<typeof geocodingResultSchema>;

export interface Location {
  cep: string;
  city: string;
  state: keyof typeof brazilianStates;
  neighborhood: string | null;
  street: string | null;
}
