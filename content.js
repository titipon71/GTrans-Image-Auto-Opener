// ===================
// TargetLock Stable v2 + Redirect Switch
// ===================

let isEnabled = true;
let redirectEnabled = true;
let lastOpenedUrl = "";
let lastOpenTime = 0;

// ---- Log ----
function log(msg, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const prefix = `[TargetLock ${time}]`;
    if (type === 'success') console.log(`%c${prefix} ✅ ${msg}`, 'color: green; font-weight: bold;');
    else console.log(`${prefix} ${msg}`);
}

// ---- Load State ----
chrome.storage.local.get(['isEnabled', 'redirectEnabled'], (res) => {
    if (res.isEnabled !== undefined) isEnabled = res.isEnabled;
    if (res.redirectEnabled !== undefined) redirectEnabled = res.redirectEnabled;
    log(`Ready | Main: ${isEnabled ? 'ON' : 'OFF'} | Redirect: ${redirectEnabled ? 'ON' : 'OFF'}`);
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.isEnabled) isEnabled = changes.isEnabled.newValue;
    if (changes.redirectEnabled) redirectEnabled = changes.redirectEnabled.newValue;
});

// ---- Core Logic ----
function findAndOpenBlob() {
    if (!isEnabled) return;

    const images = document.images;
    let bestImg = null;
    let bestScore = 0;

    for (const img of images) {
        const src = img.src || "";
        if (!src.startsWith("blob:")) continue;
        if (src === lastOpenedUrl) continue;
        if (!img.complete) continue;

        const w = img.naturalWidth || 0;
        const h = img.naturalHeight || 0;
        if (w < 300 || h < 300) continue;

        const score = w * h;
        if (score > bestScore) {
            bestScore = score;
            bestImg = img;
        }
    }

    if (!bestImg) return;

    const now = Date.now();
    if (now - lastOpenTime < 2000) return;

    lastOpenedUrl = bestImg.src;
    lastOpenTime = now;

    log(`OPEN ${bestImg.naturalWidth}x${bestImg.naturalHeight}`, 'success');

    // เปิดแท็บใหม่
    const a = document.createElement('a');
    a.href = bestImg.src;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();

    // redirect เฉพาะเมื่อเปิดสวิตช์
    if (redirectEnabled) {
        setTimeout(() => {
            location.href = "https://translate.google.co.th/?sl=auto&tl=th&op=images";
        }, 500);
    }
}

// ---- Observer ----
const observer = new MutationObserver(findAndOpenBlob);
observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true
});
