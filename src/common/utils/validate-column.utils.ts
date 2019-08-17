import { getFormattedColumnName } from './column-name.utils';
import { IColumn } from '../../projects/interfaces/column.interface';
import { BadRequestException } from '@nestjs/common';

export function validateColumnName(
  columns: [IColumn],
  status: string,
): boolean {
  if (!columns.length) {
    throw new BadRequestException("Project doesn't have any columns.");
  }

  status = status ? getFormattedColumnName(status) : 'TO_DO';
  return columns.some(c => c.name === status);
}
