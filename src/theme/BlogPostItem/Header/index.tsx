import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import BlogPostItemHeaderTitle from '@theme/BlogPostItem/Header/Title';
import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';
import BlogPostItemHeaderAuthors from '@theme/BlogPostItem/Header/Authors';

import {useBlogPost} from '@docusaurus/plugin-content-blog/client';

export default function BlogPostItemHeader(): ReactNode {
  const {isBlogPostPage} = useBlogPost();

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
        </div>
        <BlogPostItemHeaderAuthors />
      </header>
  );
}