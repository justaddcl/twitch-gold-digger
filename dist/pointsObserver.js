const twitchStyle = 'background: #6441a4; color: white; padding: 16px;';

// listen for document ready since run_at: document_idle isn't working
document.onreadystatechange = () => {
  const cpEl = document.querySelector(
    '.tw-tooltip.tw-tooltip--align-center.tw-tooltip--right'
  );
  const initialChannelPoints = cpEl.innerText.split(' ')[0];

  // set up observer to see when reward is claimable
  const chatInputButtonsEl = '.chat-input__buttons-container';
  // const rewardButtonEl = 'button.tw-button.tw-button--success.tw-interactive';
  // target node for the MutationObserver
  const targetEl = document.querySelector(chatInputButtonsEl).firstChild;
  const observerOptions = {
    childList: true,
    subtree: true,
  };

  const logCp = points => {
    console.log('channel points mutation observed');
    console.log(
      `%c${points} channel points`,
      'background: #bad; color: #000; padding: 24px;'
    );
  };

  const callback = (mutationList, observer) => {
    console.log(mutationList);
    logCp(cpEl.innerText.split(' ')[0]);
  };

  const channelPointsObserver = new MutationObserver(callback);

  const observe = () => {
    channelPointsObserver.observe(targetEl, observerOptions);
    console.log(`%cTwitch Gold Digger observer started`, twitchStyle);
  };

  // chrome.runtime.sendMessage({ channelPoints: initialChannelPoints });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getChannelPoints') {
      sendResponse({ channelPoints: cpEl.innerText.split(' ')[0] });
    }

    if (request.action === 'startObserver') {
      observe();
    }

    if (request.action === 'disconnectObserver') {
      channelPointsObserver.disconnect();
      console.log(`%cTwitch Gold Digger observer disconnected`, twitchStyle);
    }
  });
};
