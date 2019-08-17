import { BadRequestException } from '@nestjs/common';
import { isString } from 'util';

export function getFormattedColumnName(name: string) {
  if (!name || !isString(name)) {
    throw new BadRequestException('Please enter valid column name');
  }

  return name
    .split(' ')
    .join('_')
    .toUpperCase();
}
