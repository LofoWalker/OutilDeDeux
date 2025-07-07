import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFileArrowDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.sass'
})
export class HeaderComponent {
  @Input() categories: string[] = [];
  @Input() activeCategory: string = '';
  @Output() categoryChange = new EventEmitter<string>();
  @Output() exportSummaryClicked = new EventEmitter<void>();

  faFileArrowDown = faFileArrowDown;

  selectCategory(cat: string) {
    this.categoryChange.emit(cat);
  }

  onExportSummaryClick() {
    this.exportSummaryClicked.emit();
  }
}
