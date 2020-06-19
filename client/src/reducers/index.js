// rootReducer - combines our other reducers

import { combineReducers } from 'redux';

// Import our reducers
import alert from './alert';
import auth from './auth';
import profile from './profile';

// Export combined reducers
export default combineReducers({ alert, auth, profile });
