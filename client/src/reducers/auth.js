//Auth reducer
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT
} from '../actions/types';

// Set initial state
const initialState = {
  // Look in local storage for token
  // Local storage is stored in the browser itself, and is never transferred to the server
  // Set to loading (rather than loaded), to ensure we don't do anything until page is loaded
  // User is null until authenticated
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null
};

export default function (state = initialState, action) {
  // Destructure type and payload from action
  const { type, payload } = action;
  switch (type) {
    // If action is USER_LOADED, set state to authenticated and user to payload
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: payload
      };
    // If action is REGISTER_SUCCESS or LOGIN_SUCCESS, store the payload token in local storage,
    // then return new state
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      localStorage.setItem('token', payload.token);
      return {
        ...state,
        ...payload,
        isAuthenticated: true,
        loading: false
      };
    // If action is REGISTER_FAIL/AUTH_ERROR/LOGIN_FAIL/LOGOUT, remove the token,
    // then set state appropriately
    case REGISTER_FAIL:
    case AUTH_ERROR:
    case LOGIN_FAIL:
    case LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    default:
      return state;
  }
}
