// set alarm to do an API call every minute
browser.alarms.create("check", {periodInMinutes: 1});
browser.alarms.onAlarm.addListener(() => {
    check();
});

// listen for messages from other components
browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.do === "check") {
      try {
        const result = await check();
        sendResponse(result);
      } catch (error) {
        console.error("Error in check():", error);
      }
    }
  });
  

// checks reviews/lessons and updates badge
async function check() {
    browser.storage.sync.get(["WKapikey","notifyWKlessons", "vacationModeActive"]).then((result) => {
        var WKToken = result.WKapikey;
        var lessonsenabled = result.notifyWKlessons;
        var onvacation = result.vacationModeActive;

        function apiEndpoint(path, token) {
            let requestHeaders =
                new Headers({
                'Wanikani-Revision': '20170710',
                Authorization: 'Bearer ' + token,
                });
            let request =
                new Request('https://api.wanikani.com/v2/' + path, {
                method: 'GET',
                headers: requestHeaders
                });
            return request;
        } 

        if (typeof WKToken === "undefined") {
            browser.action.setBadgeText({text: ''}); 
        } else if (onvacation) {
            browser.action.setIcon({path: {16: 'images/icon_16_grayscale.png', 32: 'images/icon_32_grayscale.png'}});
            browser.action.setBadgeText({text: 'REST'});
            browser.action.setBadgeBackgroundColor({color: '#d4d4d4'});
        } else {
            browser.action.setIcon({path: {16: 'images/icon_16.png', 32: 'images/icon_32.png'}});
            fetch(apiEndpoint('assignments?immediately_available_for_review', WKToken))
                .then(response => response.json())
                .then(responseBody => {

                    if(responseBody.total_count > 0) {
                        browser.action.setBadgeText({text: String(responseBody.total_count)});
                        browser.action.setBadgeBackgroundColor({color: '#00aaff'});

                    } else if(lessonsenabled) {
                        fetch(apiEndpoint('assignments?immediately_available_for_lessons', WKToken))
                            .then(response => response.json())
                            .then(responseBody => {
                                if(responseBody.total_count > 0) {
                                    browser.action.setBadgeText({text: String(responseBody.total_count)});
                                    browser.action.setBadgeBackgroundColor({color: '#f100a1'});
                                } else {
                                    browser.action.setBadgeText({text: ''});
                                }
                            })

                    } else {
                        browser.action.setBadgeText({text: ''});
                    }
                })
        }
    }).catch((error) => {
        console.error("Error retrieving data from storage:", error);
    });
}