import React, {useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import BrowserOnly from '@docusaurus/BrowserOnly';

type Props = {
  slug: string;
};

export default function DisqusCountLink({slug}: Props) {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).DISQUSWIDGETS) {
      (window as any).DISQUSWIDGETS.getCount({ reset: true });
    }
  }, [location.pathname]);

  return (
      <BrowserOnly>
        {() => (
            <a
                href={`${slug}#disqus_thread`}
                data-disqus-identifier={slug}
                style={{ marginLeft: '1rem', fontSize: '0.9rem' }}
            >
              댓글
            </a>
        )}
      </BrowserOnly>
  );
}