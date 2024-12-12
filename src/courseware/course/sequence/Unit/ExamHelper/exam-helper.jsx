import {
  getConfig,
} from '@edx/frontend-platform';
import React, { useEffect, useState } from 'react';
import './exam-helper.scss';
import {
  Alert, Button, ModalDialog, ActionRow, useToggle, Spinner, Toast,
} from '@openedx/paragon';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';

const ExamHelper = ({
  intl,
}) => {
  const [examStatResponse, setExamStatResponse] = useState({});
  // eslint-disable-next-line max-len
  const [submittingAllAnswersText, setSubmittingAllAnswersText] = useState(intl.formatMessage(messages.yesSubmitAllSubmittableAnswers));
  const [submittingAllAnswers, setSubmittingAllAnswers] = useState(false);
  const [isSubmitAllAnswersModalOpen, openSubmitAllAnswersModal, closeSubmitAllAnswersModal] = useToggle(false);
  const [showSubmitAllAnswerFinishMessage, setShowSubmitAllAnswerFinishMessage] = useState(false);

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

  const submitAllUnsubmittedAnswers = () => {
    const iframe = document.getElementById('unit-iframe');
    if (iframe != null) {
      setSubmittingAllAnswers(true);
      setSubmittingAllAnswersText(intl.formatMessage(messages.submitting));
      iframe.contentWindow.postMessage({
        action: 'submit_all_unsubmitted',
        payload: {
          id: +new Date(),
        },
      }, `${getConfig().LMS_BASE_URL}`);
    }
  };

  const checkAllUnsubmittedAnswerSubmitted = () => {
    if (submittingAllAnswers && examStatResponse.submitting === 0
      && examStatResponse.selectedButUnsubmitted === 0) {
      setShowSubmitAllAnswerFinishMessage(true);
      setSubmittingAllAnswersText(intl.formatMessage(messages.yesSubmitAllSubmittableAnswers));
      setSubmittingAllAnswers(false);
      if (isSubmitAllAnswersModalOpen) {
        closeSubmitAllAnswersModal();
      }
    }

    // resubmit if there are failed requests.
    if (submittingAllAnswers && examStatResponse.submitting === 0
       && examStatResponse.selectedButUnsubmitted > 0) {
      submitAllUnsubmittedAnswers();
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

  useEffect(() => {
    checkAllUnsubmittedAnswerSubmitted();
  }, [submittingAllAnswers, examStatResponse]);

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
              <ul className="stats">
                <li><FormattedMessage id="exam-helper.total" defaultMessage="Total number of problems on this page" />: {examStatResponse.total}</li>
                <li><FormattedMessage
                  id="exam-helper.submitted"
                  defaultMessage="Number of submitted problems on this page"
                />: <span className={examStatResponse.total > examStatResponse.submitted ? 'risk-text' : 'safe-text'}>{examStatResponse.submitted}</span>
                </li>
                <li><FormattedMessage
                  id="exam-helper.selectedButUnsubmitted"
                  defaultMessage="Number of answered but unsubmitted problems on this page"
                />: <span className={examStatResponse.selectedButUnsubmitted > 0 ? 'risk-text' : 'safe-text'}>{examStatResponse.selectedButUnsubmitted}</span>
                  { examStatResponse.selectedButUnsubmitted > 0 && <Button className="submit-unsubmitted-btn" variant="primary" size="sm" onClick={openSubmitAllAnswersModal}>{intl.formatMessage(messages.submitAllSubmittableAnswers)}</Button> }
                </li>
                <li><FormattedMessage
                  id="exam-helper.unsubmitted"
                  defaultMessage="Number of unsubmitted problems on this page"
                />: <span className={examStatResponse.unsubmitted > 0 ? 'risk-text' : 'safe-text'}>{examStatResponse.unsubmitted}</span>
                </li>
                {examStatResponse.total > examStatResponse.submitted && (
                <div className="risk-text"><FormattedMessage
                  id="exam-helper.notYetSubmittedAll"
                  defaultMessage="You have not submitted answers to all problems on this page"
                />.
                </div>
                )}
                {examStatResponse.total === examStatResponse.submitted && examStatResponse.submitting === 0 && (
                <div className="safe-text"><FormattedMessage
                  id="exam-helper.submittedAll"
                  defaultMessage="You have submitted answers to all problems on this page"
                />.
                </div>
                )}
                {examStatResponse.submitting > 0 && (
                <div className="warning-text"><FormattedMessage
                  id="exam-helper.thereAreProblemsBeingSubmitted"
                  defaultMessage="There are problems being submitted"
                />.
                </div>
                )}
              </ul>
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
            <Toast
              onClose={() => setShowSubmitAllAnswerFinishMessage(false)}
              show={showSubmitAllAnswerFinishMessage}
            >
              {intl.formatMessage(messages.allSubmittableAnswersSubmitted)}.
            </Toast>
            <ModalDialog
              title={intl.formatMessage(messages.submitAllSubmittableAnswersTitle)}
              isOpen={isSubmitAllAnswersModalOpen}
              onClose={closeSubmitAllAnswersModal}
              size="lg"
              variant="default"
              hasCloseButton
              isFullscreenOnMobile
            >
              <ModalDialog.Header>
                <ModalDialog.Title>
                  {intl.formatMessage(messages.submitAllSubmittableAnswersTitle)}
                </ModalDialog.Title>
              </ModalDialog.Header>

              <ModalDialog.Body>
                <p>{intl.formatMessage(messages.submitAllSubmittableAnswersMessage)}</p>
              </ModalDialog.Body>
              <ModalDialog.Footer>
                <ActionRow>
                  <ModalDialog.CloseButton variant="tertiary">
                    {intl.formatMessage(messages.noCloseModal)}
                  </ModalDialog.CloseButton>
                  <Button variant="primary" onClick={submitAllUnsubmittedAnswers} disabled={submittingAllAnswers}>
                    {submittingAllAnswersText}
                    {
                      submittingAllAnswers && <Spinner animation="border" variant="light" className="ml-3" screenReaderText="loading" />
                    }
                  </Button>
                </ActionRow>
              </ModalDialog.Footer>
            </ModalDialog>
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
