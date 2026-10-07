export const AGE_RANGES = ['3-5', '6-8', '9-11', '12-14', '15-18'] as const;

export type AgeRange = (typeof AGE_RANGES)[number];
