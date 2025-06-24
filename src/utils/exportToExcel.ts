
import * as XLSX from 'xlsx';
import { Board } from '@/types/kanban';

export const exportBoardToExcel = (board: Board) => {
  const workbook = XLSX.utils.book_new();
  
  // Dados gerais do quadro
  const boardData = [
    ['Quadro:', board.title],
    ['Descrição:', board.description],
    ['Criado em:', new Date(board.createdAt).toLocaleString('pt-BR')],
    ['Atualizado em:', new Date(board.updatedAt).toLocaleString('pt-BR')],
    ['Total de Colunas:', board.columns.length],
    ['Total de Cartões:', board.columns.reduce((total, col) => total + col.cards.length, 0)],
    [''],
  ];

  // Dados detalhados dos cartões
  const cardsData = [
    ['Coluna', 'Título do Cartão', 'Descrição', 'Prioridade', 'Tags', 'Criado em', 'Atualizado em']
  ];

  board.columns.forEach(column => {
    if (column.cards.length === 0) {
      cardsData.push([column.title, '(Nenhum cartão)', '', '', '', '', '']);
    } else {
      column.cards.forEach(card => {
        cardsData.push([
          column.title,
          card.title,
          card.description,
          card.priority === 'low' ? 'Baixa' : card.priority === 'medium' ? 'Média' : 'Alta',
          card.tags.join(', '),
          new Date(card.createdAt).toLocaleString('pt-BR'),
          new Date(card.updatedAt).toLocaleString('pt-BR')
        ]);
      });
    }
  });

  // Resumo por coluna
  const summaryData = [
    ['Coluna', 'Cor', 'Total de Cartões', 'Prioridade Alta', 'Prioridade Média', 'Prioridade Baixa', 'Criada em']
  ];

  board.columns.forEach(column => {
    const highPriority = column.cards.filter(card => card.priority === 'high').length;
    const mediumPriority = column.cards.filter(card => card.priority === 'medium').length;
    const lowPriority = column.cards.filter(card => card.priority === 'low').length;

    summaryData.push([
      column.title,
      column.color,
      column.cards.length.toString(),
      highPriority.toString(),
      mediumPriority.toString(),
      lowPriority.toString(),
      new Date(column.createdAt).toLocaleString('pt-BR')
    ]);
  });

  // Criar as planilhas
  const boardSheet = XLSX.utils.aoa_to_sheet(boardData);
  const cardsSheet = XLSX.utils.aoa_to_sheet(cardsData);
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Adicionar as planilhas ao workbook
  XLSX.utils.book_append_sheet(workbook, boardSheet, 'Informações do Quadro');
  XLSX.utils.book_append_sheet(workbook, cardsSheet, 'Cartões Detalhados');
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo por Coluna');

  // Gerar e baixar o arquivo
  const fileName = `Kanban_${board.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
