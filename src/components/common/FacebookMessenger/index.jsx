import { useEffect } from 'react';

const FacebookMessenger = () => {
  const pageId = import.meta.env.VITE_FB_PAGE_ID;

  useEffect(() => {
    // Chỉ load nếu có Page ID
    if (!pageId || pageId === 'YOUR_PAGE_ID') {
      console.warn('⚠️ Facebook Messenger: VITE_FB_PAGE_ID chưa được cấu hình');
      return;
    }

    console.log('✅ Facebook Messenger: Loading with Page ID:', pageId);

    // Xóa script cũ nếu có
    const existingScript = document.getElementById('facebook-jssdk');
    if (existingScript) {
      existingScript.remove();
    }

    // Facebook SDK initialization
    window.fbAsyncInit = function() {
      window.FB.init({
        xfbml: true,
        version: 'v19.0'
      });
      console.log('✅ Facebook SDK initialized');
    };

    // Load Facebook SDK
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); 
      js.id = id;
      js.src = 'https://connect.facebook.net/vi_VN/sdk/xfbml.customerchat.js';
      js.async = true;
      js.defer = true;
      fjs.parentNode.insertBefore(js, fjs);
      
      js.onload = () => {
        console.log('✅ Facebook SDK script loaded');
      };
      
      js.onerror = () => {
        console.error('❌ Failed to load Facebook SDK');
      };
    }(document, 'script', 'facebook-jssdk'));

    // Cleanup
    return () => {
      // Không xóa script khi unmount để tránh reload
    };
  }, [pageId]);

  // Không render nếu không có Page ID
  if (!pageId || pageId === 'YOUR_PAGE_ID') {
    return null;
  }

  return (
    <>
      <div id="fb-root"></div>
      
      {/* Facebook Messenger Chat Plugin */}
      <div 
        className="fb-customerchat"
        attribution="biz_inbox"
        page_id={pageId}
        theme_color="#0084FF"
        logged_in_greeting="Xin chào! Cần hỗ trợ gì không?"
        logged_out_greeting="Xin chào! Cần hỗ trợ gì không?"
      ></div>
    </>
  );
};

export default FacebookMessenger;
