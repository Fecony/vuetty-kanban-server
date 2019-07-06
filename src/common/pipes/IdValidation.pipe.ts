import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ObjectID } from 'mongodb';

@Injectable()
export class IdValidation implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    /**
     * Check if passed id param/query is valid mongodb id
     */
    if (metadata.data == 'id' && !ObjectID.isValid(value)) {
      throw new HttpException(
        `ID: '${value}' is not valid.`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }
}
