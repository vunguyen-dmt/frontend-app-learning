import {
  getConfig,
} from '@edx/frontend-platform';
import React, { useEffect, useState } from 'react';
import './exam-helper.scss';
import { Alert } from '@openedx/paragon';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

const ExamHelper = ({
  intl,
}) => {
  const [examStatResponse, setExamStatResponse] = useState({});
  const updateExamStats = () => {
    const iframe = document.getElementById('unit-iframe');
    if (iframe != null) {
      iframe.contentWindow.postMessage({
        action: 'get_stats',
        payload: {
          id: +new Date(),
        },
      }, `${getConfig().LMS_BASE_URL}`);
    }
  };

  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (event.origin === `${getConfig().LMS_BASE_URL}`) {
        const { action, payload } = event.data;
        if (action === 'gaEmitExamStats') {
          setExamStatResponse(payload);
        }
      }
    });

    const id = setInterval(() => {
      updateExamStats();
    }, 500);

    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <>
      {
        examStatResponse.total > 0
        && (
        <div>
          <div className="exam-helper-wrapper">
            <Alert
              variant="info"
              dismissible={false}
              stacked
              className="mb-6"
            >
              <Alert.Heading><FormattedMessage id="exam-helper.title" defaultMessage="Statistics for this page" /></Alert.Heading>
              <div><FormattedMessage id="exam-helper.applyToMultipleChoiceOnly" defaultMessage="(Applies to multiple choice problems only)" /></div>
              <div className="stats">
                <div><FormattedMessage id="exam-helper.total" defaultMessage="Total number of problems on this page" />: {examStatResponse.total}</div>
                <div><FormattedMessage
                  id="exam-helper.submitted"
                  defaultMessage="Number of submitted problems on this page"
                />: <span className={examStatResponse.total > examStatResponse.submitted ? 'risk-text' : 'safe-text'}>{examStatResponse.submitted}</span>
                </div>
                <div><FormattedMessage
                  id="exam-helper.unsubmitted"
                  defaultMessage="Number of unsubmitted problems on this page"
                />: <span className={examStatResponse.unsubmitted > 0 ? 'risk-text' : 'safe-text'}>{examStatResponse.unsubmitted}</span>
                </div>
                <div><FormattedMessage
                  id="exam-helper.unanswered"
                  defaultMessage="Number of unanswered problems on this page"
                />: <span className={examStatResponse.unanswered > 0 ? 'risk-text' : 'safe-text'}>{examStatResponse.unanswered}</span>
                </div>
                {examStatResponse.total > examStatResponse.submitted && (
                <div className="risk-text"><FormattedMessage
                  id="exam-helper.notYetSubmittedAll"
                  defaultMessage="You have not submitted answers to all the problems on this page"
                />.
                </div>
                )}
                {examStatResponse.total === examStatResponse.submitted && (
                <div className="safe-text"><FormattedMessage
                  id="exam-helper.submittedAll"
                  defaultMessage="You have submitted answers to all the problems on this page"
                />.
                </div>
                )}
              </div>

              <div className="hb" />
              <div className="font-weight-bold"><FormattedMessage id="exam-helper.noteTitle" defaultMessage="Note" />
              </div>
              <p><FormattedMessage
                id="exam-helper.noteMessage"
                defaultMessage="An exam can have more than one page, the above statistics only apply to this page,
                please check carefully to make sure you have submitted answers to all problems,
                unsubmitted problems (including problems with answers selected but not submitted or
                problems saved but not submitted) will not be scored"
              />.
              </p>
            </Alert>
          </div>
        </div>
        )
    }
    </>
  );
};

ExamHelper.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(ExamHelper);
