// ===== Baby Tracker App =====

// State Management
const state = {
    activities: JSON.parse(localStorage.getItem('babyActivities')) || [],
    sleepActive: false,
    sleepStartTime: null,
    currentFeedingType: 'breast',
    currentSide: 'left',
    bottleAmount: 4
};

// DOM Elements
const elements = {
    currentTime: document.getElementById('currentTime'),
    sleepCard: document.getElementById('sleepCard'),
    sleepStatus: document.getElementById('sleepStatus'),
    sleepTimer: document.getElementById('sleepTimer'),
    feedingCard: document.getElementById('feedingCard'),
    feedingStatus: document.getElementById('feedingStatus'),
    peeCard: document.getElementById('peeCard'),
    peeStatus: document.getElementById('peeStatus'),
    poopCard: document.getElementById('poopCard'),
    poopStatus: document.getElementById('poopStatus'),
    totalSleep: document.getElementById('totalSleep'),
    totalFeedings: document.getElementById('totalFeedings'),
    totalDiapers: document.getElementById('totalDiapers'),
    activityList: document.getElementById('activityList'),
    emptyState: document.getElementById('emptyState'),
    clearBtn: document.getElementById('clearBtn'),
    feedingModal: document.getElementById('feedingModal'),
    closeFeedingModal: document.getElementById('closeFeedingModal'),
    cancelFeeding: document.getElementById('cancelFeeding'),
    saveFeeding: document.getElementById('saveFeeding'),
    feedingNotes: document.getElementById('feedingNotes'),
    breastOptions: document.getElementById('breastOptions'),
    bottleOptions: document.getElementById('bottleOptions'),
    bottleAmount: document.getElementById('bottleAmount'),
    toast: document.getElementById('toast')
};

// Initialize App
function init() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Check for ongoing sleep
    const savedSleepStart = localStorage.getItem('sleepStartTime');
    if (savedSleepStart) {
        state.sleepActive = true;
        state.sleepStartTime = new Date(savedSleepStart);
        elements.sleepCard.classList.add('sleep-active');
        elements.sleepStatus.textContent = 'Sleeping...';
        elements.sleepTimer.classList.add('active');
        updateSleepTimer();
    }
    
    setInterval(updateSleepTimer, 1000);
    
    renderActivities();
    updateSummary();
    setupEventListeners();
}

// Update Current Time
function updateCurrentTime() {
    const now = new Date();
    elements.currentTime.textContent = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Update Sleep Timer
function updateSleepTimer() {
    if (!state.sleepActive || !state.sleepStartTime) return;
    
    const elapsed = Date.now() - state.sleepStartTime.getTime();
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    if (hours > 0) {
        elements.sleepTimer.textContent = `${hours}h ${minutes}m`;
    } else {
        elements.sleepTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Sleep Card
    elements.sleepCard.addEventListener('click', toggleSleep);
    
    // Feeding Card
    elements.feedingCard.addEventListener('click', openFeedingModal);
    
    // Diaper Cards
    elements.peeCard.addEventListener('click', () => logDiaper('pee'));
    elements.poopCard.addEventListener('click', () => logDiaper('poop'));
    
    // Clear Button
    elements.clearBtn.addEventListener('click', clearActivities);
    
    // Modal Controls
    elements.closeFeedingModal.addEventListener('click', closeFeedingModal);
    elements.cancelFeeding.addEventListener('click', closeFeedingModal);
    elements.saveFeeding.addEventListener('click', saveFeeding);
    
    // Feeding Type Buttons
    document.querySelectorAll('.feeding-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.feeding-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentFeedingType = btn.dataset.type;
            updateFeedingOptions();
        });
    });
    
    // Side Buttons
    document.querySelectorAll('.side-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentSide = btn.dataset.side;
        });
    });
    
    // Amount Buttons
    document.querySelector('.amount-btn.minus').addEventListener('click', () => {
        const current = parseFloat(elements.bottleAmount.value);
        if (current > 0.5) {
            elements.bottleAmount.value = (current - 0.5).toFixed(1);
        }
    });
    
    document.querySelector('.amount-btn.plus').addEventListener('click', () => {
        const current = parseFloat(elements.bottleAmount.value);
        if (current < 12) {
            elements.bottleAmount.value = (current + 0.5).toFixed(1);
        }
    });
    
    // Close modal on overlay click
    elements.feedingModal.addEventListener('click', (e) => {
        if (e.target === elements.feedingModal) {
            closeFeedingModal();
        }
    });
}

