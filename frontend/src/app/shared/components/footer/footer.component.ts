import { Component } from '@angular/core';

@Component({
  selector: 'ccnta-footer',
  template: `
    <footer class="text-center text-sm text-[#8B9F82]">
      <p>All rights reserved. &copy; 2024 | Comprehensive Collaborative Note Taking App</p>
      <p>Design and Developed by Rupesh Dulal</p>
    </footer>
  `,
  styles: [`
    footer {
      font-family: 'Arial', sans-serif;
    }
  `]
})
export class FooterComponent {}
