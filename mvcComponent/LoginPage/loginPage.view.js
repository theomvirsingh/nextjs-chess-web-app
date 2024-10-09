// mvcComponent/loginPage/loginPage.view.js
import React from 'react';
import { useSelector } from 'react-redux';
import styles from './loginPage.module.css';

const LoginPageView = ({
  onLogin,
  onGoogleLogin,
  onRegister,
  onPasswordReset,
  onEmailVerify,
  onUpdateProfile,
  formType,
  setFormType,
  model,
}) => {
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
    currentPassword: '',
    newEmail: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const error = useSelector((state) => state.user.error);
  const success = useSelector((state) => state.user.success);
  const user = useSelector((state) => state.user.user);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formType === 'login') {
      onLogin(formData);
    } else if (formType === 'register') {
      onRegister(formData);
    } else if (formType === 'reset') {
      onPasswordReset(formData);
    } else if (formType === 'profile') {
      onUpdateProfile(formData);
    }
  };

  const renderForm = () => {
    switch (formType) {
      case 'login':
        return (
          <>
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="mb-4">
                <label className="block text-gray-700">{model.fields.email.label}:</label>
                <input
                  type={model.fields.email.type}
                  name="email"
                  className="w-full px-3 py-2 border rounded"
                  placeholder={model.fields.email.placeholder}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700">{model.fields.password.label}:</label>
                <input
                  type={model.fields.password.type}
                  name="password"
                  className="w-full px-3 py-2 border rounded"
                  placeholder={model.fields.password.placeholder}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                {model.buttons.login}
              </button>
            </form>
            <button
              onClick={onGoogleLogin}
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 mb-4"
            >
              {model.buttons.googleLogin}
            </button>
            <div className="text-center">
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => setFormType('register')}
                  className="text-blue-500 hover:underline"
                >
                  Register
                </button>
              </p>
              <p>
                Forgot your password?{' '}
                <button
                  onClick={() => setFormType('reset')}
                  className="text-blue-500 hover:underline"
                >
                  Reset Password
                </button>
              </p>
            </div>
          </>
        );
      case 'register':
        return (
          <>
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="mb-4">
                <label className="block text-gray-700">{model.fields.email.label}:</label>
                <input
                  type={model.fields.email.type}
                  name="email"
                  className="w-full px-3 py-2 border rounded"
                  placeholder={model.fields.email.placeholder}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">{model.fields.password.label}:</label>
                <input
                  type={model.fields.password.type}
                  name="password"
                  className="w-full px-3 py-2 border rounded"
                  placeholder={model.fields.password.placeholder}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700">{model.fields.confirmPassword.label}:</label>
                <input
                  type={model.fields.confirmPassword.type}
                  name="confirmPassword"
                  className="w-full px-3 py-2 border rounded"
                  placeholder={model.fields.confirmPassword.placeholder}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Register
              </button>
            </form>
            <div className="text-center">
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setFormType('login')}
                  className="text-blue-500 hover:underline"
                >
                  Login
                </button>
              </p>
            </div>
          </>
        );
      case 'reset':
        return (
          <>
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="mb-6">
                <label className="block text-gray-700">{model.fields.email.label}:</label>
                <input
                  type={model.fields.email.type}
                  name="email"
                  className="w-full px-3 py-2 border rounded"
                  placeholder={model.fields.email.placeholder}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
              >
                Reset Password
              </button>
            </form>
            <div className="text-center">
              <p>
                Remembered your password?{' '}
                <button
                  onClick={() => setFormType('login')}
                  className="text-blue-500 hover:underline"
                >
                  Login
                </button>
              </p>
            </div>
          </>
        );
      case 'profile':
        return (
          <>
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="mb-4">
                <label className="block text-gray-700">New Email:</label>
                <input
                  type="email"
                  name="newEmail"
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter your new email"
                  value={formData.newEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Current Password:</label>
                <input
                  type="password"
                  name="currentPassword"
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter your current password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required={formData.newPassword || formData.newEmail ? true : false}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">New Password:</label>
                <input
                  type="password"
                  name="newPassword"
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter your new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700">Confirm New Password:</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Confirm your new password"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  required={formData.newPassword ? true : false}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
              >
                Update Account
              </button>
            </form>
            <div className="text-center">
              <p>
                <button
                  onClick={() => setFormType('login')}
                  className="text-blue-500 hover:underline"
                >
                  Back to Login
                </button>
              </p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {formType === 'login'
            ? 'Login'
            : formType === 'register'
            ? 'Register'
            : formType === 'reset'
            ? 'Reset Password'
            : 'Account Management'}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        {renderForm()}
      </div>
    </div>
  );
};

export default LoginPageView;
