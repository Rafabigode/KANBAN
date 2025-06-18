
import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, Calendar, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { EditCardDialog } from './EditCardDialog';
import { Card } from '../../pages/Index';

interface CardComponentProps {
  card: Card;
  onUpdateCard: (updates: Partial<Card>) => void;
  onDeleteCard: () => void;
  darkMode: boolean;
}

export const CardComponent = ({ card, onUpdateCard, onDeleteCard, darkMode }: CardComponentProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDeleteCard = () => {
    if (window.confirm(`Tem certeza que deseja excluir o cartão "${card.title}"?`)) {
      onDeleteCard();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
            {card.title}
          </h4>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDeleteCard}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {card.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Tags */}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {card.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{new Date(card.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-xs">{getPriorityIcon(card.priority)}</span>
            <Badge variant="secondary" className={`text-xs ${getPriorityColor(card.priority)}`}>
              {card.priority === 'high' ? 'Alta' : card.priority === 'medium' ? 'Média' : 'Baixa'}
            </Badge>
          </div>
        </div>
      </div>

      <EditCardDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        card={card}
        onUpdateCard={onUpdateCard}
      />
    </div>
  );
};
