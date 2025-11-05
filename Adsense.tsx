import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

const Adsense: React.FC = () => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('Could not initialize Google Adsense:', e);
    }
  }, []);

  return (
    // The "data-full-width-responsive" attribute was removed as it conflicts with a parent
    // container that has a max-width. "data-ad-format=auto" is sufficient for responsiveness here.
    // A min-height is added to ensure the container has dimensions when the script runs.
    <div className="my-8 w-full min-h-[90px]">
        {/* HINWEIS: Ersetzen Sie 'YOUR_AD_SLOT_ID' durch Ihre tatsächliche Anzeigenblock-ID von Google AdSense. */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client="ca-pub-6910374309374247"
        data-ad-slot="YOUR_AD_SLOT_ID"
        data-ad-format="auto"
      ></ins>
    </div>
  );
};

export default Adsense;