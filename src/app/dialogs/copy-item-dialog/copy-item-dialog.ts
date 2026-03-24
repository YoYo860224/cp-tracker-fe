import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export type CopyItemDialogResult = 'clean' | 'with-records' | null;

@Component({
  selector: 'app-copy-item-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './copy-item-dialog.html',
})
export class CopyItemDialog {
  constructor(public dialogRef: MatDialogRef<CopyItemDialog>) {}

  copyClean(): void {
    this.dialogRef.close('clean' as CopyItemDialogResult);
  }

  copyWithRecords(): void {
    this.dialogRef.close('with-records' as CopyItemDialogResult);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
