import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PageValidation implements PipeTransform {
  transform(value: any) {
    const err = new BadRequestException(
      `${value} is not valid page number. Page must be positive integer.`,
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
