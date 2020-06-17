import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
  // Create hook for formData, and set default values
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  //Destructure fields from formData
  const { email, password } = formData;

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
    console.log('Success');
  };

  return (
    <Fragment>
      <h1 className='large text-primary'>Sign in</h1>
      <p className='lead'>
        <i className='fas fa-user'></i> Sign Into Your Account
      </p>
      <form className='form' onSubmit={(e) => onSubmit(e)}>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email Address'
            name='email'
            value={email}
            onChange={(e) => onChange(e)}
            required
          />
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
        <input type='submit' className='btn btn-primary' value='Login' />
      </form>
      <p className='my-1'>
        Don't have an account? <Link to='/register'>Sign Up</Link>
      </p>
    </Fragment>
  );
}

export default Login;
