// Check and store API token
browser.storage.sync.get(["WKapikey", "vacationModeActive"]).then((result) => {
  var WKToken = result.WKapikey;
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
    browser.runtime.openOptionsPage();

  } else { // API Token is found in storage
    if(!onvacation) {
      // fetch lessons count
      fetch(apiEndpoint('assignments?immediately_available_for_lessons', WKToken))
          .then(response => response.json())
          .then(responseBody => {
              let lessonItemsCount = responseBody.total_count;

              if(lessonItemsCount > 0) {
                document.getElementById("lesson-items").innerHTML = lessonItemsCount;
                document.getElementById("lesson-image").style.backgroundColor = "#f100a1";
              }
          })

      // fetch reviews count
      fetch(apiEndpoint('assignments?immediately_available_for_review', WKToken))
          .then(response => response.json())
          .then(responseBody => {
              let reviewItemsCount = responseBody.total_count;

              if(reviewItemsCount > 0) {
                document.getElementById("review-items").innerHTML = reviewItemsCount;
                document.getElementById("review-image").style.backgroundColor = "#00aaff";
              }
          })
    }

    // fetch username and level
    fetch(apiEndpoint('user', WKToken))
        .then(response => response.json())
        .then(responseBody => {
            let username = responseBody.data.username;
            let level = responseBody.data.level;

            if(onvacation) {
              document.getElementById("username").innerHTML = username + " - currently on vacation" + '<span id="options">Settings</span>';
            } else {
              document.getElementById("username").innerHTML = username + " - level " + level + '<span id="options">Settings</span>';
            }
        })
        .then(() => document.getElementById("options").addEventListener('click', function() {
            browser.runtime.openOptionsPage();
          }))
    }
}).catch((error) => {
  console.error("Error retrieving data from storage:", error);
});

// Operate options button with failed fetch
document.getElementById("options").addEventListener('click', function() {
  browser.runtime.openOptionsPage();
})

// updates badge when opening the pop-up
browser.runtime.sendMessage({do: "check"});