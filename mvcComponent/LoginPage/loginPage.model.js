// mvcComponent/loginPage/loginPage.model.js
export const LoginPageModel = {
  // Example static data or configurations
  title: 'User Login',
  fields: {
    email: {
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email',
    },
    password: {
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
    },
  },
  buttons: {
    login: 'Login',
    googleLogin: 'Login with Google',
    register: 'Register',
  },
};
