const appContainer = document.getElementById('app-container');
const viewUpload = document.getElementById('view-upload');
const viewProcessing = document.getElementById('view-processing');
const viewEditor = document.getElementById('view-editor');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const videoElement = document.getElementById('editor-video');
const captionOverlay = document.getElementById('current-caption');
const captionContainer = document.getElementById('caption-overlay');

let currentFile = null;

// --- Upload Handler ---

function uploadVideo() {
    if (!isLoggedIn) {
        showAuthModal('signup');
        return;
    }
    document.getElementById('video-upload').click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        currentFile = file;
        const fileURL = URL.createObjectURL(file);
        videoElement.src = fileURL;
        startProcessing();
    }
}

// Drag and Drop
const dropZone = document.getElementById('drop-zone');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-neon-cyan', 'bg-gray-800/80');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-neon-cyan', 'bg-gray-800/80');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-neon-cyan', 'bg-gray-800/80');

    if (!isLoggedIn) {
        showAuthModal('signup');
        return;
    }

    if (e.dataTransfer.files.length) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('video/')) {
            currentFile = file;
            const fileURL = URL.createObjectURL(file);
            videoElement.src = fileURL;
            startProcessing();
        } else {
            alert('Please upload a valid video file.');
        }
    }
});

// --- Processing Simulation ---

function startProcessing() {
    // Switch View
    viewUpload.classList.add('hidden');
    viewProcessing.classList.remove('hidden');

    // Simulate AI Processing
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress > 100) progress = 100;

        progressBar.style.width = `${progress}%`;

        const lang = document.getElementById('language-select').value;
        const langText = (lang === 'sinhala') ? "Sinhala" : "Language";

        if (progress < 30) {
            progressText.innerText = 'Uploading video...';
        } else if (progress < 60) {
            progressText.innerText = 'Extracting audio...';
        } else if (progress < 90) {
            progressText.innerText = `AI detecting ${langText} speech patterns...`;
        } else {
            progressText.innerText = 'Finalizing design...';
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                showEditor();
            }, 500);
        }
    }, 150); // Speed of simulation
}

function showEditor() {
    viewProcessing.classList.add('hidden');
    viewEditor.classList.remove('hidden');
    viewEditor.classList.add('flex'); // Add flex back since hidden removed it? No, hidden removes display.

    // Auto play video
    videoElement.play();

    // Auto play video
    videoElement.play();
    // Render Timeline
    renderTimeline();

    // Init Draggable
    initDraggable(); // NEW

    // Simulate captions changing
    // simulateCaptions();

    // Start Playhead Animation
    startPlayheadAnimation();
}

function renderTimeline() {
    const track = document.getElementById('track-captions');
    track.innerHTML = '';

    // Create random blocks for demo
    const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];

    for (let i = 0; i < 8; i++) {
        const block = document.createElement('div');
        block.className = `absolute h-8 rounded text-[10px] text-white overflow-hidden whitespace-nowrap px-1 flex items-center shadow-lg border border-white/20 ${colors[i % colors.length]}`;
        const width = 60 + Math.random() * 100;
        const left = i * 180 + Math.random() * 20;

        block.style.width = `${width}px`;
        block.style.left = `${left}px`;
        block.style.top = '4px'; // Center vertically in h-10 (40px)
        block.innerText = "Caption Segment " + (i + 1);

        track.appendChild(block);

        // Make clip draggable on timeline
        makeClipDraggable(block);
    }
}

