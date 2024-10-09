// src/pages/loginPage/page.js
import dynamic from 'next/dynamic';

const LoginPageController = dynamic(() => import('../../../mvcComponent/loginPage/loginPage.controller'), {
  ssr: false,
});

const LoginPage = () => {
  return (
    <>
      <LoginPageController />
    </>
  );
};

export default LoginPage;
