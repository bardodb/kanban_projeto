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
    this.apollo.watchQuery<{ getBoard: Board }>({
      query: GET_BOARD,
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map(result => {
        // Criar uma cópia profunda do resultado para evitar modificar objetos somente leitura
        const board = JSON.parse(JSON.stringify(result.data.getBoard));
        return board;
      }),
      tap((board: Board) => {
        // Agora podemos ordenar com segurança as colunas e cartões
        const columnsCopy = [...board.columns];
        columnsCopy.sort((a: Column, b: Column) => a.position - b.position);
        
        columnsCopy.forEach((column: Column) => {
          if (column.cards) {
            column.cards = [...column.cards].sort((a: Card, b: Card) => a.position - b.position);
          } else {
            column.cards = [];
          }
        });
        
        this.boardSubject.next({ columns: columnsCopy });
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
    return this.apollo.mutate<any>({
      mutation: DELETE_COLUMN,
      variables: { columnId },
      fetchPolicy: 'no-cache'
    }).pipe(
      tap(() => {
        const currentBoard = this.boardSubject.value;
        const columns = currentBoard.columns.filter((col: Column) => col.id !== columnId);
        
        // Update positions after removing a column
        const updatedColumns = [...columns].map((col: Column, index: number) => ({
          ...col,
          position: index
        }));
        
        this.boardSubject.next({
          ...currentBoard,
          columns: updatedColumns
        });
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
        
        // Update the board state with the new column positions
        this.boardSubject.next({
          columns: columns
        });
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
        const currentBoard = this.boardSubject.value;
        const updatedColumns = currentBoard.columns.map((column: Column) => {
          if (column.id === columnId) {
            return {
              ...column,
              cards: [...column.cards, { ...newCard }]
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
    return this.apollo.mutate<any>({
      mutation: DELETE_CARD,
      variables: { cardId },
      fetchPolicy: 'no-cache'
    }).pipe(
      tap(() => {
        const currentBoard = this.boardSubject.value;
        const updatedColumns = currentBoard.columns.map((column: Column) => {
          if (column.id === columnId) {
            return {
              ...column,
              cards: column.cards.filter((card: Card) => card.id !== cardId)
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

    // Create a deep copy of the card to avoid mutation issues
    const cardCopy = JSON.parse(JSON.stringify(card));

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
        // Create a deep copy of the current board state
        const boardCopy = JSON.parse(JSON.stringify(currentBoard));
        
        // Remove the card from its original column
        const updatedColumns = boardCopy.columns.map((column: Column) => {
          if (column.id === fromColumn.id) {
            return {
              ...column,
              cards: column.cards.filter((c: Card) => c.id !== cardId)
            };
          }
          return column;
        });
        
        // Add the card to its new column at the specified position
        const toColumnIndex = updatedColumns.findIndex((col: Column) => col.id === toColumnId);
        if (toColumnIndex !== -1) {
          const toColumn = updatedColumns[toColumnIndex];
          
          // Create a new array of cards for the target column
          const newCards = [...toColumn.cards];
          
          // Insert the card at the specified position
          newCards.splice(position, 0, cardCopy);
          
          // Update the positions of all cards in the column
          const sortedCards = newCards.map((card: Card, index: number) => ({
            ...card,
            position: index
          }));
          
          // Update the column with the new cards array
          updatedColumns[toColumnIndex] = {
            ...toColumn,
            cards: sortedCards
          };
        }
        
        // Update the board state
        this.boardSubject.next({ columns: updatedColumns });
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
        const currentBoard = this.boardSubject.value;
        const updatedColumns = currentBoard.columns.map((column: Column) => ({
          ...column,
          cards: column.cards.map((card: Card) => 
            card.id === cardId 
              ? { ...card, ...updatedCard }
              : card
          )
        }));
        this.boardSubject.next({ ...currentBoard, columns: updatedColumns });
      }),
      catchError(this.handleError)
    );
  }
}
