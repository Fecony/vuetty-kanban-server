import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ObjectID } from 'mongodb';

@Injectable()
export class IdValidation implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    /**
     * Check if passed id param/query is valid mongodb id
     */
    if (metadata.data == 'id' && !ObjectID.isValid(value)) {
      throw new BadRequestException(`ID: '${value}' is not valid.`);
    }

    return value;
  }
}
