import { Component, Input } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'nta-html-viewer',
  standalone: true,
  imports: [],
  template: `
   <div [innerHTML]="formattedContent"></div>
  `,
  styles: ``
})
export class HtmlViewerComponent {

  @Input() rawContent: string = '';
  formattedContent: SafeHtml;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    this.formattedContent = this.sanitizer.bypassSecurityTrustHtml(this.rawContent);
  }

}
