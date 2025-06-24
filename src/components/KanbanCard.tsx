
import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card } from '@/types/kanban';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Clock, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface KanbanCardProps {
  card: Card;
  index: number;
  onUpdate: (updates: Partial<Card>) => void;
  onDelete: () => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta'
};

export const KanbanCard: React.FC<KanbanCardProps> = ({ card, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: card.title,
    description: card.description,
    priority: card.priority,
    tags: card.tags.join(', ')
  });

  const handleSave = () => {
    if (!editData.title.trim()) {
      toast.error('O título do cartão é obrigatório');
      return;
    }

    onUpdate({
      title: editData.title,
      description: editData.description,
      priority: editData.priority,
      tags: editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });

    setIsEditing(false);
    toast.success('Cartão atualizado com sucesso!');
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      onDelete();
      toast.success('Cartão excluído com sucesso!');
    }
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 transition-all duration-200 hover:shadow-md ${
            snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-gray-900 flex-1 break-words">{card.title}</h4>
            <div className="flex gap-1 ml-2">
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Editar Cartão</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Título</label>
                      <Input
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        placeholder="Título do cartão"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descrição</label>
                      <Textarea
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        placeholder="Descrição do cartão"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Prioridade</label>
                      <Select value={editData.priority} onValueChange={(value: any) => setEditData({ ...editData, priority: value })}>
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
                        value={editData.tags}
                        onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="flex-1">
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {card.description && (
            <p className="text-sm text-gray-600 mb-3 break-words">{card.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={priorityColors[card.priority]}>
              {priorityLabels[card.priority]}
            </Badge>
            {card.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(card.createdAt).toLocaleDateString('pt-BR')}
          </div>
        </div>
      )}
    </Draggable>
  );
};
