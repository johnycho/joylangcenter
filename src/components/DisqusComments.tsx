import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {DiscussionEmbed} from 'disqus-react';
import {useLocation} from '@docusaurus/router';

export default function DisqusComments() {
  const location = useLocation();

  return (
      <BrowserOnly fallback={<div>Loading comments...</div>}>
        {() => {
          const disqusShortname = 'johny-dev'; // 너의 shortname
          const disqusConfig = {
            url: window.location.href,
            identifier: location.pathname,
            title: document.title,
          };

          return (
              <div style={{ marginTop: '2rem' }}>
                <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
              </div>
          );
        }}
      </BrowserOnly>
  );
}