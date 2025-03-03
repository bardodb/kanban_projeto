import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Board, Column, Card } from '../models/kanban.model';
import { Apollo, gql } from 'apollo-angular';

// GraphQL Queries
const GET_BOARD = gql`
  query GetBoard {
    getBoard {
      columns {
        id
        title
        position
        cards {
          id
          title
          description
          position
          columnId
          createdAt
          color
        }
      }
    }
  }
`;

// GraphQL Mutations
const CREATE_COLUMN = gql`
  mutation CreateColumn($input: CreateColumnInput!) {
    createColumn(input: $input) {
      id
      title
      position
      cards {
        id
        title
        description
        position
        columnId
      }
    }
  }
`;

const DELETE_COLUMN = gql`
  mutation DeleteColumn($columnId: String!) {
    deleteColumn(columnId: $columnId)
  }
`;

const UPDATE_COLUMN_POSITIONS = gql`
  mutation UpdateColumnPositions($input: UpdateColumnPositionsInput!) {
    updateColumnPositions(input: $input)
  }
`;

const CREATE_CARD = gql`
  mutation CreateCard($input: CreateCardInput!) {
    createCard(input: $input) {
      id
      title
      description
      position
      columnId
      createdAt
      color
    }
  }
`;

const DELETE_CARD = gql`
  mutation DeleteCard($cardId: String!) {
    deleteCard(cardId: $cardId)
  }
`;

const MOVE_CARD = gql`
  mutation MoveCard($input: MoveCardInput!) {
    moveCard(input: $input)
  }
`;

