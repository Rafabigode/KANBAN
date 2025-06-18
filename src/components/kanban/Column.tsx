
import { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { MoreVertical, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CardComponent } from './CardComponent';
import { CreateCardDialog } from './CreateCardDialog';
import { EditColumnDialog } from './EditColumnDialog';
import { Column, Card } from '../../pages/Index';

interface ColumnProps {
  column: Column;
  onUpdateColumn: (columnId: string, updates: Partial<Column>) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddCard: (columnId: string, card: Omit<Card, 'id' | 'createdAt'>) => void;
  onUpdateCard: (columnId: string, cardId: string, updates: Partial<Card>) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  darkMode: boolean;
}

export const ColumnComponent = ({
  column,
  onUpdateColumn,
  onDeleteColumn,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  darkMode
}: ColumnProps) => {
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [isEditColumnOpen, setIsEditColumnOpen] = useState(false);

  const handleDeleteColumn = () => {
    if (window.confirm(`Tem certeza que deseja excluir a coluna "${column.title}"? Todos os cartões serão perdidos.`)) {
      onDeleteColumn(column.id);
    }
  };

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Column Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {column.title}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {column.cards.length}
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditColumnOpen(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar Coluna
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteColumn}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Coluna
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Cards Container */}
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-4 space-y-3 min-h-[200px] transition-colors ${
                snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              {column.cards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transform transition-transform ${
                        snapshot.isDragging ? 'rotate-5 scale-105' : ''
                      }`}
                    >
                      <CardComponent
                        card={card}
                        onUpdateCard={(updates) => onUpdateCard(column.id, card.id, updates)}
                        onDeleteCard={() => onDeleteCard(column.id, card.id)}
                        darkMode={darkMode}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Add Card Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white touch-friendly"
            onClick={() => setIsCreateCardOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar cartão
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <CreateCardDialog
        open={isCreateCardOpen}
        onOpenChange={setIsCreateCardOpen}
        onCreateCard={(card) => onAddCard(column.id, card)}
      />

      <EditColumnDialog
        open={isEditColumnOpen}
        onOpenChange={setIsEditColumnOpen}
        column={column}
        onUpdateColumn={(updates) => onUpdateColumn(column.id, updates)}
      />
    </div>
  );
};
