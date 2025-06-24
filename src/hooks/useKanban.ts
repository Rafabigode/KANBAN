
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Board, Column, Card, KanbanStore } from '@/types/kanban';

const STORAGE_KEY = 'kanban-data';

export const useKanban = () => {
  const [store, setStore] = useState<KanbanStore>({
    boards: [],
    activeBoard: null
  });

  // Carregar dados do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStore(parsed);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        initializeDefaultBoard();
      }
    } else {
      initializeDefaultBoard();
    }
  }, []);

  // Salvar no localStorage sempre que o store mudar
  useEffect(() => {
    if (store.boards.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  }, [store]);

  const initializeDefaultBoard = () => {
    const defaultBoard: Board = {
      id: uuidv4(),
      title: 'Quadro Principal',
      description: 'Quadro padrão do sistema',
      columns: [
        {
          id: uuidv4(),
          title: 'A Fazer',
          cards: [],
          color: '#ef4444',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          title: 'Em Progresso',
          cards: [],
          color: '#f59e0b',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: uuidv4(),
          title: 'Concluído',
          cards: [],
          color: '#10b981',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setStore({
      boards: [defaultBoard],
      activeBoard: defaultBoard.id
    });
  };

  const createBoard = (title: string, description: string = '') => {
    const newBoard: Board = {
      id: uuidv4(),
      title,
      description,
      columns: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setStore(prev => ({
      ...prev,
      boards: [...prev.boards, newBoard],
      activeBoard: newBoard.id
    }));

    return newBoard.id;
  };

  const updateBoard = (boardId: string, updates: Partial<Board>) => {
    setStore(prev => ({
      ...prev,
      boards: prev.boards.map(board =>
        board.id === boardId
          ? { ...board, ...updates, updatedAt: new Date() }
          : board
      )
    }));
  };

  const deleteBoard = (boardId: string) => {
    setStore(prev => {
      const newBoards = prev.boards.filter(board => board.id !== boardId);
      const newActiveBoard = prev.activeBoard === boardId 
        ? (newBoards.length > 0 ? newBoards[0].id : null)
        : prev.activeBoard;

      return {
        boards: newBoards,
        activeBoard: newActiveBoard
      };
    });
  };

  const setActiveBoard = (boardId: string) => {
    setStore(prev => ({ ...prev, activeBoard: boardId }));
  };

  const createColumn = (boardId: string, title: string, color: string = '#6366f1') => {
    const newColumn: Column = {
      id: uuidv4(),
      title,
      cards: [],
      color,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setStore(prev => ({
      ...prev,
      boards: prev.boards.map(board =>
        board.id === boardId
          ? { 
              ...board, 
              columns: [...board.columns, newColumn],
              updatedAt: new Date()
            }
          : board
      )
    }));
  };

  const updateColumn = (boardId: string, columnId: string, updates: Partial<Column>) => {
    setStore(prev => ({
      ...prev,
      boards: prev.boards.map(board =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.map(column =>
                column.id === columnId
                  ? { ...column, ...updates, updatedAt: new Date() }
                  : column
              ),
              updatedAt: new Date()
            }
          : board
      )
    }));
  };

  const deleteColumn = (boardId: string, columnId: string) => {
    setStore(prev => ({
      ...prev,
      boards: prev.boards.map(board =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.filter(column => column.id !== columnId),
              updatedAt: new Date()
            }
          : board
      )
    }));
  };

  const createCard = (boardId: string, columnId: string, cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCard: Card = {
      ...cardData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setStore(prev => ({
      ...prev,
      boards: prev.boards.map(board =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.map(column =>
                column.id === columnId
                  ? { 
                      ...column, 
                      cards: [...column.cards, newCard],
                      updatedAt: new Date()
                    }
                  : column
              ),
              updatedAt: new Date()
            }
          : board
      )
    }));
  };

  const updateCard = (boardId: string, columnId: string, cardId: string, updates: Partial<Card>) => {
    setStore(prev => ({
      ...prev,
      boards: prev.boards.map(board =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.map(column =>
                column.id === columnId
                  ? {
                      ...column,
                      cards: column.cards.map(card =>
                        card.id === cardId
                          ? { ...card, ...updates, updatedAt: new Date() }
                          : card
                      ),
                      updatedAt: new Date()
                    }
                  : column
              ),
              updatedAt: new Date()
            }
          : board
      )
    }));
  };

  const deleteCard = (boardId: string, columnId: string, cardId: string) => {
    setStore(prev => ({
      ...prev,
      boards: prev.boards.map(board =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.map(column =>
                column.id === columnId
                  ? {
                      ...column,
                      cards: column.cards.filter(card => card.id !== cardId),
                      updatedAt: new Date()
                    }
                  : column
              ),
              updatedAt: new Date()
            }
          : board
      )
    }));
  };

  const moveCard = (boardId: string, sourceColumnId: string, destinationColumnId: string, sourceIndex: number, destinationIndex: number) => {
    setStore(prev => ({
      ...prev,
      boards: prev.boards.map(board => {
        if (board.id !== boardId) return board;

        const newColumns = [...board.columns];
        const sourceColumn = newColumns.find(col => col.id === sourceColumnId);
        const destColumn = newColumns.find(col => col.id === destinationColumnId);

        if (!sourceColumn || !destColumn) return board;

        const [movedCard] = sourceColumn.cards.splice(sourceIndex, 1);
        destColumn.cards.splice(destinationIndex, 0, movedCard);

        sourceColumn.updatedAt = new Date();
        destColumn.updatedAt = new Date();

        return {
          ...board,
          columns: newColumns,
          updatedAt: new Date()
        };
      })
    }));
  };

  const getCurrentBoard = () => {
    return store.boards.find(board => board.id === store.activeBoard) || null;
  };

  return {
    store,
    getCurrentBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    setActiveBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    createCard,
    updateCard,
    deleteCard,
    moveCard
  };
};
