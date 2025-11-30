import { useEffect } from 'react';
import styles from './index.module.scss';

const NewsletterMailchimp = () => {
  useEffect(() => {
    // Load MailChimp validation script
    const script = document.createElement('script');
    script.src = 'https://s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div id="mc_embed_shell">
          <div id="mc_embed_signup">
            <form
              action="YOUR_MAILCHIMP_ACTION_URL"
              method="post"
              id="mc-embedded-subscribe-form"
              name="mc-embedded-subscribe-form"
              className={styles.form}
              target="_self"
              noValidate
            >
              <div id="mc_embed_signup_scroll">
                <h3 className={styles.title}>Sign up for the SKRT newsletter</h3>
                
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    name="EMAIL"
                    className={styles.input}
                    id="mce-EMAIL"
                    placeholder="Your email address"
                    required
                  />
                  
                  {/* Bot protection */}
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px' }}>
                    <input
                      type="text"
                      name="b_xxxxx_yyyyy"
                      tabIndex="-1"
                      defaultValue=""
                    />
                  </div>
                  
                  <button
                    type="submit"
                    name="subscribe"
                    id="mc-embedded-subscribe"
                    className={styles.button}
                  >
                    Sign up
                  </button>
                </div>

                {/* Response messages */}
                <div id="mce-responses" className={styles.responses}>
                  <div
                    className={styles.response}
                    id="mce-error-response"
                    style={{ display: 'none' }}
                  ></div>
                  <div
                    className={styles.response}
                    id="mce-success-response"
                    style={{ display: 'none' }}
                  ></div>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Instructions */}
        <p className={styles.instructions}>
          ⚠️ <strong>SETUP REQUIRED:</strong> Replace <code>YOUR_MAILCHIMP_ACTION_URL</code> in NewsletterMailchimp/index.jsx with your actual MailChimp form action URL
        </p>
      </div>
    </section>
  );
};

export default NewsletterMailchimp;
