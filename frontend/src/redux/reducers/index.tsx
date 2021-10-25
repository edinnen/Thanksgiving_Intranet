import Settings from './Setting';
import Common from './Common';
import FirebaseAuth from './FirebaseAuth';
import Dashboard from './Dashboard';

const reducers = {
  settings: Settings,
  auth: FirebaseAuth,
  dashboard: Dashboard,
  common: Common,
};

export default reducers;
