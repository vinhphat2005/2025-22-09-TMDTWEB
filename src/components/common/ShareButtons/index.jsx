import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.scss';

// Icons
import { FaFacebook, FaTwitter, FaLinkedin, FaLink } from 'react-icons/fa';

const ShareButtons = ({ url, title, description, image }) => {
  const [copied, setCopied] = useState(false);
  
  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className={styles.shareButtons}>
      <div className={styles.shareTitle}>Share this product:</div>
      <div className={styles.buttonsWrapper}>
        <button
          className={`${styles.shareBtn} ${styles.facebook}`}
          onClick={() => handleShare('facebook')}
          title="Share on Facebook"
          aria-label="Share on Facebook"
        >
          <FaFacebook />
          <span>Facebook</span>
        </button>
        
        <button
          className={`${styles.shareBtn} ${styles.twitter}`}
          onClick={() => handleShare('twitter')}
          title="Share on Twitter"
          aria-label="Share on Twitter"
        >
          <FaTwitter />
          <span>Twitter</span>
        </button>
        
        <button
          className={`${styles.shareBtn} ${styles.linkedin}`}
          onClick={() => handleShare('linkedin')}
          title="Share on LinkedIn"
          aria-label="Share on LinkedIn"
        >
          <FaLinkedin />
          <span>LinkedIn</span>
        </button>
        
        <button
          className={`${styles.shareBtn} ${styles.copyLink} ${copied ? styles.copied : ''}`}
          onClick={handleCopyLink}
          title="Copy link"
          aria-label="Copy link"
        >
          <FaLink />
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
};

ShareButtons.propTypes = {
  url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  image: PropTypes.string,
};

export default ShareButtons;
