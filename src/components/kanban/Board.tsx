
import { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColumnComponent } from './Column';
import { CreateColumnDialog } from './CreateColumnDialog';
import { KanbanBoard, Column, Card } from '../../pages/Index';

interface BoardProps {
  board: KanbanBoard;
  onUpdateBoard: (board: KanbanBoard) => void;
  darkMode: boolean;
}

export const Board = ({ board, onUpdateBoard, darkMode }: BoardProps) => {
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = board.columns.find(col => col.id === source.droppableId);
    const destColumn = board.columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const card = sourceColumn.cards.find(card => card.id === draggableId);
    if (!card) return;

    // Create new columns with updated cards
    const newColumns = board.columns.map(column => {
      if (column.id === source.droppableId) {
        // Remove card from source column
        return {
          ...column,
          cards: column.cards.filter(c => c.id !== draggableId)
        };
      }
      if (column.id === destination.droppableId) {
        // Add card to destination column
        const newCards = [...column.cards];
        newCards.splice(destination.index, 0, card);
        return {
          ...column,
          cards: newCards
        };
      }
      return column;
    });

    const updatedBoard = {
      ...board,
      columns: newColumns
    };

    onUpdateBoard(updatedBoard);
  };

  const addColumn = (title: string, color: string) => {
    const newColumn: Column = {
      id: Date.now().toString(),
      title,
      color,
      cards: []
    };

    const updatedBoard = {
      ...board,
      columns: [...board.columns, newColumn]
    };

    onUpdateBoard(updatedBoard);
  };

  const updateColumn = (columnId: string, updates: Partial<Column>) => {
    const updatedBoard = {
      ...board,
      columns: board.columns.map(col =>
        col.id === columnId ? { ...col, ...updates } : col
      )
    };
    onUpdateBoard(updatedBoard);
  };

  const deleteColumn = (columnId: string) => {
    const updatedBoard = {
      ...board,
      columns: board.columns.filter(col => col.id !== columnId)
    };
    onUpdateBoard(updatedBoard);
  };

  const addCard = (columnId: string, card: Omit<Card, 'id' | 'createdAt'>) => {
    const newCard: Card = {
      ...card,
      id: Date.now().toString(),
      createdAt: new Date()
    };

    const updatedBoard = {
      ...board,
      columns: board.columns.map(col =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, newCard] }
          : col
      )
    };

    onUpdateBoard(updatedBoard);
  };

  const updateCard = (columnId: string, cardId: string, updates: Partial<Card>) => {
    const updatedBoard = {
      ...board,
      columns: board.columns.map(col =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.map(card =>
                card.id === cardId ? { ...card, ...updates } : card
              )
            }
          : col
      )
    };
    onUpdateBoard(updatedBoard);
  };

  const deleteCard = (columnId: string, cardId: string) => {
    const updatedBoard = {
      ...board,
      columns: board.columns.map(col =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.filter(card => card.id !== cardId)
            }
          : col
      )
    };
    onUpdateBoard(updatedBoard);
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {board.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Total de colunas: {board.columns.length} | 
          Total de cartões: {board.columns.reduce((acc, col) => acc + col.cards.length, 0)}
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-6">
          {board.columns.map(column => (
            <ColumnComponent
              key={column.id}
              column={column}
              onUpdateColumn={updateColumn}
              onDeleteColumn={deleteColumn}
              onAddCard={addCard}
              onUpdateCard={updateCard}
              onDeleteCard={deleteCard}
              darkMode={darkMode}
            />
          ))}
          
          {/* Add Column Button */}
          <div className="flex-shrink-0">
            <Button
              variant="dashed"
              className="w-80 h-12 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 touch-friendly"
              onClick={() => setIsCreateColumnOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Coluna
            </Button>
          </div>
        </div>
      </DragDropContext>

      <CreateColumnDialog
        open={isCreateColumnOpen}
        onOpenChange={setIsCreateColumnOpen}
        onCreateColumn={addColumn}
      />
    </div>
  );
};
