
import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Column, Card } from '@/types/kanban';
import { KanbanCard } from './KanbanCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface KanbanColumnProps {
  column: Column;
  onUpdateColumn: (updates: Partial<Column>) => void;
  onDeleteColumn: () => void;
  onCreateCard: (cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCard: (cardId: string, updates: Partial<Card>) => void;
  onDeleteCard: (cardId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  onUpdateColumn,
  onDeleteColumn,
  onCreateCard,
  onUpdateCard,
  onDeleteCard
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    tags: ''
  });
  const [editColumn, setEditColumn] = useState({
    title: column.title,
    color: column.color
  });

  const handleCreateCard = () => {
    if (!newCard.title.trim()) {
      toast.error('O título do cartão é obrigatório');
      return;
    }

    onCreateCard({
      title: newCard.title,
      description: newCard.description,
      priority: newCard.priority,
      tags: newCard.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });

    setNewCard({ title: '', description: '', priority: 'medium', tags: '' });
    setIsAddingCard(false);
    toast.success('Cartão criado com sucesso!');
  };

  const handleUpdateColumn = () => {
    if (!editColumn.title.trim()) {
      toast.error('O título da coluna é obrigatório');
      return;
    }

    onUpdateColumn({
      title: editColumn.title,
      color: editColumn.color
    });

    setIsEditingColumn(false);
    toast.success('Coluna atualizada com sucesso!');
  };

  const handleDeleteColumn = () => {
    if (column.cards.length > 0) {
      if (!confirm('Esta coluna contém cartões. Tem certeza que deseja excluí-la? Todos os cartões serão perdidos.')) {
        return;
      }
    } else if (!confirm('Tem certeza que deseja excluir esta coluna?')) {
      return;
    }

    onDeleteColumn();
    toast.success('Coluna excluída com sucesso!');
  };

  const colors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
    '#ec4899', '#6366f1', '#06b6d4', '#84cc16', '#f97316'
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-4 min-w-80 max-w-80 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
            {column.cards.length}
          </span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsEditingColumn(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar coluna
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteColumn} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir coluna
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-32 transition-colors duration-200 ${
              snapshot.isDraggingOver ? 'bg-blue-50 rounded-md' : ''
            }`}
          >
            {column.cards.map((card, index) => (
              <KanbanCard
                key={card.id}
                card={card}
                index={index}
                onUpdate={(updates) => onUpdateCard(card.id, updates)}
                onDelete={() => onDeleteCard(card.id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="w-full mt-2 justify-start text-gray-600 hover:text-gray-900">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar cartão
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Cartão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={newCard.title}
                onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                placeholder="Título do cartão"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={newCard.description}
                onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                placeholder="Descrição do cartão"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Prioridade</label>
              <Select value={newCard.priority} onValueChange={(value: any) => setNewCard({ ...newCard, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
              <Input
                value={newCard.tags}
                onChange={(e) => setNewCard({ ...newCard, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateCard} className="flex-1">
                Criar
              </Button>
              <Button variant="outline" onClick={() => setIsAddingCard(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingColumn} onOpenChange={setIsEditingColumn}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Coluna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={editColumn.title}
                onChange={(e) => setEditColumn({ ...editColumn, title: e.target.value })}
                placeholder="Título da coluna"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      editColumn.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditColumn({ ...editColumn, color })}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateColumn} className="flex-1">
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setIsEditingColumn(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
