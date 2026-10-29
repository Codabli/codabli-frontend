const languageNames = new Intl.DisplayNames(['fr'], {
  type: 'language',
});

export function getLanguageName(code: string): string {
  const name = languageNames.of(code) ?? code;

  return name.charAt(0).toUpperCase() + name.slice(1);
}