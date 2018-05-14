import { createSelector } from 'reselect';

/**
 * Direct selector to the stats state domain
 */
const selectStatsDomain = (state) => state.get('stats');

/**
 * Other specific selectors
 */


/**
 * Default selector used by Stats
 */

const makeSelectStats = () => createSelector(
  selectStatsDomain,
  (substate) => substate.toJS()
);

export default makeSelectStats;
export {
  selectStatsDomain,
};
