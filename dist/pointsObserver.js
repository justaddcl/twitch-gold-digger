const twitchStyle = 'background: #9146ff; color: #f0f0ff; padding: 16px;';
const twitchStyleReverse =
  'background: #f0f0ff; color: #9146ff; padding: 16px;';

const getTimeStamp = () => {
  const now = new Date(Date.now());
  return `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
};

// listen for document ready since run_at: document_idle isn't working
document.onreadystatechange = () => {
  const cpEl = document.querySelector(
    '.tw-tooltip.tw-tooltip--align-center.tw-tooltip--right'
  );

  let channelPoints = '';

  const getChannelPoints = () => {
    [channelPoints] = cpEl.innerText.split(' ');
    return channelPoints;
  };

  // set up observer to see when reward is claimable
  const chatInputButtonsEl = '.chat-input__buttons-container';
  // const rewardButtonEl = 'button.tw-button.tw-button--success.tw-interactive';
  // target node for the MutationObserver
  const targetEl = document.querySelector(chatInputButtonsEl).firstChild;
  const observerOptions = {
    childList: true,
    subtree: true,
  };

  const updateChannelPoints = () => {
    chrome.runtime.sendMessage({ channelPoints: getChannelPoints() });
  };

  // const logChannelPoints = (oldValue, updatedValue) => {
  //   if (updatedValue > oldValue) {
  //     console.log(
  //       `%cChannel points inceased: ${oldValue} -> ${updatedValue}`,
  //       'background: #9146ff; color: #f0f0ff; padding: 24px;'
  //     );
  //   }
  // };

  const callback = (mutationList, observer) => {
    const oldValue = channelPoints;
    console.log('mutation list:');
    console.log(mutationList);

    const claimButton = document.querySelector(
      '.tw-button.tw-button--success.tw-interactive'
    );
    if (claimButton) {
      // TODO: remove following log if no longer needed
      // console.log(`%c${getTimeStamp()} - Bonus is now available`, twitchStyle);
      claimButton.click();
      // TODO: add chat / log message
      // TODO: add estimated time until next bonus
      console.log(
        `%c${getTimeStamp()} - Channel point bonus has been claimed`,
        twitchStyleReverse
      );
    }
    const updatedValue = getChannelPoints();
    if (updatedValue > oldValue) {
      // TODO: add chat message for when channel points change
      // TODO: add time stamp for message
      console.log(
        `%c ${getTimeStamp()} - Received channel points!`,
        twitchStyleReverse
      );
      console.log(
        `%cChannel points inceased: ${oldValue} -> ${updatedValue}`,
        twitchStyle
      );
      // TODO: update / log only if channel points changed (not on every mutation)
      updateChannelPoints();
    }
  };

  const channelPointsObserver = new MutationObserver(callback);

  const observe = () => {
    channelPointsObserver.observe(targetEl, observerOptions);
    console.log(`%cTwitch Gold Digger observer started`, twitchStyle);
  };

  const setStatus = status => {
    sessionStorage.setItem('twitchGoldDiggerIsActive', status);
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getChannelPoints') {
      sendResponse({ channelPoints: getChannelPoints() });
    }

    if (request.action === 'getStatus') {
      const status =
        sessionStorage.getItem('twitchGoldDiggerIsActive') === 'true';
      sendResponse({ status });
    }

    if (request.action === 'setStatus') {
      setStatus(request.status);
    }

    if (request.action === 'startObserver') {
      observe();
      setStatus(true);
    }

    if (request.action === 'disconnectObserver') {
      channelPointsObserver.disconnect();
      setStatus(false);
      console.log(`%cTwitch Gold Digger observer disconnected`, twitchStyle);
    }
  });
};
