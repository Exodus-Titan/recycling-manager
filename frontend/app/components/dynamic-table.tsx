'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from '@/app/components/ui/button';
import { Trash2, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Words_diccionary } from '../lib/diccionary';
import Link from 'next/link';
import { deleteData } from '../lib/data';
import { useRouter } from 'next/navigation';



interface DynamicTableProps {
  data: Record<string, any>[];
  url?: string;
  deleteAPIRoute?: string;
  className?: string;
  minColumnWidth?: string;
  maxHeight?: string;
  onEdit?: (row: Record<string, any>) => void;
  onDelete?: (row: Record<string, any>) => void;
}

export function DynamicTable({
  data,
  url,
  deleteAPIRoute,
  className,
  minColumnWidth = '150px',
  maxHeight = '600px',
}: DynamicTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        No hay datos para mostrar
      </div>
    );
  }

  const router = useRouter();

  // --- LÓGICA DE FILTRADO DE COLUMNAS ---
  // Filtramos las llaves para que si existe 'provider_name', oculte 'provider'
  const allKeys = Object.keys(data[0]);
  const columns = allKeys.filter(key => {
    if (key === 'provider' && allKeys.includes('provider_name')) {
      return false; // Ocultamos el ID si el nombre formateado existe
    }
    if (key === 'ticket' && allKeys.includes('ticket_display')) {
      return false;
    }
    if (key === 'items') 
      return false 
    if (key === 'company')
      return false
    return true;
  });
  // --------------------------------------

  async function onDelete(row: Record<string, any>) {
    // Usamos confirmación nativa para evitar borrados accidentales
    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return;

    const result = await deleteData(deleteAPIRoute + row.id + "/delete/");
    if (result) {
      console.log('Eliminado exitosamente:', result);
      router.refresh();
    } else {
      console.error('Error al eliminar el registro');
    }
  };

  const getColumnLabel = (column: string): string => {
    // Si es provider_name, usamos la etiqueta de Proveedor
    if (column === 'provider_name') return Words_diccionary['provider'] || 'Proveedor';
    
    if (Words_diccionary[column]) {
      return Words_diccionary[column];
    } else {
      return column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ');
    }
  }

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    // Si por error llega un objeto, mostramos un string vacío o un valor por defecto
    if (typeof value === 'object') return '-'; 
    return String(value);
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-auto rounded-lg border border-border bg-card',
        className
      )}
      style={{ maxHeight }}
    >
      <Table>
        <TableHeader className="sticky top-0 bg-blue-600 z-10">
          <TableRow className="hover:bg-blue-600 border-b border-border">
            {columns.map((column) => (
              <TableHead
                key={column}
                className={cn(
                  "text-white font-semibold whitespace-nowrap border-r border-white/20"
                )}
                style={{
                  minWidth: column === 'id' ? '80px' : minColumnWidth,
                  width: column === 'id' ? '80px' : 'auto',
                }}
              >
                {getColumnLabel(column)}
              </TableHead>
            ))}
            <TableHead className="text-white font-semibold whitespace-nowrap border-r border-white/20 w-24">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className="hover:bg-muted/50 transition-colors"
            >
              {columns.map((column) => (
                <TableCell
                  key={`${rowIndex}-${column}`}
                  className={cn(
                    "whitespace-nowrap border-r border-border",
                    column === 'provider_name' && "font-medium"
                  )}
                  style={{
                    minWidth: column === 'id' ? '80px' : minColumnWidth,
                    width: column === 'id' ? '80px' : 'auto',
                  }}
                >
                  {formatCellValue(row[column])}
                </TableCell>
              ))}
              <TableCell className="whitespace-nowrap border-r border-border w-24">
                <div className="flex gap-2">
                  <Link href={`${url}${row.id}/edit`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-blue-100 text-yellow-400"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(row)}
                    className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
