import {
  PipeTransform,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Injectable()
export class PageValidation implements PipeTransform {
  transform(value: any) {
    const err = new HttpException(
      `${value} is not valid page number. Page must be positive integer.`,
      HttpStatus.BAD_REQUEST,
    );

    if (value == undefined || value == '') {
      return 1;
    } else if (value == 0) {
      throw err;
    }

    if (value >>> 0 === parseFloat(value)) {
      return value;
    } else {
      throw err;
    }
  }
}
