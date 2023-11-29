import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { history } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { AlertList } from '../../generic/user-messages';
// import { fetchOutlineTab } from '../data';
// import messages from './messages';
// import Section from './Section';
import { useModel } from '../../generic/model-store';
import './ExamDashboard.scss';

const ExamDashboard = ({ intl }) => {
  const {
    courseId,
    proctoringPanelStatus,
  } = useSelector(state => state.courseHome);

  const {
    isSelfPaced,
    org,
    title,
    userTimezone,
  } = useModel('courseHomeMeta', courseId);

  const {
    accessExpiration,
    courseBlocks: {
      courses,
      sections,
      sequences,
    },
    courseGoals: {
      selectedGoal,
      weeklyLearningGoalEnabled,
    } = {},
    datesBannerInfo,
    datesWidget: {
      courseDateBlocks,
    },
    enableProctoredExams,
    offer,
    timeOffsetMillis,
    verifiedMode,
  } = useModel('outline', courseId);

  const {
    marketingUrl,
  } = useModel('coursewareMeta', courseId);

  const [expandAll, setExpandAll] = useState(false);

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  // Below the course title alerts (appearing in the order listed here)
  const rootCourseId = courses && Object.keys(courses)[0];

  const hasDeadlines = courseDateBlocks && courseDateBlocks.some(x => x.dateType === 'assignment-due-date');

  const logUpgradeToShiftDatesLinkClick = () => {
    sendTrackEvent('edx.bi.ecommerce.upsell_links_clicked', {
      ...eventProperties,
      linkCategory: 'personalized_learner_schedules',
      linkName: 'course_home_upgrade_shift_dates',
      linkType: 'button',
      pageName: 'course_home',
    });
  };

  const location = useLocation();

  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    const startCourse = currentParams.get('start_course');
    if (startCourse === '1') {
      sendTrackEvent('enrollment.email.clicked.startcourse', {});

      // Deleting the course_start query param as it only needs to be set once
      // whenever passed in query params.
      currentParams.delete('start_course');
      history.replace({
        search: currentParams.toString(),
      });
    }
  }, [location.search]);

  return (
    <>
      <div>
        <p className="mb-3 alert alert-primary" role="alert">Only timed exams are listed here. Click on your exam to start.</p>
        <h2>{title}</h2>
        {courses[rootCourseId].sectionIds.map((section) => (
          <div>
            <div className="font-weight-bold">{sections[section].title}</div>
            { sections[section].sequenceIds.map((sequence) => (
              sequences[sequence].description === 'Timed Exam' && (
              <div className="ml-3 sequence-x">
                <a href={`/course/${courseId}/${sequence}`}>{sequences[sequence].title}</a>
                <div>Due: {sequences[sequence].due}</div>
                <div>
                    <a href={`/course/${courseId}/${sequence}`}>View exam</a>
                </div>
              </div>
              )
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

ExamDashboard.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(ExamDashboard);
