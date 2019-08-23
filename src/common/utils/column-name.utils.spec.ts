import { getFormattedColumnName } from './column-name.utils';

describe('Column Name util function', () => {
  it('should return formatted column name', () => {
    expect(getFormattedColumnName('testing name')).toBe('TESTING_NAME');
  });
});
