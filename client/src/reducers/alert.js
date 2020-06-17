import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [];

export default function (state = initialState, action) {
  const { type, payload } = action;
  // Depending on action type:
  switch (type) {
    // Insert payload into state
    case SET_ALERT:
      return [...state, payload];
    // Remove payload from state
    case REMOVE_ALERT:
      return state.filter((alert) => alert.id !== payload);
    default:
      return state;
  }
}
