import type { AppLanguage } from '@models/types/app-language.type';

/**
 * Pays et territoires proposés dans les formulaires (annexe 16 du cahier des charges),
 * identifiés par leur code ISO 3166-1 alpha-2. Le nom affiché vient du navigateur
 * (Intl.DisplayNames) dans la langue de l'interface, sauf quand l'annexe impose un libellé.
 */
export const COUNTRY_CODES = [
  'AF', 'ZA', 'AL', 'DZ', 'DE', 'AD', 'AO', 'AG', 'SA', 'AR', 'AM', 'AU', 'AT', 'AZ',
  'BS', 'BH', 'BD', 'BB', 'BE', 'BZ', 'BJ', 'BT', 'BY', 'MM', 'BO', 'BA', 'BW', 'BR', 'BN', 'BG', 'BF', 'BI',
  'CV', 'KH', 'CM', 'CA', 'CL', 'CN', 'CY', 'CO', 'KM', 'CG', 'KP', 'KR', 'CR', 'CI', 'HR', 'CU',
  'DK', 'DJ', 'DM',
  'EG', 'AE', 'EC', 'ER', 'ES', 'EE', 'SZ', 'US', 'ET',
  'FJ', 'FI', 'FR',
  'GA', 'GM', 'GE', 'GH', 'GR', 'GD', 'GT', 'GN', 'GW', 'GQ', 'GY',
  'HT', 'HN', 'HU',
  'MH', 'SB', 'IN', 'ID', 'IQ', 'IR', 'IE', 'IS', 'IL', 'IT',
  'JM', 'JP', 'JO',
  'KZ', 'KE', 'KG', 'KI', 'KW',
  'LA', 'LS', 'LV', 'LB', 'LR', 'LY', 'LI', 'LT', 'LU',
  'MK', 'MG', 'MY', 'MW', 'MV', 'ML', 'MT', 'MA', 'MU', 'MR', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MZ',
  'NA', 'NR', 'NP', 'NI', 'NE', 'NG', 'NO', 'NZ',
  'OM', 'UG', 'UZ',
  'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'NL', 'PE', 'PH', 'PL', 'PT',
  'QA',
  'CF', 'CD', 'DO', 'RO', 'GB', 'RU', 'RW',
  'KN', 'LC', 'SM', 'VC', 'SV', 'WS', 'ST', 'SN', 'RS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SO', 'SD', 'SS', 'LK', 'SE', 'CH', 'SR', 'SY',
  'TJ', 'TW', 'TZ', 'TD', 'CZ', 'TH', 'TL', 'TG', 'TO', 'TT', 'TN', 'TM', 'TR', 'TV',
  'UA', 'UY',
  'VU', 'VA', 'VE', 'VN',
  'YE',
  'ZM', 'ZW',
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

/** Choix « Autre pays ou territoire – précisez » : le nom est alors saisi librement. */
export const OTHER_COUNTRY = 'OTHER';

/** Libellés de l'annexe qui diffèrent de ceux du navigateur, à garder tels quels. */
const COUNTRY_NAME_OVERRIDES: Record<AppLanguage, Partial<Record<CountryCode, string>>> = {
  fr: {
    MM: 'Birmanie (Myanmar)',
    CV: 'Cabo Verde (Cap-Vert)',
    CG: 'Congo (République du Congo)',
    KG: 'Kirghizistan',
    FM: 'Micronésie (États fédérés de)',
    PS: 'Palestine',
    CD: 'République démocratique du Congo',
    VC: 'Saint-Vincent-et-les-Grenadines',
    CZ: 'Tchéquie (République tchèque)',
    TL: 'Timor-Leste',
    VA: 'Vatican (Saint-Siège)',
    VN: 'Vietnam',
  },
  en: {
    CV: 'Cabo Verde (Cape Verde)',
    CG: 'Congo (Republic of the Congo)',
    FM: 'Micronesia (Federated States of)',
    PS: 'Palestine',
    CD: 'Democratic Republic of the Congo',
    VC: 'Saint Vincent and the Grenadines',
    VA: 'Vatican City (Holy See)',
  },
};

export interface CountryOption {
  code: CountryCode;
  name: string;
}

/** Pays et territoires triés par nom dans la langue demandée. */
export function countryOptions(language: AppLanguage): CountryOption[] {
  const displayNames = new Intl.DisplayNames([language], { type: 'region' });
  const overrides = COUNTRY_NAME_OVERRIDES[language];

  return COUNTRY_CODES.map((code) => ({
    code,
    name: overrides[code] ?? displayNames.of(code) ?? code,
  })).sort((a, b) => a.name.localeCompare(b.name, language));
}
