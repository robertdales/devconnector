// rootReducer - combines our other reducers

import { combineReducers } from 'redux';

// Import our reducers
import alert from './alert';

// Export combined reducers
export default combineReducers({ alert });
