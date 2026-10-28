import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ChatService } from "../../core/services/chat.service";
import { DocumentService } from "../../core/services/document.service";
import { AuthService, AuthState } from "../../core/services/auth.service";
import { Message } from "../../core/models/chat.model";

@Component({
  selector: "app-chat-window",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="flex-1 flex flex-col relative overflow-hidden h-full">
      <!-- Glow background accent -->
      <div
        class="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0"
      ></div>

      <!-- Top Header Bar -->
      <header
        class="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0B0F1A]/80 backdrop-blur-md z-20"
      >
        <div class="flex items-center gap-2">
          <span
            class="text-[10px] font-mono text-slate-400 tracking-widest uppercase truncate max-w-[250px]"
          >
            ORG_ID: {{ authState?.orgId }}
          </span>
          <span
            class="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-300 font-mono"
          >
            SECURED
          </span>
        </div>

        <!-- PDF Upload Action -->
        <button
          type="button"
          *ngIf="isAdmin"
          (click)="fileInput.click()"
          [disabled]="uploading"
          class="bg-blue-600 hover:bg-blue-500 text-white py-1.5 px-4 rounded-full text-xs font-bold cursor-pointer flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20"
        >
          <svg
            *ngIf="!uploading"
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <svg
            *ngIf="uploading"
            class="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {{ uploading ? "INDEXING PDF..." : "INDEX PDF" }}
        </button>
        <input
          #fileInput
          type="file"
          class="hidden"
          (change)="handleFileUpload($event)"
          accept=".pdf,application/pdf"
          [disabled]="uploading"
        />
        <span
          *ngIf="uploadStatus"
          class="text-[10px] text-slate-400 font-mono max-w-[260px] truncate"
        >
          {{ uploadStatus }}
        </span>
      </header>

      <!-- Message History Container -->
      <div
        #scrollContainer
        class="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 space-y-6 z-10 custom-scrollbar"
      >
        <!-- Empty State -->
        <div
          *ngIf="messages.length === 0"
          class="h-full flex flex-col items-center justify-center opacity-25 select-none"
        >
          <svg
            class="w-16 h-16 mb-3 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p class="text-xs font-mono tracking-widest uppercase text-slate-300">
            Awaiting neural input...
          </p>
        </div>

        <!-- Messages list -->
        <div
          *ngFor="let m of messages"
          class="flex"
          [ngClass]="m.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="p-4 rounded-2xl text-sm max-w-[80%] leading-relaxed shadow-lg"
            [ngClass]="{
              'bg-blue-600 text-white rounded-br-none': m.role === 'user',
              'bg-white/5 border border-white/10 text-slate-200 rounded-bl-none':
                m.role === 'assistant',
              'bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs w-full text-center':
                m.role === 'system',
            }"
          >
            {{ m.content }}
          </div>
        </div>

        <!-- Loading Indicator -->
        <div
          *ngIf="loading"
          class="text-[11px] text-blue-400 font-mono animate-pulse flex items-center gap-2"
        >
          <span class="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
          PROCESSING_QUERY...
        </div>
      </div>

      <!-- Bottom Query Input Form -->
      <form
        (ngSubmit)="onSubmit()"
        class="p-6 bg-gradient-to-t from-[#0B0F1A] to-transparent z-20"
      >
        <div
          class="max-w-4xl mx-auto flex gap-2 bg-[#161b29] border border-white/10 rounded-2xl p-2 focus-within:border-blue-500/50 transition-all"
        >
          <input
            type="text"
            [(ngModel)]="userInput"
            name="userInput"
            class="flex-1 bg-transparent p-3 outline-none text-sm text-white placeholder-slate-500 font-sans"
            [placeholder]="'Query organization knowledge base...'"
            [disabled]="loading"
          />
          <button
            type="submit"
            [disabled]="loading || !userInput.trim()"
            class="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </form>
    </main>
  `,
})
export class ChatWindowComponent implements OnInit {
  @ViewChild("scrollContainer") private scrollContainer!: ElementRef;

  messages: Message[] = [];
  loading: boolean = false;
  uploading: boolean = false;
  uploadStatus: string = "";
  userInput: string = "";
  authState: AuthState | null = null;

  constructor(
    private chatService: ChatService,
    private documentService: DocumentService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.chatService.messages$.subscribe((messages) => {
      const shouldScroll = this.isNearBottom();
      this.messages = messages;

      if (shouldScroll) {
        setTimeout(() => this.scrollToBottom());
      }
    });
    this.chatService.loading$.subscribe((l) => (this.loading = l));
    this.authService.authState$.subscribe((s) => (this.authState = s));
  }

  get isAdmin(): boolean {
    const role = (this.authState?.orgRole || "").toLowerCase();
    return role === "org:admin" || role === "admin" || role === "administrator";
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  private isNearBottom(): boolean {
    const element = this.scrollContainer?.nativeElement;
    if (!element) return true;

    return element.scrollHeight - element.scrollTop - element.clientHeight < 80;
  }

  onSubmit() {
    if (!this.userInput.trim() || this.loading) return;
    const prompt = this.userInput;
    this.userInput = "";
    this.chatService.sendMessage(prompt);
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    input.value = "";

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      this.chatService.addMessage({
        role: "system",
        content: "Upload failed: please select a PDF file.",
      });
      this.uploadStatus = "Upload failed: PDF files only.";
      return;
    }

    this.uploading = true;
    this.uploadStatus = `Uploading ${file.name}...`;
    this.chatService.addMessage({
      role: "system",
      content: `Uploading and indexing "${file.name}"...`,
    });

    this.documentService.uploadDocument(file).subscribe({
      next: (res) => {
        this.uploading = false;
        this.uploadStatus = `${file.name} indexed successfully.`;
        this.chatService.addMessage({
          role: "system",
          content: `Neural Link: "${file.name}" indexed successfully.`,
        });
      },
      error: (err) => {
        this.uploading = false;
        const detail =
          err.error?.detail ||
          err.error?.error ||
          err.message ||
          "Upload failed.";
        this.uploadStatus = `Upload failed: ${detail}`;
        this.chatService.addMessage({
          role: "system",
          content: `Error indexing "${file.name}": ${detail}`,
        });
      },
    });
  }
}
