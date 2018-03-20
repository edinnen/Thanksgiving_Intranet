
import { fromJS } from 'immutable';
import statsReducer from '../reducer';

describe('statsReducer', () => {
  it('returns the initial state', () => {
    expect(statsReducer(undefined, {})).toEqual(fromJS({}));
  });
});
