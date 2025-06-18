
import { useState, useEffect } from 'react';
import { Board } from '../components/kanban/Board';
import { Header } from '../components/kanban/Header';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface Card {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  completedAt?: Date;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
  color: string;
}

export interface KanbanBoard {
  id: string;
  title: string;
  columns: Column[];
  createdAt: Date;
}

const Index = () => {
  const [boards, setBoards] = useLocalStorage<KanbanBoard[]>('kanban-boards', []);
  const [currentBoardId, setCurrentBoardId] = useLocalStorage<string>('current-board', '');
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('dark-mode', false);

  const currentBoard = boards.find(board => board.id === currentBoardId);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Create default board if none exists
    if (boards.length === 0) {
      const defaultBoard: KanbanBoard = {
        id: '1',
        title: 'Quadro Principal',
        createdAt: new Date(),
        columns: [
          {
            id: '1',
            title: 'A Fazer',
            cards: [],
            color: '#ef4444'
          },
          {
            id: '2', 
            title: 'Em Progresso',
            cards: [],
            color: '#f59e0b'
          },
          {
            id: '3',
            title: 'Concluído',
            cards: [],
            color: '#10b981'
          }
        ]
      };
      setBoards([defaultBoard]);
      setCurrentBoardId('1');
    }
  }, [boards.length, setBoards, setCurrentBoardId]);

  const updateBoard = (updatedBoard: KanbanBoard) => {
    setBoards(prev => prev.map(board => 
      board.id === updatedBoard.id ? updatedBoard : board
    ));
  };

  const createNewBoard = (title: string) => {
    const newBoard: KanbanBoard = {
      id: Date.now().toString(),
      title,
      createdAt: new Date(),
      columns: [
        {
          id: '1',
          title: 'A Fazer',
          cards: [],
          color: '#ef4444'
        }
      ]
    };
    setBoards(prev => [...prev, newBoard]);
    setCurrentBoardId(newBoard.id);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <Header 
        boards={boards}
        currentBoard={currentBoard}
        onBoardChange={setCurrentBoardId}
        onCreateBoard={createNewBoard}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
      
      {currentBoard ? (
        <Board 
          board={currentBoard}
          onUpdateBoard={updateBoard}
          darkMode={darkMode}
        />
      ) : (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-4">
              Nenhum quadro selecionado
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Selecione ou crie um quadro para começar
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
