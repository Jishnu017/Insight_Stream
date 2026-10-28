import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div 
        class="bg-[#121624] border max-w-md w-full rounded-2xl p-6 text-center space-y-4 shadow-2xl"
        [ngClass]="type === 'purge' ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 'border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)]'"
      >
        <!-- Icon -->
        <div 
          class="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
          [ngClass]="type === 'purge' ? 'bg-red-500/20 border-2 border-red-500 text-red-500 animate-pulse' : 'bg-red-500/10 border border-red-500/30 text-red-500'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <!-- Title -->
        <h3 class="text-lg font-bold text-white uppercase tracking-wider">
          {{ type === 'purge' ? 'CRITICAL WARNING: TOTAL PURGE' : 'Decommission Memory?' }}
        </h3>

        <!-- Description -->
        <p class="text-slate-400 text-xs leading-relaxed" *ngIf="type === 'delete'">
          Are you sure you want to permanently delete <span class="text-red-400 font-mono font-bold">"{{ targetName }}"</span> from organizational memory?
        </p>

        <p class="text-slate-400 text-xs leading-relaxed" *ngIf="type === 'purge'">
          You are about to execute a <span class="text-red-500 font-bold">TOTAL MEMORY WIPE</span> for <span class="text-white font-mono font-bold">"{{ targetName }}"</span>. All indexed document vectors will be permanently purged.
        </p>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button 
            (click)="onCancel.emit()"
            class="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-all cursor-pointer"
          >
            Abort
          </button>

          <button 
            (click)="onConfirm.emit()"
            class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] cursor-pointer"
          >
            {{ type === 'purge' ? 'Execute Purge' : 'Confirm Delete' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() type: 'delete' | 'purge' = 'delete';
  @Input() targetName: string = '';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
}
