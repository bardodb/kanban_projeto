import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Board, Column, Card } from '../models/kanban.model';

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private apiUrl = 'http://localhost:3000/kanban';
  private boardSubject = new BehaviorSubject<Board>({ columns: [] });
  board$ = this.boardSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error.message || error.message;
    }
    console.error('API Error:', errorMessage);
    return throwError(() => errorMessage);
  }

  private loadInitialData() {
    this.http.get<Board>(`${this.apiUrl}/board`)
      .pipe(
        tap(board => {
          board.columns.sort((a, b) => a.position - b.position);
          board.columns.forEach(column => {
            if (column.cards) {
              column.cards.sort((a, b) => a.position - b.position);
            }
          });
          this.boardSubject.next(board);
        }),
        catchError(this.handleError)
      )
      .subscribe({
        error: (error) => console.error('Failed to load board data:', error)
      });
  }

  getBoard(): Observable<Board> {
    return this.board$;
  }

  refreshBoard(): Observable<any> {
    return new Observable(observer => {
      this.loadInitialData();
      observer.next();
      observer.complete();
    });
  }

  addColumn(title: string): Observable<Column> {
    return this.http.post<Column>(`${this.apiUrl}/columns`, { title })
      .pipe(
        tap(newColumn => {
          const currentBoard = this.boardSubject.value;
          this.boardSubject.next({
            ...currentBoard,
            columns: [...currentBoard.columns, { ...newColumn, cards: [] }]
          });
        }),
        catchError(this.handleError)
      );
  }

  deleteColumn(columnId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/columns/${columnId}`)
      .pipe(
        tap(() => {
          const currentBoard = this.boardSubject.value;
          const columns = currentBoard.columns.filter(col => col.id !== columnId);
          columns.forEach((col, index) => {
            col.position = index;
          });
          this.boardSubject.next({
            ...currentBoard,
            columns
          });
        }),
        catchError(this.handleError)
      );
  }

  updateColumnPositions(columns: Column[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/columns/positions`, { columns })
      .pipe(
        tap(() => {
          const currentBoard = this.boardSubject.value;
          this.boardSubject.next({
            ...currentBoard,
            columns: [...columns]
          });
        }),
        catchError(this.handleError)
      );
  }

  addCard(columnId: string, title: string, description: string): Observable<Card> {
    const cardData = { title, description };
    return this.http.post<Card>(`${this.apiUrl}/columns/${columnId}/cards`, cardData)
      .pipe(
        tap(newCard => {
          const currentBoard = this.boardSubject.value;
          const updatedColumns = currentBoard.columns.map(column => {
            if (column.id === columnId) {
              return {
                ...column,
                cards: [...column.cards, newCard]
              };
            }
            return column;
          });
          this.boardSubject.next({ ...currentBoard, columns: updatedColumns });
        }),
        catchError(this.handleError)
      );
  }

  deleteCard(cardId: string, columnId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cards/${cardId}`)
      .pipe(
        tap(() => {
          const currentBoard = this.boardSubject.value;
          const updatedColumns = currentBoard.columns.map(column => {
            if (column.id === columnId) {
              return {
                ...column,
                cards: column.cards.filter(card => card.id !== cardId)
              };
            }
            return column;
          });
          this.boardSubject.next({ ...currentBoard, columns: updatedColumns });
        }),
        catchError(this.handleError)
      );
  }

  moveCard(cardId: string, toColumnId: string, position: number): Observable<any> {
    const currentBoard = this.boardSubject.value;
    const fromColumn = currentBoard.columns.find(col => 
      col.cards.some(card => card.id === cardId)
    );
    
    if (!fromColumn) {
      return throwError(() => new Error('Card not found'));
    }

    return this.http.put(`${this.apiUrl}/cards/${cardId}/move`, { 
      fromColumnId: fromColumn.id, 
      toColumnId,
      position
    }).pipe(
      tap(() => {
        const movedCard = fromColumn.cards.find(card => card.id === cardId);
        if (movedCard) {
          const updatedColumns = currentBoard.columns.map(column => {
            if (column.id === fromColumn.id) {
              return {
                ...column,
                cards: column.cards.filter(card => card.id !== cardId)
              };
            }
            if (column.id === toColumnId) {
              const updatedCards = [...column.cards];
              updatedCards.splice(position, 0, { ...movedCard, columnId: toColumnId, position });
              // Update positions of all cards after the insertion point
              for (let i = position + 1; i < updatedCards.length; i++) {
                updatedCards[i].position = i;
              }
              return {
                ...column,
                cards: updatedCards
              };
            }
            return column;
          });
          this.boardSubject.next({ ...currentBoard, columns: updatedColumns });
        }
      }),
      catchError(this.handleError)
    );
  }

  createColumn(title: string): Observable<Column> {
    return this.http.post<Column>(`${this.apiUrl}/columns`, { title })
      .pipe(catchError(this.handleError));
  }

  createCard(columnId: string, data: { title: string; description: string }): Observable<Card> {
    return this.http.post<Card>(`${this.apiUrl}/columns/${columnId}/cards`, data)
      .pipe(catchError(this.handleError));
  }
}
