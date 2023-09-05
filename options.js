// Saves options to browser.storage
function save_options() {
    let usertoken = document.getElementById('apikey').value;
    let notifylessons = document.getElementById('notifylessons').checked;
    let onvacation = document.getElementById('vacationmode').checked;

    browser.storage.sync.set({"notifyWKlessons": notifylessons});
    browser.storage.sync.set({"vacationModeActive": onvacation});

    if(usertoken.length > 0) {
        browser.storage.sync.set({"WKapikey": usertoken});
    }

    let alert = document.getElementById('alert');
    alert.innerHTML = 'All saved! - Ready to go';
    setTimeout(function() {window.close();}, 2000);

    browser.runtime.sendMessage({do: "check"});
}

function clear_options() {
    browser.storage.sync.remove("WKapikey");
    document.getElementById('apikey').value = "";

    browser.storage.sync.remove("notifyWKlessons");
    document.getElementById('notifylessons').checked = false;

    browser.storage.sync.remove("vacationModeActive");
    document.getElementById('vacationmode').checked = false;

    let alert = document.getElementById('alert');
    alert.innerHTML = 'All cleared! - Now add your API token';

    browser.runtime.sendMessage({do: "check"});
}

document.getElementById('save').addEventListener('click', save_options);
document.getElementById('clear').addEventListener('click', clear_options);


// Retrieve options from browser.storage
function load_options() {
    browser.storage.sync.get(["notifyWKlessons", "WKapikey", "vacationModeActive"]).then((result) => {
        if (result.WKapikey != undefined) {
            document.getElementById('apikey').value = result.WKapikey;
        }
        
        // set to false if nothing in storage
        if (typeof result.notifyWKlessons === "undefined") {
            browser.storage.sync.set({"notifyWKlessons": false});
        }
        if (typeof result.vacationModeActive === "undefined") {
            browser.storage.sync.set({"vacationModeActive": false});
        }

        document.getElementById('notifylessons').checked = result.notifyWKlessons;
        document.getElementById('vacationmode').checked = result.vacationModeActive;
    }).catch((error) => {
        console.error("Error retrieving data from storage:", error);
    });
}

load_options();
browser.runtime.sendMessage({do: "check"});