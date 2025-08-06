// ========================
// Ultimate Tracker with Full LogSnag Storage
// ========================

// WebGL2 Support Check
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

// IP and Location Detection
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

// Send ALL data to LogSnag
async function logToSnag(data) {
    const logsnagPayload = {
        project: "abacromby9-studios", // Your exact project name
        channel: "sci-39-website-logs", // Your exact channel name
        event: "Visitor Tracked",
        description: `New visit from ${data.ipAddress}`,
        icon: "👀",
        tags: {
            device: data.deviceType,
            os: data.operatingSystem,
            country: data.location.split(',')[2]?.trim() || 'unknown',
            resolution: data.screenResolution,
            browser: data.browser.match(/(Chrome|Firefox|Safari|Edge)\//)?.[0] || 'unknown'
        },
        notify: false,
        // Store ALL raw data in the properties field
        properties: {
            fullData: JSON.stringify(data) // Everything gets stored here
        }
    };

    try {
        await fetch("https://api.logsnag.com/v1/log", {
            method: "POST",
            headers: {
                "Authorization": "Bearer bcda43f594d1bfc54dfc1b3591e4c9ff",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(logsnagPayload)
        });
    } catch (error) {
        console.error('LogSnag error:', error);
    }
}

// Discord Webhook Integration
async function sendToDiscordWebhook(data) {
    const webhookUrl = 'https://discord.com/api/webhooks/1402364477877518446/1v4i9TTbl1-3eIQhrBI_rfMNfI9FJ0QJ0g3t-C6bDKzJzjD0VXYqDvn9jFgu1fvHUptb';

    const embed = {
        title: "🛰️ New Visitor Detected",
        color: 0x3498db,
        fields: [
            { name: "🌐 IP", value: data.ipAddress, inline: true },
            { name: "📍 Location", value: data.location, inline: true },
            { name: "💻 OS", value: data.operatingSystem, inline: true },
            { name: "🖥️ Device", value: data.deviceType, inline: true },
            { name: "🔍 Screen", value: data.screenResolution, inline: true },
            { name: "🌎 Browser", value: data.browser.substring(0, 50) + (data.browser.length > 50 ? "..." : ""), inline: false }
        ],
        timestamp: new Date().toISOString()
    };

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
    } catch (error) {
        console.error('Discord error:', error);
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

        // System Info
        browser: navigator.userAgent,
        operatingSystem: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toISOString(),

        // Device Info
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        deviceType: /Mobile|Tablet|iPad|iPhone|Android/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        touchScreen: navigator.maxTouchPoints > 0,

        // Browser Features
        webGL2: checkWebGL2Support(),
        webP: checkWebPSupport(),
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack
    };

    // Send to both services
    await Promise.allSettled([
        sendToDiscordWebhook(trackerData),
        logToSnag(trackerData) // Stores EVERYTHING in properties.fullData
    ]);

    return trackerData;
}

// Initialize Tracker
(async function() {
    const tracker = await initializeUltimateTracker();
    
    // Track session duration
    let sessionDuration = 0;
    setInterval(() => {
        sessionDuration++;
        // Update every minute
        if (sessionDuration % 60 === 0) {
            logToSnag({
                ...tracker,
                event: "Session Update",
                sessionDuration: sessionDuration
            });
        }
    }, 1000);

    // Final log on exit
    window.addEventListener('beforeunload', () => {
        logToSnag({
            ...tracker,
            event: "Session Ended",
            sessionDuration: sessionDuration,
            exitTime: new Date().toISOString()
        });
    });
})();