const UPDATE_CARD = gql`
  mutation UpdateCard($input: UpdateCardInput!) {
    updateCard(input: $input) {
      id
      title
      description
      position
      columnId
      color
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private boardSubject = new BehaviorSubject<Board>({ columns: [] });
  board$ = this.boardSubject.asObservable();

  constructor(private apollo: Apollo) {
    this.loadInitialData();
  }

  private handleError(error: Error): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.message) {
      errorMessage = error.message;
    }
    console.error('GraphQL Error:', errorMessage);
    return throwError(() => errorMessage);
  }

  private loadInitialData() {
    console.log('Loading initial board data...');
    this.apollo.watchQuery<{ getBoard: Board }>({
      query: GET_BOARD,
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => {
        // Create a deep copy of the result to avoid modifying read-only objects
        const board = JSON.parse(JSON.stringify(result.data.getBoard));
        return board;
      }),
      tap((board: Board) => {
        console.log('Board data received:', JSON.stringify(board));
        
        // Ensure board has columns
        if (!board.columns) {
          board.columns = [];
        }
        
        // Sort columns by position
        const columnsCopy = [...board.columns];
        columnsCopy.sort((a: Column, b: Column) => a.position - b.position);
        
        // Ensure each column has cards and sort them
        columnsCopy.forEach((column: Column) => {
          if (!column.cards) {
            column.cards = [];
          } else {
            column.cards = [...column.cards].sort((a: Card, b: Card) => a.position - b.position);
          }
        });
        
        // Update the board subject with the sorted data
        this.boardSubject.next({ columns: columnsCopy });
        console.log('Board state updated with sorted data');
      }),
      catchError(error => {
        console.error('Failed to load board data:', error);
        return throwError(() => error);
      })
    ).subscribe({
      error: (error: any) => console.error('Failed to load board data:', error)
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

  createColumn(title: string): Observable<Column> {
    return this.apollo.mutate<any>({
      mutation: CREATE_COLUMN,
      variables: {
        input: { title }
      },
      fetchPolicy: 'no-cache'
    }).pipe(
      map(result => result.data.createColumn),
      tap((newColumn: Column) => {
        // Refresh the board data from the server instead of manually updating
        this.loadInitialData();
      }),
      catchError(this.handleError)
    );
  }

  deleteColumn(columnId: string): Observable<any> {
    return this.apollo.mutate<any>({
      mutation: DELETE_COLUMN,
      variables: { columnId },
      fetchPolicy: 'no-cache'
    }).pipe(
      tap(() => {
        // Refresh the board data from the server instead of manually updating
        this.loadInitialData();
      }),
      catchError(this.handleError)
    );
  }

  updateColumnPositions(columns: Column[]): Observable<any> {
    if (!columns || !Array.isArray(columns)) {
      console.error('Invalid columns data:', columns);
      return throwError(() => new Error('Invalid columns data: columns must be an array'));
    }

    // Map columns to only include id and position
    const columnPositions = columns.map(col => {
      if (!col || typeof col !== 'object' || !col.id) {
        console.error('Invalid column data:', col);
        throw new Error(`Invalid column data: ${JSON.stringify(col)}`);
      }
      return { 
        id: col.id, 
        position: typeof col.position === 'number' ? col.position : 0 
      };
    });
    
    console.log('Sending column positions to backend:', JSON.stringify(columnPositions));
    
    // Create the input object exactly matching the GraphQL input type
    const input = {
      columns: columnPositions
    };
    
    console.log('GraphQL mutation variables:', JSON.stringify({ input }, null, 2));
    console.log('Input type:', typeof input);
    console.log('Input columns type:', Array.isArray(input.columns) ? 'array' : typeof input.columns);
    console.log('Input columns length:', input.columns.length);
    
    // Try a direct mutation approach
    const mutation = UPDATE_COLUMN_POSITIONS;
    console.log('Mutation:', mutation.loc?.source?.body);
    
    return this.apollo.mutate<any>({
      mutation,
      variables: { input },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    }).pipe(
      tap(result => {
        console.log('Update column positions result:', result);
        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          throw new Error(result.errors[0].message);
        }
        
        // Refresh the board data from the server instead of manually updating
        this.loadInitialData();
      }),
      catchError(error => {
        console.error('Error updating column positions:', error);
        return throwError(() => error);
      })
    );
  }

  createCard(columnId: string, data: { title: string; description: string }): Observable<Card> {
    return this.apollo.mutate<any>({
      mutation: CREATE_CARD,
      variables: {
        input: { 
          columnId,
          title: data.title,
          description: data.description
        }
      },
      fetchPolicy: 'no-cache'
    }).pipe(
      map(result => result.data.createCard),
      tap((newCard: Card) => {
        // Refresh the board data from the server instead of manually updating
        this.loadInitialData();
      }),
      catchError(this.handleError)
    );
  }

  deleteCard(cardId: string, columnId: string): Observable<any> {
    return this.apollo.mutate<any>({
      mutation: DELETE_CARD,
      variables: { cardId },
      fetchPolicy: 'no-cache'
    }).pipe(
      tap(() => {
        // Refresh the board data from the server instead of manually updating
        this.loadInitialData();
      }),
      catchError(this.handleError)
    );
  }

  moveCard(cardId: string, toColumnId: string, position: number): Observable<any> {
    const currentBoard = this.boardSubject.value;
    const fromColumn = currentBoard.columns.find((col: Column) => 
      col.cards.some((card: Card) => card.id === cardId)
    );
    
    if (!fromColumn) {
      return throwError(() => new Error('Card not found'));
    }

    const card = fromColumn.cards.find((c: Card) => c.id === cardId);
    if (!card) {
      return throwError(() => new Error('Card not found'));
    }

    return this.apollo.mutate<any>({
      mutation: MOVE_CARD,
      variables: {
        input: {
          cardId,
          fromColumnId: fromColumn.id,
          toColumnId,
          position
        }
      },
      fetchPolicy: 'no-cache'
    }).pipe(
      tap(() => {
        // Refresh the board data from the server instead of manually updating
        this.loadInitialData();
      }),
      catchError(error => {
        console.error('Error moving card:', error);
        // In case of error, refresh the board to ensure consistent state
        this.refreshBoard().subscribe();
        return throwError(() => error);
      })
    );
  }

  updateCard(cardId: string, data: { title: string; description: string; color?: string }): Observable<Card> {
    return this.apollo.mutate<any>({
      mutation: UPDATE_CARD,
      variables: {
        input: {
          id: cardId,
          title: data.title,
          description: data.description,
          color: data.color
        }
      },
      fetchPolicy: 'no-cache'
    }).pipe(
      map(result => result.data.updateCard),
      tap((updatedCard: Card) => {
        // Refresh the board data from the server instead of manually updating
        this.loadInitialData();
      }),
      catchError(this.handleError)
    );
  }

  updateColumn(columnId: string, data: { title: string }): Observable<Column> {
    const UPDATE_COLUMN = gql`
      mutation UpdateColumn($id: String!, $title: String!) {
        updateColumn(id: $id, title: $title) {
          id
          title
          position
        }
      }
    `;

    return this.apollo.mutate<{ updateColumn: Column }>({
      mutation: UPDATE_COLUMN,
      variables: {
        id: columnId,
        title: data.title
      },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => {
        if (result.data?.updateColumn) {
          // Refresh the board data from the server instead of manually updating
          this.loadInitialData();
          return result.data.updateColumn;
        }
        throw new Error('Failed to update column');
      }),
      catchError(error => {
        console.error('Error updating column:', error);
        return throwError(() => error);
      })
    );
  }
}
