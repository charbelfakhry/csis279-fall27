import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

const MAX_SERIAL = 2147483647;

// ids that can't exist in a SERIAL column ("abc", -1, 1.5, too big) are a 404,
// instead of reaching postgres and failing there
@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0 || id > MAX_SERIAL) {
      throw new NotFoundException('Not found');
    }
    return id;
  }
}
