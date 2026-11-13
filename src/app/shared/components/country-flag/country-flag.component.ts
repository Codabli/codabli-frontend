import { Component, computed, input } from '@angular/core';

/** Shape of the flag: classic 4:3 rectangle or square. */
export type FlagShape = '4x3' | '1x1';

/** ISO 3166-1 alpha-2 code, optionally with a subdivision (e.g. 'vn', 'gb-eng'). */
const FLAG_CODE = /^[a-z]{2}(-[a-z]{2,3})?$/;

/**
 * Country flag drawn from the `flag-icons` SVGs, served as static assets
 * (`/assets/flags/...`, see angular.json): each flag is only downloaded when shown.
 *
 * Usage: `<app-country-flag code="vn" label="Vietnam" />`.
 * Without `label`, the flag is decorative (e.g. next to the country name).
 * Size it from the parent with `--flag-width` (default: 1.5em).
 */
@Component({
  selector: 'app-country-flag',
  styleUrl: './country-flag.component.scss',
  templateUrl: './country-flag.component.html',
  host: {
    '[class.country-flag--square]': "shape() === '1x1'",
  },
})
export class CountryFlag {
  readonly code = input.required<string>();
  readonly label = input<string>();
  readonly shape = input<FlagShape>('4x3');

  readonly src = computed(() => {
    const code = this.code().trim().toLowerCase();
    return FLAG_CODE.test(code)
      ? `/assets/flags/${this.shape()}/${code}.svg`
      : null;
  });
}
