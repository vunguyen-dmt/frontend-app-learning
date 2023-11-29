import React from 'react';
import PropTypes from 'prop-types';
import { breakpoints, Button, useWindowSize } from '@edx/paragon';
import { ChevronLeft, ChevronRight } from '@edx/paragon/icons';
import classNames from 'classnames';
import {
  injectIntl,
  intlShape,
  isRtl,
  getLocale,
} from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import { GetCourseExitNavigation } from '../../course-exit';
import UnitButton from './UnitButton';
import SequenceNavigationTabs from './SequenceNavigationTabs';
import { useSequenceNavigationMetadata } from './hooks';
import { useModel } from '../../../../generic/model-store';
import { LOADED } from '../../../data/slice';

import messages from './messages';

const SequenceNavigation = ({
  intl,
  unitId,
  sequenceId,
  className,
  onNavigate,
  nextSequenceHandler,
  previousSequenceHandler,
  goToCourseExitPage,
}) => {
  const sequence = useModel('sequences', sequenceId);
  const { isFirstUnit, isLastUnit, isSequenceFirstUnit, isSequenceLastUnit } = useSequenceNavigationMetadata(sequenceId, unitId);
  const {
    courseId,
    sequenceStatus,
  } = useSelector(state => state.courseware);
  const isLocked = sequenceStatus === LOADED ? (
    sequence.gatedContent !== undefined && sequence.gatedContent.gated
  ) : undefined;

  const shouldDisplayNotificationTriggerInSequence = useWindowSize().width < breakpoints.small.minWidth;

  const renderUnitButtons = () => {
    if (isLocked) {
      return (
        <UnitButton unitId={unitId} title="" contentType="lock" isActive onClick={() => {}} />
      );
    }
    if (sequence.unitIds.length === 0 || unitId === null) {
      return (
        <div style={{ flexBasis: '100%', minWidth: 0, borderBottom: 'solid 1px #EAEAEA' }} />
      );
    }
    return (
      <SequenceNavigationTabs
        unitIds={sequence.unitIds}
        unitId={unitId}
        showCompletion={sequence.showCompletion}
        onNavigate={onNavigate}
      />
    );
  };

  const renderNextButton = () => {
    const { exitActive, exitText } = GetCourseExitNavigation(courseId, intl);
    const buttonOnClick = isLastUnit ? goToCourseExitPage : nextSequenceHandler;
    const buttonText = (isLastUnit && exitText) ? exitText : intl.formatMessage(messages.nextButton);
    const disabled = (isLastUnit && !exitActive) || isSequenceLastUnit;
    const nextArrow = isRtl(getLocale()) ? ChevronLeft : ChevronRight;

    return (
      <Button variant="link" className="next-btn" onClick={buttonOnClick} disabled={disabled} iconAfter={nextArrow}>
        {shouldDisplayNotificationTriggerInSequence ? null : buttonText}
      </Button>
    );
  };

  const prevArrow = isRtl(getLocale()) ? ChevronRight : ChevronLeft;

  return sequenceStatus === LOADED && (
    <div>
      <nav id="courseware-sequenceNavigation" className={classNames('sequence-navigation', className)} style={{ width: shouldDisplayNotificationTriggerInSequence ? '90%' : null }}>
        <Button variant="link" className="previous-btn" onClick={previousSequenceHandler} disabled={isFirstUnit || isSequenceFirstUnit} iconBefore={prevArrow}>
          {shouldDisplayNotificationTriggerInSequence ? null : intl.formatMessage(messages.previousButton)}
        </Button>
        {renderUnitButtons()}
        {renderNextButton()}
      </nav>
      {isSequenceFirstUnit && <p className="unit-container ml-auto mr-auto  text-center mb-3 alert alert-primary" role="alert">This is the start of the exam. This exam might contain many units keep on going until you see a message indicating that you have reached the end of the exam.</p>}
    </div>

  );
};

SequenceNavigation.propTypes = {
  intl: intlShape.isRequired,
  sequenceId: PropTypes.string.isRequired,
  unitId: PropTypes.string,
  className: PropTypes.string,
  onNavigate: PropTypes.func.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  goToCourseExitPage: PropTypes.func.isRequired,
};

SequenceNavigation.defaultProps = {
  className: null,
  unitId: null,
};

export default injectIntl(SequenceNavigation);
