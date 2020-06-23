import axios from 'axios';
import {
  GET_PROFILE,
  PROFILE_ERROR,
  UPDATE_PROFILE,
  CLEAR_PROFILE,
  ACCOUNT_DELETED
} from './types';
import { setAlert } from './alert';

// Get current user's profile

export const getCurrentProfile = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/profile/me');
    dispatch({ type: GET_PROFILE, payload: res.data });
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Create or update profile

export const createProfile = (formData, history, edit = false) => async (
  dispatch
) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    // Get form data
    const res = await axios.post('/api/profile', formData, config);
    // get profile
    dispatch({ type: GET_PROFILE, payload: res.data });

    // Display alert based on edit flag (creating or updating)
    dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'));
    if (!edit) {
      history.push('/dashboard');
    }
  } catch (err) {
    //Validation errors from auth
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Add experience to profile

export const addExperience = (formData, history) => async (dispatch) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    // Update profile via put request
    const res = await axios.put('/api/profile/experience', formData, config);
    // send update profile action
    dispatch({ type: UPDATE_PROFILE, payload: res.data });

    // Display sucess message
    dispatch(setAlert('Experience added', 'success'));
    history.push('/dashboard');
  } catch (err) {
    //Validation errors from auth
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Add education to profile

export const addEducation = (formData, history) => async (dispatch) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    // Update profile eucation via put request
    const res = await axios.put('/api/profile/education', formData, config);
    // send update profile action
    dispatch({ type: UPDATE_PROFILE, payload: res.data });

    // Display sucess message
    dispatch(setAlert('Education added', 'success'));
    history.push('/dashboard');
  } catch (err) {
    //Validation errors from auth
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Delete experience

export const deleteExperience = (id) => async (dispatch) => {
  try {
    const res = await axios.delete(`api/profile/experience/${id}`);
    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data
    });
    dispatch(setAlert('Experience deleted', 'success'));
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Delete education

export const deleteEducation = (id) => async (dispatch) => {
  try {
    const res = await axios.delete(`api/profile/education/${id}`);
    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data
    });
    dispatch(setAlert('Education deleted', 'success'));
  } catch (err) {
    dispatch({
      type: PROFILE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

// Delete account and profile
// No parameters passed, because account details come from token
// Wrap in confirmation dialog
export const deleteAccount = () => async (dispatch) => {
  if (window.confirm('Are you sure? Account will be permanently deleted.')) {
    try {
      const res = await axios.delete('api/profile');
      dispatch({ type: CLEAR_PROFILE });
      dispatch({ type: ACCOUNT_DELETED });
      dispatch(setAlert('Your account has been deleted'));
    } catch (err) {
      dispatch({
        type: PROFILE_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
    }
  }
};
