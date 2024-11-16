import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, maxLength: number = 30): string {
    if (value && value.length > maxLength) {
      return value.substring(0, maxLength) + '...';  // truncate and append ellipsis
    }
    return value;
  }
}
