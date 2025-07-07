import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'reset-storage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reset-storage.component.html',
  styleUrls: ['./reset-storage.component.sass']
})
export class ResetStorageComponent {
  @Output() reset = new EventEmitter<void>();
  showModal = false;

  confirmReset() {
    this.showModal = false;
    this.reset.emit();
  }
}
