document.addEventListener('DOMContentLoaded', () => {

    const toggleMain = document.getElementById('toggleMain');
    const toggleRedirect = document.getElementById('toggleRedirect');

    const mainStatus = document.getElementById('main-status');
    const redirectStatus = document.getElementById('redirect-status');

    const reloadHint = document.getElementById('reload-hint');

    function showReloadHint() {
        reloadHint.style.display = "block";
    }

    function setText(el, isOn, label) {
        el.innerText = `${label}: ${isOn ? "ON ✅" : "OFF ❌"}`;
        el.style.color = isOn ? "green" : "red";
    }

    // Load state
    chrome.storage.local.get(['isEnabled', 'redirectEnabled'], (res) => {
        const main = res.isEnabled ?? true;
        const redirect = res.redirectEnabled ?? true;

        toggleMain.checked = main;
        toggleRedirect.checked = redirect;

        setText(mainStatus, main, "Auto Open");
        setText(redirectStatus, redirect, "Redirect");
    });

    // Main switch
    toggleMain.addEventListener('change', () => {
        chrome.storage.local.set({ isEnabled: toggleMain.checked });
        setText(mainStatus, toggleMain.checked, "Auto Open");
        showReloadHint();
    });

    // Redirect switch
    toggleRedirect.addEventListener('change', () => {
        chrome.storage.local.set({ redirectEnabled: toggleRedirect.checked });
        setText(redirectStatus, toggleRedirect.checked, "Redirect");
        showReloadHint();
    });

});
