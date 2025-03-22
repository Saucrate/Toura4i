import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { IconButton } from './Button';

const Table = styled.div`
  background: ${({ theme }) => theme.colors.background.light};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: ${({ columns }) => columns};
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  gap: 1rem;

  span {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.875rem;
    font-weight: 500;
  }
`;

const TableRow = styled(motion.div)`
  display: grid;
  grid-template-columns: ${({ columns }) => columns};
  padding: 1rem;
  gap: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  transition: background 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.background.medium};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const DataTable = ({ columns, data, onEdit, onDelete }) => {
  const gridTemplateColumns = `repeat(${columns.length - 1}, 1fr) 100px`;

  return (
    <Table>
      <TableHeader columns={gridTemplateColumns}>
        {columns.map(col => (
          <span key={col.key}>{col.label}</span>
        ))}
      </TableHeader>
      {data.map((item, index) => (
        <TableRow
          key={item.id}
          columns={gridTemplateColumns}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {columns.map(col => {
            if (col.key === 'actions') {
              return (
                <Actions key="actions">
                  <IconButton onClick={() => onEdit(item)}>
                    <FiEdit2 />
                  </IconButton>
                  <IconButton onClick={() => onDelete(item)}>
                    <FiTrash2 />
                  </IconButton>
                </Actions>
              );
            }
            return (
              <span key={col.key}>
                {col.render ? col.render(item) : item[col.key]}
              </span>
            );
          })}
        </TableRow>
      ))}
    </Table>
  );
};

export default DataTable; 