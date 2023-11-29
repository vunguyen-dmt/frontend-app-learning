import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import {
  injectIntl, intlShape, isRtl, getLocale,
} from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';

import { GetCourseExitNavigation } from '../../course-exit';

import UnitNavigationEffortEstimate from './UnitNavigationEffortEstimate';
import { useSequenceNavigationMetadata } from './hooks';
import messages from './messages';

const UnitNavigation = ({
  intl,
  sequenceId,
  unitId,
  onClickPrevious,
  onClickNext,
  goToCourseExitPage,
}) => {
  const {
    isFirstUnit, isLastUnit, isSequenceFirstUnit, isSequenceLastUnit,
  } = useSequenceNavigationMetadata(sequenceId, unitId);
  const { courseId } = useSelector(state => state.courseware);

  const renderNextButton = () => {
    const { exitActive, exitText } = GetCourseExitNavigation(courseId, intl);
    const buttonOnClick = isLastUnit ? goToCourseExitPage : onClickNext;
    const buttonText = (isLastUnit && exitText) ? exitText : intl.formatMessage(messages.nextButton);
    const disabled = (isLastUnit && !exitActive) || isSequenceLastUnit;
    const nextArrow = isRtl(getLocale()) ? faChevronLeft : faChevronRight;
    return (
      <Button
        variant="outline-primary"
        className="next-button d-flex align-items-center justify-content-center"
        onClick={buttonOnClick}
        disabled={disabled}
      >
        <UnitNavigationEffortEstimate sequenceId={sequenceId} unitId={unitId}>
          {buttonText}
        </UnitNavigationEffortEstimate>
        <FontAwesomeIcon icon={nextArrow} className="ml-2" size="sm" />
      </Button>
    );
  };

  const prevArrow = isRtl(getLocale()) ? faChevronRight : faChevronLeft;
  return (
    <div>
      {isSequenceLastUnit && <p className="text-center mb-3 alert alert-primary" role="alert">You&apos;ve reached the end of this exam.</p>}
      <div className="unit-navigation d-flex">
        <Button
          variant="outline-secondary"
          className="previous-button mr-2 d-flex align-items-center justify-content-center"
          disabled={isFirstUnit || isSequenceFirstUnit}
          onClick={onClickPrevious}
        >
          <FontAwesomeIcon icon={prevArrow} className="mr-2" size="sm" />
          {intl.formatMessage(messages.previousButton)}
        </Button>
        {renderNextButton()}
      </div>
    </div>
  );
};

UnitNavigation.propTypes = {
  intl: intlShape.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  onClickPrevious: PropTypes.func.isRequired,
  onClickNext: PropTypes.func.isRequired,
  goToCourseExitPage: PropTypes.func.isRequired,
};

UnitNavigation.defaultProps = {
  unitId: null,
};

export default injectIntl(UnitNavigation);