// Toggle Sleep
function toggleSleep() {
    if (!state.sleepActive) {
        // Start Sleep
        state.sleepActive = true;
        state.sleepStartTime = new Date();
        localStorage.setItem('sleepStartTime', state.sleepStartTime.toISOString());
        
        elements.sleepCard.classList.add('sleep-active');
        elements.sleepStatus.textContent = 'Sleeping...';
        elements.sleepTimer.classList.add('active');
        
        showToast('🌙', 'Sleep started');
    } else {
        // End Sleep
        const endTime = new Date();
        const duration = endTime - state.sleepStartTime;
        
        const activity = {
            id: Date.now(),
            type: 'sleep',
            startTime: state.sleepStartTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: duration,
            timestamp: endTime.toISOString()
        };
        
        addActivity(activity);
        
        state.sleepActive = false;
        state.sleepStartTime = null;
        localStorage.removeItem('sleepStartTime');
        
        elements.sleepCard.classList.remove('sleep-active');
        elements.sleepStatus.textContent = 'Tap to start';
        elements.sleepTimer.classList.remove('active');
        elements.sleepTimer.textContent = '';
        
        showToast('🌙', `Sleep logged: ${formatDuration(duration)}`);
    }
}

// Log Diaper
function logDiaper(type) {
    const activity = {
        id: Date.now(),
        type: type,
        timestamp: new Date().toISOString()
    };
    
    addActivity(activity);
    
    const icon = type === 'pee' ? '💧' : '💩';
    const label = type === 'pee' ? 'Wet diaper' : 'Dirty diaper';
    showToast(icon, `${label} logged`);
    
    // Update status with time-ago
    updateCardStatus(type);
}

// Open Feeding Modal
function openFeedingModal() {
    elements.feedingModal.classList.add('active');
    elements.feedingNotes.value = '';
    updateFeedingOptions();
}

// Close Feeding Modal
function closeFeedingModal() {
    elements.feedingModal.classList.remove('active');
}

// Update Feeding Options
function updateFeedingOptions() {
    if (state.currentFeedingType === 'breast') {
        elements.breastOptions.classList.remove('hidden');
        elements.bottleOptions.classList.add('hidden');
    } else if (state.currentFeedingType === 'bottle') {
        elements.breastOptions.classList.add('hidden');
        elements.bottleOptions.classList.remove('hidden');
    } else {
        elements.breastOptions.classList.add('hidden');
        elements.bottleOptions.classList.add('hidden');
    }
}

// Save Feeding
function saveFeeding() {
    const activity = {
        id: Date.now(),
        type: 'feeding',
        feedingType: state.currentFeedingType,
        timestamp: new Date().toISOString(),
        notes: elements.feedingNotes.value
    };
    
    if (state.currentFeedingType === 'breast') {
        activity.side = state.currentSide;
    } else if (state.currentFeedingType === 'bottle') {
        activity.amount = parseFloat(elements.bottleAmount.value);
    }
    
    addActivity(activity);
    closeFeedingModal();
    
    let message = 'Feeding logged';
    if (state.currentFeedingType === 'breast') {
        message = `Breastfeed (${state.currentSide}) logged`;
    } else if (state.currentFeedingType === 'bottle') {
        message = `Bottle (${elements.bottleAmount.value}oz) logged`;
    } else {
        message = 'Solid food logged';
    }
    
    showToast('🍼', message);
}

// Add Activity
function addActivity(activity) {
    state.activities.unshift(activity);
    saveActivities();
    renderActivities();
    updateSummary();
}

// Save Activities
function saveActivities() {
    localStorage.setItem('babyActivities', JSON.stringify(state.activities));
}

// Clear Activities
function clearActivities() {
    if (confirm('Clear all activities for today?')) {
        state.activities = [];
        saveActivities();
        renderActivities();
        updateSummary();
        showToast('🗑️', 'Activities cleared');
    }
}

