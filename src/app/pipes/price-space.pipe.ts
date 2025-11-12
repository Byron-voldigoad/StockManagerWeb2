import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceSpace',
  standalone: true
})
export class PriceSpacePipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    const num = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]+/g, ''));
    if (isNaN(num)) return String(value);
    // Use fr-FR to get grouped thousands with non-breaking spaces, then replace with normal space
    const formatted = new Intl.NumberFormat('fr-FR').format(num);
    return formatted.replace(/\u202F|\u00A0/g, ' ');
  }
}
