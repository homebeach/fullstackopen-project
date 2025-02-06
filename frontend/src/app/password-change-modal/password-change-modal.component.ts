import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-change-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-change-modal.component.html',
  styleUrls: ['./password-change-modal.component.css']
})
export class PasswordChangeModalComponent {
  @Output() close = new EventEmitter<void>();  // Event to close the modal
  @Output() submit = new EventEmitter<{ newPassword: string, confirmPassword: string }>(); // Event to submit the password change

  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';

  /**
   * Close the modal.
   */
  onClose() {
    this.close.emit();
  }

  /**
   * Submit the new password if both fields match.
   */
  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      return;
    }

    this.submit.emit({ newPassword: this.newPassword, confirmPassword: this.confirmPassword });
    this.onClose();  // Close the modal after submission
  }
}
