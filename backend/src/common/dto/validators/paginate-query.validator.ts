import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { FILTER_MAPPER } from '../../const/filter-mapper.const';

@ValidatorConstraint({ name: 'isValidPaginateQuery', async: false })
export class IsValidPaginateQueryConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    const allowedKeys = ['page', 'take', 'order__createdAt'];
    const allowedPrefixes = ['where__', 'order__'];

    // 모든 키를 검사
    for (const key of Object.keys(object)) {
      // 기본 허용 키는 통과
      if (allowedKeys.includes(key)) {
        continue;
      }

      // where__ 또는 order__로 시작하는지 확인
      if (!allowedPrefixes.some(prefix => key.startsWith(prefix))) {
        return false;
      }

      // where__ 형식인 경우 필터 타입 검증
      if (key.startsWith('where__')) {
        const whereParts = key.replace('where__', '').split('__');
        if (whereParts.length < 2) {
          return false; // where__필드명__필터타입 형식이어야 함
        }
        const filterType = whereParts.slice(1).join('__');
        if (!FILTER_MAPPER[filterType as keyof typeof FILTER_MAPPER]) {
          return false; // FILTER_MAPPER에 없는 필터 타입
        }
      }

      // order__ 형식인 경우 값이 ASC 또는 DESC인지 확인
      if (key.startsWith('order__')) {
        const orderValue = object[key];
        if (orderValue !== 'ASC' && orderValue !== 'DESC') {
          return false;
        }
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid query parameter. Only "where__field__filter" and "order__field" formats are allowed.';
  }
}

export function IsValidPaginateQuery(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPaginateQueryConstraint,
    });
  };
}

