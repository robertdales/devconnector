import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  // Create hook for formData, and set default values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  //Destructure fields from formData
  const { name, email, password, password2 } = formData;

  // onChange function for managed form fields
  // Uses setFormData to update state
  // Uses spread operator to get current value,
  // then alters correct field based on name and value of form element passed in
  // Allows same function to handle every field
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    //Stop page refreshing on form submission
    e.preventDefault();
    if (password !== password2) {
      console.log('Passwords do not match');
    } else {
      // All of this code will be replace with a redux
      const newUser = {
        name,
        email,
        password
      };
      try {
        // Build axios post
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        };
        const body = JSON.stringify(newUser);
        // Use axios to make post to our api/users route.
        // Pass new user in in body, along with headers in config
        const res = await axios.post('/api/users', body, config);
        // res should contain auth token
        console.log(res.data);
      } catch (err) {
        console.error(err.response.data);
      }
    }
  };

  return (
    <Fragment>
      <h1 className='large text-primary'>Sign Up</h1>
      <p className='lead'>
        <i className='fas fa-user'></i> Create Your Account
      </p>
      <form className='form' onSubmit={(e) => onSubmit(e)}>
        <div className='form-group'>
          <input
            type='text'
            placeholder='Name'
            name='name'
            value={name}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email Address'
            name='email'
            value={email}
            onChange={(e) => onChange(e)}
            required
          />
          <small className='form-text'>
            This site uses Gravatar so if you want a profile image, use a
            Gravatar email
          </small>
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Password'
            name='password'
            value={password}
            onChange={(e) => onChange(e)}
            required
            minLength='6'
          />
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Confirm Password'
            name='password2'
            value={password2}
            onChange={(e) => onChange(e)}
            required
            minLength='6'
          />
        </div>
        <input type='submit' className='btn btn-primary' value='Register' />
      </form>
      <p className='my-1'>
        Already have an account? <Link to='login'>Sign In</Link>
      </p>
    </Fragment>
  );
}

export default Register;
