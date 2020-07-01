const pointsGroupEl = document.querySelector('#points-group');
const cpEl = document.querySelector('#channel-points');
const getCpBtn = document.querySelector('button#get-channel-points');
const startObserverBtn = document.querySelector('button#observe');
const disconnectBtn = document.querySelector('button#disconnect');

const setChannelPoints = points => {
  cpEl.innerText = `${points}`;
};

chrome.runtime.onMessage.addListener(request => {
  if (request.channelPoints) {
    setChannelPoints(request.channelPoints);
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  const [currentTab] = tabs;

  const getChannelPoints = () => {
    chrome.tabs.sendMessage(
      currentTab.id,
      { action: 'getChannelPoints' },
      response => {
        setChannelPoints(response.channelPoints);

        if (pointsGroupEl.classList.contains('hidden')) {
          pointsGroupEl.classList.remove('hidden');
        }
      }
    );
  };

  getCpBtn.onclick = () => getChannelPoints();

  startObserverBtn.onclick = () => {
    chrome.tabs.sendMessage(currentTab.id, { action: 'startObserver' });
  };

  disconnectBtn.onclick = () => {
    chrome.tabs.sendMessage(currentTab.id, { action: 'disconnectObserver' });
  };
});

// TODO: get channel points on page action click
