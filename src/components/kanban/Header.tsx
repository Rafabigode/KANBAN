
import { useState } from 'react';
import { Plus, Moon, Sun, Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { KanbanBoard } from '../../pages/Index';

interface HeaderProps {
  boards: KanbanBoard[];
  currentBoard?: KanbanBoard;
  onBoardChange: (boardId: string) => void;
  onCreateBoard: (title: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header = ({ 
  boards, 
  currentBoard, 
  onBoardChange, 
  onCreateBoard, 
  darkMode, 
  onToggleDarkMode 
}: HeaderProps) => {
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateBoard = () => {
    if (newBoardTitle.trim()) {
      onCreateBoard(newBoardTitle.trim());
      setNewBoardTitle('');
      setIsCreateDialogOpen(false);
    }
  };

  const exportBoard = () => {
    if (currentBoard) {
      const dataStr = JSON.stringify(currentBoard, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentBoard.title.replace(/\s+/g, '_')}_kanban.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Sistema Kanban
              </h1>
            </div>
            
            {/* Board Selector */}
            <Select value={currentBoard?.id || ''} onValueChange={onBoardChange}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecionar quadro" />
              </SelectTrigger>
              <SelectContent>
                {boards.map(board => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Create Board */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="touch-friendly">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Quadro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Quadro</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome do quadro"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateBoard} disabled={!newBoardTitle.trim()}>
                      Criar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Export */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportBoard}
              disabled={!currentBoard}
              className="touch-friendly"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleDarkMode}
              className="touch-friendly"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* User Info */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <Users className="w-4 h-4" />
              <span>Operador</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
