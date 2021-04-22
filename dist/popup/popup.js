const pointsGroupEl = document.querySelector('#points__group');
const cpEl = document.querySelector('#channel-points');
const pointsStatusEl = document.querySelector('#points__status');
const observerToggle = document.querySelector('input#observer-toggle');

const setChannelPointsText = points => {
  pointsStatusEl.innerText = '';
  cpEl.innerText = `${points}`;
};

chrome.runtime.onMessage.addListener(request => {
  if (request.channelPoints) {
    console.log(`channel points received! ${request.channelPoint}`);
    setChannelPointsText(request.channelPoints);
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  const [currentTab] = tabs;

  // TODO: disconnect observer if page is refreshed or goes to a different URL
  // TODO: handle raids / hosts / offline

  const setStatus = status => {
    chrome.tabs.sendMessage(currentTab.id, { action: 'setStatus', status });
  };

  const setToggle = () => {
    chrome.tabs.sendMessage(
      currentTab.id,
      { action: 'getStatus' },
      response => {
        observerToggle.checked = response.status;

        if (response.status) {
          document.querySelector('body').classList.add('active');
        } else if (
          document.querySelector('body').classList.contains('active')
        ) {
          document.querySelector('body').classList.remove('active');
        }
      }
    );
  };

  const getChannelPoints = () => {
    pointsStatusEl.innerText = 'Fetching channel points...';
    chrome.tabs.sendMessage(
      currentTab.id,
      { action: 'getChannelPoints' },
      response => {
        setChannelPointsText(response.channelPoints);

        if (pointsGroupEl.classList.contains('hidden')) {
          pointsGroupEl.classList.remove('hidden');
        }
      }
    );
  };

  observerToggle.addEventListener('click', () => {
    if (observerToggle.checked) {
      chrome.tabs.sendMessage(currentTab.id, { action: 'startObserver' });
    } else {
      chrome.tabs.sendMessage(currentTab.id, { action: 'disconnectObserver' });
    }
    setToggle();
  });

  const init = () => {
    setToggle();
    // getChannelPoints();
    // TODO: set initial point value
  };

  init();
});
