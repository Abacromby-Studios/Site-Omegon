// ========================
// Ultimate Tracker with Supabase Storage
// ========================

// Supabase Configuration (Replace with your actual credentials)
const SUPABASE_URL = 'https://syynhwbeqnitfgcwfoda.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eW5od2JlcW5pdGZnY3dmb2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODUwODIsImV4cCI6MjA3MDA2MTA4Mn0.IbYMLzA__lo8C9E50zAuFBP5n3rYc4sCpYlLenjzCMs'; // From Supabase project settings
// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// WebGL2 Support Check
function checkWebGL2Support() {
    try {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
    } catch (e) {
        return false;
    }
}

// IP and Location Detection
async function getIPAndLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        return await response.json();
    } catch (error) {
        return { ip: 'blocked', country: 'unknown' };
    }
}

// Main Tracking Function
async function initializeUltimateTracker() {
    const ipInfo = await getIPAndLocation();

    const trackerData = {
        // System Info
        ip_address: ipInfo.ip || 'unknown',
        country: ipInfo.country || 'unknown',
        user_agent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        
        // Device Info
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        device_type: /Mobile|Tablet|iPad|iPhone|Android/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        
        // Browser Capabilities
        webgl2: checkWebGL2Support(),
        cookies_enabled: navigator.cookieEnabled,
        timestamp: new Date().toISOString()
    };

    // Store in Supabase
    await storeInSupabase(trackerData);
    
    return trackerData;
}

// Supabase Storage Function
async function storeInSupabase(data) {
    try {
        const { error } = await supabase
            .from('visitor_logs')
            .insert([data]);
        
        if (error) throw error;
        console.log('Data stored in Supabase');
    } catch (error) {
        console.error('Supabase error:', error);
        // Fallback to Discord if Supabase fails
        await sendToDiscordWebhook(data);
    }
}

// Discord Fallback (Optional)
async function sendToDiscordWebhook(data) {
    const webhookUrl = 'https://discord.com/api/webhooks/1402364477877518446/1v4i9TTbl1-3eIQhrBI_rfMNfI9FJ0QJ0g3t-C6bDKzJzjD0VXYqDvn9jFgu1fvHUptb';
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: `⚠️ Supabase failed - Fallback data:\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
        })
    });
}

// Initialize Tracker
(async () => {
    const tracker = await initializeUltimateTracker();
    console.log('Tracker initialized:', tracker);
})();
