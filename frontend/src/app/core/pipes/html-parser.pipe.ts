import { Pipe, PipeTransform } from '@angular/core';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ElementRef } from '@angular/core';

@Pipe({
  name: 'htmlParser'
})
export class HtmlParserPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, parse: boolean = false): SafeHtml | string {
    if (!value) return '';

    // Step 1: If parsing is requested, we extract and manipulate the HTML (e.g., remove <font> tags)
    if (parse) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(value, 'text/html');

      // Example: Remove <font> tags (custom transformation)
      const fontTags = doc.querySelectorAll('font');
      fontTags.forEach(tag => tag.replaceWith(tag.innerHTML)); // Replace font tags with their inner content

      // Extract text or any custom manipulations
      return doc.body.innerHTML; // Return the transformed HTML
    }

    // Step 2: Otherwise, sanitize and return the HTML safely
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

}
