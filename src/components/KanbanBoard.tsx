import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useKanban } from '@/hooks/useKanban';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import { KanbanColumn } from './KanbanColumn';
import { KPIDashboard } from './KPIDashboard';
import { PauseScreen } from './PauseScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Download, Edit, Trash2, MoreVertical, Kanban, BarChart3, Pause } from 'lucide-react';
import { exportBoardToExcel } from '@/utils/exportToExcel';
import { toast } from 'sonner';
import { ThemeToggle } from './ThemeToggle';

export const KanbanBoard: React.FC = () => {
  const {
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
  } = useKanban();

  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [newBoard, setNewBoard] = useState({ title: '', description: '' });
  const [newColumn, setNewColumn] = useState({ title: '', color: '#6366f1' });
  const [editBoard, setEditBoard] = useState({ title: '', description: '' });
  const [isPauseActive, setIsPauseActive] = useState(false);

  const currentBoard = getCurrentBoard();

  // Configuração do timer de inatividade (2 minutos = 120000ms)
  const handleInactivity = useCallback(() => {
    setIsPauseActive(true);
  }, []);

  const { resetTimer } = useInactivityTimer({
    timeout: 120000, // 2 minutos
    onInactive: handleInactivity
  });

  const handleManualPause = () => {
    setIsPauseActive(true);
  };

  const handleResumePause = () => {
    setIsPauseActive(false);
    resetTimer();
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !currentBoard) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    moveCard(
      currentBoard.id,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );

    toast.success('Cartão movido com sucesso!');
  };

  const handleCreateBoard = () => {
    if (!newBoard.title.trim()) {
      toast.error('O título do quadro é obrigatório');
      return;
    }

    createBoard(newBoard.title, newBoard.description);
    setNewBoard({ title: '', description: '' });
    setIsCreatingBoard(false);
    toast.success('Quadro criado com sucesso!');
  };

  const handleCreateColumn = () => {
    if (!currentBoard || !newColumn.title.trim()) {
      toast.error('O título da coluna é obrigatório');
      return;
    }

    createColumn(currentBoard.id, newColumn.title, newColumn.color);
    setNewColumn({ title: '', color: '#6366f1' });
    setIsCreatingColumn(false);
    toast.success('Coluna criada com sucesso!');
  };

  const handleEditBoard = () => {
    if (!currentBoard || !editBoard.title.trim()) {
      toast.error('O título do quadro é obrigatório');
      return;
    }

    updateBoard(currentBoard.id, {
      title: editBoard.title,
      description: editBoard.description
    });

    setIsEditingBoard(false);
    toast.success('Quadro atualizado com sucesso!');
  };

  const handleDeleteBoard = () => {
    if (!currentBoard) return;

    if (currentBoard.columns.some(col => col.cards.length > 0)) {
      if (!confirm('Este quadro contém cartões. Tem certeza que deseja excluí-lo? Todos os dados serão perdidos.')) {
        return;
      }
    } else if (!confirm('Tem certeza que deseja excluir este quadro?')) {
      return;
    }

    deleteBoard(currentBoard.id);
    toast.success('Quadro excluído com sucesso!');
  };

  const handleExportToExcel = () => {
    if (!currentBoard) {
      toast.error('Nenhum quadro selecionado para exportar');
      return;
    }

    try {
      exportBoardToExcel(currentBoard);
      toast.success('Quadro exportado para Excel com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar para Excel');
      console.error('Erro na exportação:', error);
    }
  };

  const colors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
    '#ec4899', '#6366f1', '#06b6d4', '#84cc16', '#f97316'
  ];

  if (!currentBoard) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sistema Kanban</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Crie seu primeiro quadro para começar</p>
            <Dialog open={isCreatingBoard} onOpenChange={setIsCreatingBoard}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Quadro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Quadro</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={newBoard.title}
                      onChange={(e) => setNewBoard({ ...newBoard, title: e.target.value })}
                      placeholder="Nome do quadro"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Input
                      value={newBoard.description}
                      onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                      placeholder="Descrição do quadro"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateBoard} className="flex-1">
                      Criar
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreatingBoard(false)} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <PauseScreen isActive={isPauseActive} onResume={handleResumePause} />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Cabeçalho */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{currentBoard.title}</h1>
                  {currentBoard.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{currentBoard.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleManualPause}
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  title="Ativar pausa"
                >
                  <Pause className="h-4 w-4" />
                </Button>
                
                <ThemeToggle />
                
                {/* Seletor de quadros */}
                {store.boards.length > 1 && (
                  <Select value={currentBoard.id} onValueChange={setActiveBoard}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {store.boards.map(board => (
                        <SelectItem key={board.id} value={board.id}>
                          {board.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Button onClick={handleExportToExcel} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>

                <Dialog open={isCreatingColumn} onOpenChange={setIsCreatingColumn}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Coluna
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Coluna</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Título</label>
                        <Input
                          value={newColumn.title}
                          onChange={(e) => setNewColumn({ ...newColumn, title: e.target.value })}
                          placeholder="Nome da coluna"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Cor</label>
                        <div className="flex gap-2 flex-wrap">
                          {colors.map(color => (
                            <button
                              key={color}
                              className={`w-8 h-8 rounded-full border-2 ${
                                newColumn.color === color ? 'border-gray-800 dark:border-gray-200' : 'border-gray-300 dark:border-gray-600'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setNewColumn({ ...newColumn, color })}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateColumn} className="flex-1">
                          Criar
                        </Button>
                        <Button variant="outline" onClick={() => setIsCreatingColumn(false)} className="flex-1">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {
                      setEditBoard({
                        title: currentBoard.title,
                        description: currentBoard.description
                      });
                      setIsEditingBoard(true);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar quadro
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsCreatingBoard(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo quadro
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteBoard} className="text-red-600 dark:text-red-400">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir quadro
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal com Tabs */}
        <div className="p-6">
          <Tabs defaultValue="kanban" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <Kanban className="h-4 w-4" />
                Quadro Kanban
              </TabsTrigger>
              <TabsTrigger value="kpis" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                KPIs e Análises
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kanban">
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {currentBoard.columns.map(column => (
                    <KanbanColumn
                      key={column.id}
                      column={column}
                      onUpdateColumn={(updates) => updateColumn(currentBoard.id, column.id, updates)}
                      onDeleteColumn={() => deleteColumn(currentBoard.id, column.id)}
                      onCreateCard={(cardData) => createCard(currentBoard.id, column.id, cardData)}
                      onUpdateCard={(cardId, updates) => updateCard(currentBoard.id, column.id, cardId, updates)}
                      onDeleteCard={(cardId) => deleteCard(currentBoard.id, column.id, cardId)}
                    />
                  ))}
                </div>
              </DragDropContext>

              {currentBoard.columns.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma coluna criada</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">Crie sua primeira coluna para começar a organizar as tarefas</p>
                  <Button onClick={() => setIsCreatingColumn(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira coluna
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="kpis">
              <KPIDashboard />
            </TabsContent>
          </Tabs>
        </div>

        {/* Diálogos */}
        <Dialog open={isCreatingBoard} onOpenChange={setIsCreatingBoard}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Quadro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={newBoard.title}
                  onChange={(e) => setNewBoard({ ...newBoard, title: e.target.value })}
                  placeholder="Nome do quadro"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  value={newBoard.description}
                  onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                  placeholder="Descrição do quadro"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateBoard} className="flex-1">
                  Criar
                </Button>
                <Button variant="outline" onClick={() => setIsCreatingBoard(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditingBoard} onOpenChange={setIsEditingBoard}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Quadro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={editBoard.title}
                  onChange={(e) => setEditBoard({ ...editBoard, title: e.target.value })}
                  placeholder="Nome do quadro"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  value={editBoard.description}
                  onChange={(e) => setEditBoard({ ...editBoard, description: e.target.value })}
                  placeholder="Descrição do quadro"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditBoard} className="flex-1">
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setIsEditingBoard(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <PauseScreen isActive={isPauseActive} onResume={handleResumePause} />
    </>
  );
};
