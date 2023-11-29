import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import {
  StandardModal, ActionRow, Button, useToggle,
} from '@edx/paragon';
import LanguageSelector from '../LanguageSelector/LanguageSelector';

import './Header.scss';

const Header = () => {
  const { authenticatedUser, config } = useContext(AppContext);
  const [isOpen, open, close] = useToggle(false);
  const logout = () => {
    let logoutUrl = config.LOGOUT_URL;
    if (!logoutUrl) {
      logoutUrl = `${config.LMS_BASE_URL}/logout`;
    }
    window.location.href = logoutUrl;
  };

  const goToCourseHome = () => {
    const splitted = window.location.pathname.split('/');
    if (splitted.length > 1) {
      const courseId = splitted[1] === 'course' ? splitted[2] : splitted[3];
      if (courseId.startsWith('course-v')) {
        window.location.href = `/course/${courseId}/exam-dashboard`;
        return;
      }
    }
    alert('We could not find your course id, please relaunch the application and try again.');
  };

  return (
    <div>
      {authenticatedUser
      && (
      <div className="header-wp">
        <div className="container-xl">
          <div className="header-content-wp">
            <div className="logo-wp"><img className="logo" alt="logo" src={config.LOGO_URL} /></div>
            <div><a className="course-name" id="header-course-name" onClick={() => { goToCourseHome(); }}>Course ouline</a></div>
            <div className="lang-and-name-group">
              <div><LanguageSelector /></div>
              <div>
                <div><span className="user-name">{authenticatedUser.name}</span>&nbsp;<span className="username">@{authenticatedUser.username}</span></div>
                <div className="logout-btn-wp"><a onClick={open} className="logout-btn">Logout</a></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
      <StandardModal
        title="Log out?"
        isOpen={isOpen}
        onClose={close}
        footerNode={(
          <ActionRow>
            <ActionRow.Spacer />
            <Button variant="tertiary" onClick={close}>No, close modal</Button>
            <Button onClick={() => { logout(); }}>Yes, log out now</Button>
          </ActionRow>
        )}
      >
        <p>Are you sure you want to log out?</p>
      </StandardModal>
    </div>

  );
};

export default Header;