// --- Clip Interaction Logic ---
function makeClipDraggable(clip) {
    let isDragging = false;
    let startX;
    let originalLeft;

    clip.style.position = 'absolute';
    clip.style.cursor = 'grab';

    clip.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // Prevent seeking
        isDragging = true;
        startX = e.clientX;
        originalLeft = parseFloat(clip.style.left) || 0;
        clip.style.cursor = 'grabbing';

        // Highlight corresponding text on video?
        // In a real app, this would select the data model.
    });

    // Double click to edit text
    clip.ondblclick = function (e) {
        e.stopPropagation(); // prevent seek
        const input = prompt("Edit Caption:", clip.innerText);
        if (input) {
            clip.innerText = input;
            // Here you would also update the data model and the video overlay if visible
        }
    };

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const newLeft = Math.max(0, originalLeft + dx);
        clip.style.left = `${newLeft}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            clip.style.cursor = 'grab';
        }
    });
}

// Timeline click to seek
const scrollArea = document.getElementById('timeline-scroll-area');
if (scrollArea) {
    scrollArea.addEventListener('click', (e) => {
        // Simple seek logic
        const rect = scrollArea.getBoundingClientRect();
        const clickX = e.clientX - rect.left + scrollArea.scrollLeft;
        const pxPerSec = 100;
        const time = clickX / pxPerSec;

        if (time >= 0 && time <= videoElement.duration) {
            videoElement.currentTime = time;
            updatePlayhead();
        }
    });
}

function startPlayheadAnimation() {
    setInterval(() => {
        if (!videoElement.paused) {
            updatePlayhead();
        }
    }, 50);
}


function updatePlayhead() {
    const playhead = document.getElementById('timeline-playhead');
    const scrollArea = document.getElementById('timeline-scroll-area');
    const pxPerSec = 100;
    const position = videoElement.currentTime * pxPerSec;

    playhead.style.left = `${position}px`;

    // Auto scroll logic (only if playing)
    if (!videoElement.paused && position > scrollArea.scrollLeft + scrollArea.clientWidth - 100) {
        scrollArea.scrollLeft = position - 100;
    }

    // Update Time Display
    document.getElementById('time-display').innerText = formatTime(videoElement.currentTime);

    // SYNC CAPTIONS FROM TIMELINE
    const currentTime = videoElement.currentTime;
    const tracks = document.querySelectorAll('#track-captions > div');
    let activeText = "";

    tracks.forEach(clip => {
        const left = parseFloat(clip.style.left) || 0;
        const width = parseFloat(clip.style.width) || 0;
        const startTime = left / 100; // pxPerSec = 100
        const endTime = startTime + (width / 100);

        if (currentTime >= startTime && currentTime <= endTime) {
            activeText = clip.innerText;
        }
    });

    const captionOverlay = document.getElementById('current-caption');
    if (activeText) {
        captionOverlay.innerText = activeText;
        captionOverlay.style.opacity = 1;
    } else {
        captionOverlay.innerText = "";
        captionOverlay.style.opacity = 0;
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
}

window.togglePlay = function () {
    if (videoElement.paused) {
        videoElement.play();
        updatePlayIcon(true);
    } else {
        videoElement.pause();
        updatePlayIcon(false);
    }
}

function updatePlayIcon(isPlaying) {
    const icon = document.getElementById('play-icon');
    const overlay = document.getElementById('play-overlay');

    if (isPlaying) {
        icon.setAttribute('data-lucide', 'pause'); // We need to create icons again or swap svg
        // Lucide doesn't auto-swap, so we manually swap innerHTML for speed or re-render
        // Simple manual SVG swap for performance:
        icon.innerHTML = '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>'; // pause icon path
        overlay.classList.add('opacity-0');
    } else {
        icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>'; // play icon path
        overlay.classList.remove('opacity-0');
    }
}

// --- Editor Logic ---
let captionInterval;
const demoCaptions = [
    "Welcome to Caption Net!",
    "This is an AI-generated caption.",
    "Look how perfectly synced it is.",
    "You can change the style instantly.",
    "Make your videos go viral!",
    "Try the Neon style on the right.",
    "It's fast, free, and professional."
];

const sinhalaCaptions = [
    "ආයුබෝවන් Caption Net වෙත සාදරයෙන් පිළිගනිමු!",
    "මේ AI තාක්ෂණයෙන් ස්වයංක්‍රීයව හැදුනු උපසිරැසි.",
    "බලන්න කොච්චර ලස්සනට සින්ක් වෙනවාද කියලා.",
    "ඔයාට කැමති විදිහට ෆොන්ට් ඩිසයින් වෙනස් කරන්න පුළුවන්.",
    "දැන් ඔයාගේ Videos ලේසියෙන්ම Viral කරන්න පුළුවන්.",
    "දකුණු පැත්තේ තියෙන Neon ස්ටයිල් එක ට්‍රයි කරලා බලන්න.",
    "මේක සම්පූර්ණයෙන්ම නොමිලේ ලැබෙන සේවාවක්."
];

function simulateCaptions() {
    let index = 0;
    const lang = document.getElementById('language-select').value;
    const captionsToUse = (lang === 'sinhala') ? sinhalaCaptions : demoCaptions;

    // Apply Sinhala font if needed
    if (lang === 'sinhala') {
        captionOverlay.style.fontFamily = '"Noto Sans Sinhala", sans-serif';
    }

    captionInterval = setInterval(() => {
        if (!videoElement.paused) {
            captionOverlay.innerText = captionsToUse[index % captionsToUse.length];
            document.getElementById('caption-input').value = captionsToUse[index % captionsToUse.length];
            index++;
        }
    }, 3000);
}

// --- Add Text / Drag Logic ---

let draggableElements = [];
let activeElement = null;

// Initial Setup
function initDraggable() {
    const overlay = document.getElementById('caption-overlay');
    // Ensure initial caption is draggable
    makeDraggable(overlay);
    draggableElements.push(overlay);

    // Select it by default
    selectElement(overlay);
}

window.addText = function () {
    const container = document.getElementById('video-container');

    // Create new text element
    const newText = document.createElement('div');
    newText.className = "absolute text-center px-4 py-2 rounded-lg text-2xl font-bold text-white bg-black/50 backdrop-blur-sm border-2 border-transparent shadow-lg cursor-move select-none";
    newText.style.top = "50%";
    newText.style.left = "50%";
    newText.style.transform = "translate(-50%, -50%)"; // Center initially
    newText.innerText = "New Text";
    newText.ondblclick = function () {
        const input = prompt("Edit Text:", this.innerText);
        if (input) {
            this.innerText = input;
            // Update any timeline clip if linked?
        }
    };

    // Add delete button? Or right click.

    container.appendChild(newText);
    draggableElements.push(newText);
    makeDraggable(newText);
    selectElement(newText);

    // Add to Timeline
    addClipToTimeline("New Text", "bg-green-500");
}

function addClipToTimeline(label, colorClass) {
    // Need to identify parent. For now, append to existing caption track for demo simplicity
    const existingTrack = document.getElementById('track-captions');

    const block = document.createElement('div');
    block.className = `absolute h-8 rounded text-[10px] text-white overflow-hidden whitespace-nowrap px-1 flex items-center shadow-lg border border-white/20 ${colorClass}`;
    block.style.width = '120px'; // default duration
    // Place at playhead
    const pxPerSec = 100;
    const leftPos = (videoElement.currentTime * pxPerSec);

    block.style.left = `${leftPos}px`;
    block.style.top = '4px';
    block.innerText = label;

    existingTrack.appendChild(block);
    makeClipDraggable(block);
}

function selectElement(el) {
    // Deselect others
    draggableElements.forEach(e => {
        e.classList.remove('border-neon-cyan');
        e.classList.add('border-transparent');
    });

    // Select current
    activeElement = el;
    el.classList.remove('border-transparent');
    el.classList.add('border-neon-cyan'); // Visual indicator

    // Update toolbar inputs to match this element's style?
    // For MVP, just track it so style buttons apply to activeElement.
}

function makeDraggable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    elmnt.onmousedown = dragMouseDown;
    // Add click listener to select
    elmnt.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling
        selectElement(elmnt);
    });

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;

        // Also select on drag start
        selectElement(elmnt);
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

        // Important: Remove transform if we are setting top/left manually to avoid conflict
        if (elmnt.style.transform) {
            elmnt.style.transform = 'none';
        }
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Override Styling to apply to ACTIVE element
window.updateSize = function (val) {
    if (activeElement) activeElement.style.fontSize = `${val}px`;
}

window.updateColor = function (color) {
    if (activeElement) {
        activeElement.style.color = color;
        activeElement.style.textShadow = `0 0 10px ${color}`;
    }
}
// Override Font
window.updateFont = function (fontName) {
    if (activeElement) {
        activeElement.style.fontFamily = `"${fontName}", sans-serif`;
    }
}

// Override Style Presets
window.applyStyle = function (styleName) {
    if (!activeElement) return;

    // Reset base
    activeElement.className = "absolute text-center px-4 py-2 rounded-lg text-2xl md:text-3xl font-bold transition-all duration-300 border-2 border-neon-cyan cursor-move select-none";
    activeElement.style.color = '';
    activeElement.style.textShadow = '';
    activeElement.style.backgroundColor = '';

    if (styleName === 'default') {
        activeElement.classList.add('text-white', 'bg-black/50');
    } else if (styleName === 'neon') {
        activeElement.classList.add('caption-style-neon');
    } else if (styleName === 'highlight') {
        activeElement.classList.add('caption-style-highlight');
    } else if (styleName === 'minimal') {
        activeElement.classList.add('caption-style-minimal');
    }
}

// --- Text Edit Logic ---
window.switchTab = function (tabName) {
    const tabBtnStyle = document.getElementById('tab-btn-style');
    const tabBtnText = document.getElementById('tab-btn-text');
    const contentStyle = document.getElementById('tab-content-style');
    const contentText = document.getElementById('tab-content-text');

    if (tabName === 'style') {
        tabBtnStyle.className = "flex-1 py-3 text-sm font-medium border-b-2 border-neon-cyan text-white bg-white/5 transition-colors";
        tabBtnText.className = "flex-1 py-3 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-white hover:bg-white/5 transition-colors";
        contentStyle.classList.remove('hidden');
        contentText.classList.add('hidden');
    } else {
        tabBtnText.className = "flex-1 py-3 text-sm font-medium border-b-2 border-neon-cyan text-white bg-white/5 transition-colors";
        tabBtnStyle.className = "flex-1 py-3 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-white hover:bg-white/5 transition-colors";
        contentText.classList.remove('hidden');
        contentStyle.classList.add('hidden');

        // Populate textarea with current caption
        document.getElementById('caption-input').value = captionOverlay.innerText;

        // Pause simulation so user can edit
        clearInterval(captionInterval);
    }
}



window.updateFont = function (fontName) {
    captionOverlay.style.fontFamily = `"${fontName}", sans-serif`;

    // Some fonts need specific weights
    if (fontName === 'Lobster' || fontName === 'Dancing Script') {
        captionOverlay.style.fontWeight = '400';
    } else {
        captionOverlay.style.fontWeight = 'bold';
    }
}

// --- Styling Functions (Unified) ---

function updateSize(val) {
    if (activeElement) {
        activeElement.style.fontSize = `${val}px`;
    }
}

function updateColor(color) {
    if (activeElement) {
        activeElement.style.color = color;
        activeElement.style.textShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
    }
}

function applyStyle(styleName) {
    if (!activeElement) return;

    // Reset base styles - preserve positioning
    activeElement.className = "absolute text-center px-4 py-2 rounded-lg text-2xl md:text-3xl font-bold transition-all duration-300 border-2 border-transparent cursor-move select-none";

    // Remove all custom style classes
    activeElement.classList.remove('caption-style-neon', 'caption-style-highlight', 'caption-style-minimal', 'caption-style-karaoke', 'bg-black/50', 'backdrop-blur-sm');

    // Remove inline styles to allow class to take effect
    activeElement.style.color = '';
    activeElement.style.textShadow = '';
    activeElement.style.backgroundColor = '';

    if (styleName === 'default') {
        activeElement.classList.add('text-white', 'bg-black/50');
    } else if (styleName === 'neon') {
        activeElement.classList.add('caption-style-neon');
    } else if (styleName === 'highlight') {
        activeElement.classList.add('caption-style-highlight');
    } else if (styleName === 'minimal') {
        activeElement.classList.add('caption-style-minimal');
    }

    // Maintain selection highlight
    activeElement.classList.add('border-neon-cyan');
}

window.updateCaptionText = function (text) {
    if (activeElement) {
        activeElement.innerText = text;
        // Optionally update timeline clip text if linked
    }
}

// --- Export ---
function downloadVideo() {
    alert("In a real app, this would start the server-side rendering of the captions onto the video layer. Since this is a demo, assume the video is downloading!");
}

// --- Authentication Logic ---

const authModal = document.getElementById('auth-modal');
const verifyModal = document.getElementById('verify-modal');
const navButtons = document.getElementById('nav-buttons');
const authSubmitBtn = document.getElementById('auth-submit-btn');

let isSignUp = false;
let isLoggedIn = false;

// --- Google Auth ---
window.handleGoogleAuth = function () {
    const btn = event.currentTarget.querySelector('svg');
    btn.classList.add('animate-spin');

    // Simulate Google Popup Delay
    setTimeout(() => {
        isSignUp = false; // Treat as login
        hideAuthModal();
        loginSuccess();
        alert("Successfully signed in with Google!");
        btn.classList.remove('animate-spin');
    }, 1500);
}

// --- Video Tools Logic ---

window.setRatio = function (ratio) {
    document.getElementById('current-ratio-display').innerText = ratio; // Updated ID
    const container = document.getElementById('video-container'); // Updated ID

    // Reset styles
    container.style.width = '';
    container.style.height = '';
    container.style.aspectRatio = '';

    if (ratio === '16:9') {
        container.style.aspectRatio = '16/9';
    } else if (ratio === '9:16') {
        container.style.aspectRatio = '9/16';
        // In vertical modes, ensure height doesn't overflow parent
        container.style.height = '100%';
        container.style.width = 'auto';
    } else if (ratio === '1:1') {
        container.style.aspectRatio = '1/1';
    } else if (ratio === '4:5') {
        container.style.aspectRatio = '4/5';
        container.style.height = '100%';
        container.style.width = 'auto';
    }
}

let isCropMode = false;
window.toggleCropMode = function () {
    isCropMode = !isCropMode;
    const btn = document.getElementById('btn-crop-timeline'); // Updated ID

    if (isCropMode) {
        btn.classList.add('text-neon-cyan', 'bg-white/10');
        videoElement.style.transform = "scale(1.2)"; // Simulate zoom/crop
        videoElement.style.cursor = "move";
        alert("Crop Mode Active: Drag video to adjust frame (Simulated)");
    } else {
        btn.classList.remove('text-neon-cyan', 'bg-white/10');
        videoElement.style.transform = "scale(1)";
        videoElement.style.cursor = "default";
    }
}

window.toggleFullscreen = function () {
    const container = document.getElementById('video-container');
    if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) { /* Safari */
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) { /* IE11 */
            container.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
}

window.splitClip = function () {
    // Visual indicator on timeline
    const track = document.getElementById('track-captions');
    const marker = document.createElement('div');
    marker.className = "absolute top-0 bottom-0 w-0.5 bg-white z-50 animate-pulse";
    // Calculate position based on simulated pxPerSec (100)
    // We need to approximate where playhead is visually 
    // real app would track precise State
    const pxPerSec = 100;
    const position = videoElement.currentTime * pxPerSec;

    marker.style.left = `${position}px`;
    marker.style.height = '100%';
    track.parentElement.appendChild(marker); // Append to track container

    // Feedback
    const toast = document.createElement('div');
    toast.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full border border-neon-cyan/50 text-sm shadow-xl z-[200] animate-fade-in-up";
    toast.innerText = `✂️ Split at ${videoElement.currentTime.toFixed(1)}s`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
    // Only if editor is visible
    if (viewEditor.classList.contains('hidden')) return;

    // Avoid shortcuts if typing in input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'Space') {
        e.preventDefault();
        if (videoElement.paused) videoElement.play();
        else videoElement.pause();
    } else if (e.code === 'KeyC') {
        toggleCropMode();
    } else if (e.code === 'KeyS') {
        splitClip();
    } else if (e.code === 'Delete') {
        alert("Simulated: Clip Deleted");
    }
});

window.showAuthModal = function (mode) {
    authModal.classList.remove('hidden');
    // Default to signin if mode not specified, but usually it is.
    isSignUp = (mode === 'signup');
    updateAuthUI();
}

window.hideAuthModal = function () {
    authModal.classList.add('hidden');
}

window.toggleAuthMode = function () {
    isSignUp = !isSignUp;
    updateAuthUI();
}

function updateAuthUI() {
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const nameField = document.getElementById('name-field');
    const authToggleText = document.getElementById('auth-toggle-text');
    const authToggleBtn = document.getElementById('auth-toggle-btn');

    if (isSignUp) {
        authTitle.innerText = "Create Account";
        authSubtitle.innerText = "Join Caption Net for free to save your videos.";
        nameField.classList.remove('hidden');
        authSubmitBtn.innerText = "Sign Up";
        authToggleText.innerText = "Already have an account?";
        authToggleBtn.innerText = "Sign In";
    } else {
        authTitle.innerText = "Welcome Back";
        authSubtitle.innerText = "Sign in to save your projects securely.";
        nameField.classList.add('hidden');
        authSubmitBtn.innerText = "Sign In";
        authToggleText.innerText = "Don't have an account?";
        authToggleBtn.innerText = "Sign Up";
    }
}


window.handleAuth = function (event) {
    event.preventDefault();
    const originalText = authSubmitBtn.innerText;
    authSubmitBtn.innerText = "Processing...";
    authSubmitBtn.disabled = true;

    // Simulate API delay
    setTimeout(() => {
        authSubmitBtn.innerText = originalText;
        authSubmitBtn.disabled = false;
        hideAuthModal();

        loginSuccess();
        alert(isSignUp ? "Account created successfully!" : "Signed in successfully!");
    }, 1500);
}

// Verification Logic - REMOVED

function loginSuccess() {
    isLoggedIn = true;
    updateNavForLoggedInState();
}

function updateNavForLoggedInState() {
    navButtons.innerHTML = `
<button onclick="logout()" class="px-5 py-2.5 text-sm font-semibold text-white bg-red-500/10 border border-red-500/50 rounded-full hover:bg-red-500/20 transition-all">
Log Out
</button>
<div class="ml-4 w-10 h-10 rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan p-[2px]">
<div class="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
    <i data-lucide="user" class="w-5 h-5 text-white"></i>
</div>
</div>
`;
    lucide.createIcons();
}

window.logout = function () {
    isLoggedIn = false;
    location.reload();
}




