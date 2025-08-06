// ========================
// Ultimate Tracker with Supabase Storage (Fixed)
// ========================

// 1. First load Supabase client library
const supabaseScript = document.createElement('script');
supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
document.head.appendChild(supabaseScript);

// 2. Wait for Supabase to load before initializing
supabaseScript.onload = async () => {
  // Supabase Configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
  const SUPABASE_URL = 'https://syynhwbeqnitfgcwfoda.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eW5od2JlcW5pdGZnY3dmb2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODUwODIsImV4cCI6MjA3MDA2MTA4Mn0.IbYMLzA__lo8C9E50zAuFBP5n3rYc4sCpYlLenjzCMs';
  
  // Initialize Supabase client
  const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // WebGL2 Support Check
  const checkWebGL2Support = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch (e) {
      return false;
    }
  };

  // IP and Location Detection
  const getIPAndLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      return await response.json();
    } catch (error) {
      return { ip: 'blocked', country: 'unknown' };
    }
  };

  // Supabase Storage Function
  const storeInSupabase = async (data) => {
    try {
      const { error } = await supabase
        .from('visitor_logs')
        .insert([data]);
      
      if (error) throw error;
      console.log('✅ Data stored in Supabase');
    } catch (error) {
      console.error('❌ Supabase error:', error);
    }
  };

  // Main Tracking Function
  const initializeUltimateTracker = async () => {
    const ipInfo = await getIPAndLocation();

    const trackerData = {
      ip_address: ipInfo.ip || 'unknown',
      country: ipInfo.country || 'unknown',
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      device_type: /Mobile|Tablet|iPad|iPhone|Android/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      webgl2: checkWebGL2Support(),
      cookies_enabled: navigator.cookieEnabled,
      timestamp: new Date().toISOString()
    };

    await storeInSupabase(trackerData);
    return trackerData;
  };

  // Initialize
  const tracker = await initializeUltimateTracker();
  console.log('Tracker initialized:', tracker);
};
