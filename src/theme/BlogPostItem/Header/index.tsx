import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import BlogPostItemHeaderTitle from '@theme/BlogPostItem/Header/Title';
import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';
import BlogPostItemHeaderAuthors from '@theme/BlogPostItem/Header/Authors';

import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import DisqusCountLink from '@site/src/components/DisqusCountLink';

export default function BlogPostItemHeader(): ReactNode {
  const {metadata, isBlogPostPage} = useBlogPost();
  const {permalink} = metadata;

  return (
      <header>
        {isBlogPostPage && (
          <Link to="/blog" className="post-back-link">
            <span aria-hidden="true">←</span> 목록보기
          </Link>
        )}
        <BlogPostItemHeaderTitle />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BlogPostItemHeaderInfo />
          <DisqusCountLink slug={permalink} />
        </div>
        <BlogPostItemHeaderAuthors />
      </header>
  );
}