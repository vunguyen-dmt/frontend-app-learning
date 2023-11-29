import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import './Footer.scss';

const Footer = () => {
  const { authenticatedUser, config } = useContext(AppContext);
  return (
    <div className="footer-x"><div className="container-xl">{config.SITE_NAME}</div></div>
  );
};

export default Footer;
