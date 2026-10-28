import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentListResponse } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  public getDocuments(): Observable<DocumentListResponse> {
    return this.http.get<DocumentListResponse>(`${this.apiUrl}/documents`);
  }

  public uploadDocument(file: File): Observable<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<{ message: string }>(`${this.apiUrl}/ingest`, formData);
  }

  public deleteDocument(filename: string): Observable<{ message: string }> {
    const params = new HttpParams().set('filename', filename);
    return this.http.delete<{ message: string }>(`${this.apiUrl}/delete-file`, { params });
  }

  public purgeMemory(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/purge`);
  }
}
