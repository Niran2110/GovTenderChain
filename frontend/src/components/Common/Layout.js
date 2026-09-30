import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="main-content">{children}</main>
    </>
  );
};

export default Layout;