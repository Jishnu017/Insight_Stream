import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, catchError, of, tap } from "rxjs";
import { Message, ChatResponse } from "../models/chat.model";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private apiUrl = "http://localhost:8000/api";
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$: Observable<Message[]> = this.messagesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();
  private sessionKey: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    // Clear history only when the authenticated user or organization changes.
    this.authService.authState$.subscribe((state) => {
      const nextSessionKey =
        state.isSignedIn && state.userId && state.orgId
          ? `${state.userId}:${state.orgId}`
          : null;

      if (this.sessionKey !== null && this.sessionKey !== nextSessionKey) {
        this.clearMessages();
      }

      this.sessionKey = nextSessionKey;
    });
  }

  public get currentMessages(): Message[] {
    return this.messagesSubject.value;
  }

  public addMessage(msg: Message) {
    this.messagesSubject.next([...this.messagesSubject.value, msg]);
  }

  public clearMessages() {
    this.messagesSubject.next([]);
  }

  public sendMessage(userPrompt: string) {
    if (!userPrompt.trim()) return;

    const userMessage: Message = { role: "user", content: userPrompt };
    const currentList = [...this.messagesSubject.value, userMessage];
    this.messagesSubject.next(currentList);
    this.loadingSubject.next(true);

    this.http
      .post<ChatResponse>(`${this.apiUrl}/chat`, { messages: currentList })
      .pipe(
        tap((res) => {
          this.addMessage({ role: "assistant", content: res.text });
          this.loadingSubject.next(false);
        }),
        catchError((err) => {
          const errorMsg =
            err.error?.detail || err.message || "Neural Link Offline.";
          this.addMessage({ role: "assistant", content: `Error: ${errorMsg}` });
          this.loadingSubject.next(false);
          return of(null);
        }),
      )
      .subscribe();
  }
}