// Render Activities
function renderActivities() {
    const todayActivities = getTodayActivities();
    
    if (todayActivities.length === 0) {
        elements.emptyState.style.display = 'block';
        elements.activityList.innerHTML = '';
        elements.activityList.appendChild(elements.emptyState);
        return;
    }
    
    elements.emptyState.style.display = 'none';
    elements.activityList.innerHTML = todayActivities.map(activity => {
        const time = new Date(activity.timestamp);
        const timeStr = time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        let icon, title, subtitle, iconClass;
        
        switch (activity.type) {
            case 'sleep':
                icon = '🌙';
                iconClass = 'sleep';
                title = 'Sleep';
                subtitle = formatDuration(activity.duration);
                break;
            case 'feeding':
                icon = activity.feedingType === 'breast' ? '🤱' : 
                       activity.feedingType === 'bottle' ? '🍼' : '🥣';
                iconClass = 'feeding';
                if (activity.feedingType === 'breast') {
                    title = 'Breastfeed';
                    subtitle = `${activity.side.charAt(0).toUpperCase() + activity.side.slice(1)} side`;
                } else if (activity.feedingType === 'bottle') {
                    title = 'Bottle';
                    subtitle = `${activity.amount} oz`;
                } else {
                    title = 'Solid Food';
                    subtitle = activity.notes || 'Meal logged';
                }
                break;
            case 'pee':
                icon = '💧';
                iconClass = 'pee';
                title = 'Wet Diaper';
                subtitle = 'Diaper change';
                break;
            case 'poop':
                icon = '💩';
                iconClass = 'poop';
                title = 'Dirty Diaper';
                subtitle = 'Diaper change';
                break;
        }
        
        return `
            <div class="activity-item">
                <div class="activity-icon ${iconClass}">${icon}</div>
                <div class="activity-details">
                    <div class="activity-title">${title}</div>
                    <div class="activity-subtitle">${subtitle}</div>
                </div>
                <div class="activity-time">${timeStr}</div>
            </div>
        `;
    }).join('');
}

// Get Today's Activities
function getTodayActivities() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return state.activities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate.getTime() === today.getTime();
    });
}

// Update Summary
function updateSummary() {
    const todayActivities = getTodayActivities();
    
    // Total Sleep
    const totalSleepMs = todayActivities
        .filter(a => a.type === 'sleep')
        .reduce((sum, a) => sum + (a.duration || 0), 0);
    elements.totalSleep.textContent = formatDuration(totalSleepMs);
    
    // Total Feedings
    const totalFeedings = todayActivities.filter(a => a.type === 'feeding').length;
    elements.totalFeedings.textContent = totalFeedings;
    
    // Total Diapers
    const totalDiapers = todayActivities.filter(a => a.type === 'pee' || a.type === 'poop').length;
    elements.totalDiapers.textContent = totalDiapers;
    
    // Update card statuses
    updateAllCardStatuses();
}

// Update Card Status
function updateCardStatus(type) {
    const activities = getTodayActivities().filter(a => a.type === type);
    const statusElement = type === 'pee' ? elements.peeStatus : 
                         type === 'poop' ? elements.poopStatus :
                         type === 'feeding' ? elements.feedingStatus : null;
    
    if (statusElement && activities.length > 0) {
        const lastActivity = activities[0];
        const timeAgo = getTimeAgo(new Date(lastActivity.timestamp));
        statusElement.textContent = `Last: ${timeAgo}`;
    }
}

// Update All Card Statuses
function updateAllCardStatuses() {
    const types = ['pee', 'poop', 'feeding'];
    types.forEach(type => {
        const activities = getTodayActivities().filter(a => a.type === type);
        const statusElement = type === 'pee' ? elements.peeStatus : 
                             type === 'poop' ? elements.poopStatus :
                             elements.feedingStatus;
        
        if (activities.length > 0) {
            const lastActivity = activities[0];
            const timeAgo = getTimeAgo(new Date(lastActivity.timestamp));
            statusElement.textContent = `Last: ${timeAgo}`;
        } else {
            statusElement.textContent = 'Tap to log';
        }
    });
}

// Format Duration
function formatDuration(ms) {
    if (!ms || ms <= 0) return '0h 0m';
    
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    
    return `${hours}h ${minutes}m`;
}

// Get Time Ago
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
}

// Show Toast
function showToast(icon, message) {
    const toast = elements.toast;
    toast.querySelector('.toast-icon').textContent = icon;
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Initialize App
document.addEventListener('DOMContentLoaded', init);
