// mvcComponent/loginPage/loginPage.controller.js
import React, { useState, useEffect } from 'react';
import LoginPageView from './loginPage.view';
import { LoginPageModel } from './loginPage.model';
import axios from 'axios';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setError, setSuccess } from '../../redux/actions/userActions';
import jwt from 'jsonwebtoken';

const LoginPageController = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [formType, setFormType] = useState('login'); // 'login', 'register', 'reset', 'profile'

  // Define validation schemas
  const loginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  const registerSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const resetSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email format').required('Email is required'),
  });

  const profileSchema = Yup.object().shape({
    newEmail: Yup.string().email('Invalid email format'),
    newPassword: Yup.string().min(6, 'Password must be at least 6 characters'),
    confirmNewPassword: Yup.string().oneOf(
      [Yup.ref('newPassword'), null],
      'Passwords must match'
    ),
    currentPassword: Yup.string().when('newPassword', {
      is: (val) => val && val.length > 0,
      then: Yup.string().required('Current password is required to set a new password'),
      otherwise: Yup.string(),
    }),
  });

  // Handler functions
  const handleLogin = async (formData) => {
    try {
      await loginSchema.validate(formData, { abortEarly: false });
      const response = await axios.post('/api/users', { email: formData.email, password: formData.password });
      if (response.data.success) {
        // Generate JWT token
        const token = jwt.sign({ email: response.data.user.email }, process.env.NEXT_PUBLIC_JWT_SECRET, { expiresIn: '1h' });
        // Store token securely (e.g., HttpOnly cookies) - For simplicity, we'll store it in localStorage
        localStorage.setItem('token', token);
        dispatch(setUser(response.data.user));
        dispatch(setSuccess('Login successful.'));
        // Redirect or perform additional actions
      } else {
        dispatch(setError(response.data.message));
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = err.inner.map((e) => e.message);
        dispatch(setError(errors.join(' ')));
      } else {
        dispatch(setError('An error occurred during login.'));
      }
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth
    window.location.href = '/api/auth/google';
  };

  const handleRegister = async (formData) => {
    try {
      await registerSchema.validate(formData, { abortEarly: false });
      const response = await axios.post('/api/users/register', {
        email: formData.email,
        password: formData.password,
      });
      if (response.data.success) {
        dispatch(setSuccess(response.data.message));
        // Optionally, automatically log in the user or redirect to login
      } else {
        dispatch(setError(response.data.message));
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = err.inner.map((e) => e.message);
        dispatch(setError(errors.join(' ')));
      } else {
        dispatch(setError('An error occurred during registration.'));
      }
    }
  };

  const handlePasswordReset = async (formData) => {
    try {
      await resetSchema.validate(formData, { abortEarly: false });
      const response = await axios.post('/api/users/reset-password', { email: formData.email });
      if (response.data.success) {
        dispatch(setSuccess(response.data.message));
      } else {
        dispatch(setError(response.data.message));
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = err.inner.map((e) => e.message);
        dispatch(setError(errors.join(' ')));
      } else {
        dispatch(setError('An error occurred during password reset.'));
      }
    }
  };

  const handleEmailVerification = async (token) => {
    try {
      const response = await axios.get(`/api/users/verify-email?token=${token}`);
      if (response.data.success) {
        dispatch(setSuccess(response.data.message));
        // Optionally, redirect to login
      } else {
        dispatch(setError(response.data.message));
      }
    } catch (err) {
      dispatch(setError('Email verification failed.'));
    }
  };

  const handleUpdateProfile = async (formData) => {
    try {
      await profileSchema.validate(formData, { abortEarly: false });
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch(setError('You must be logged in to update your profile.'));
        return;
      }
      const response = await axios.put(
        '/api/users/update',
        {
          email: user.email,
          newEmail: formData.newEmail,
          newPassword: formData.newPassword,
          confirmNewPassword: formData.confirmNewPassword,
          currentPassword: formData.currentPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        dispatch(setSuccess(response.data.message));
        // Update user info in Redux if email was changed
        if (formData.newEmail) {
          dispatch(setUser({ email: formData.newEmail, isVerified: false }));
        }
      } else {
        dispatch(setError(response.data.message));
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = err.inner.map((e) => e.message);
        dispatch(setError(errors.join(' ')));
      } else {
        dispatch(setError('An error occurred while updating your profile.'));
      }
    }
  };

  // Handle Email Verification via query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      handleEmailVerification(token);
    }
  }, []);

  return (
    <LoginPageView
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
      onRegister={handleRegister}
      onPasswordReset={handlePasswordReset}
      onEmailVerify={handleEmailVerification}
      onUpdateProfile={handleUpdateProfile}
      formType={formType}
      setFormType={setFormType}
      model={LoginPageModel}
    />
  );
};

export default LoginPageController;
