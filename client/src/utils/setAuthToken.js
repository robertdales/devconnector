import axios from 'axios';

// If there is a token, add it to the headers, otherwise delete it
// js 'delete' deletes a property from an object
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};
export default setAuthToken;
