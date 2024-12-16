import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, maxLength: number): string {
    if (!value) return ''; // Return empty string if value is falsy
    return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
  }

}
