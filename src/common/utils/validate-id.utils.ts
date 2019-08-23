import { BadRequestException } from '@nestjs/common';
import { ObjectID } from 'mongodb';

export function validateMongoId(id: string) {
  if (!ObjectID.isValid(id)) {
    throw new BadRequestException(`ID: '${id}' is not valid.`);
  }
}
