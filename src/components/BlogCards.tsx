import React from 'react';
import Link from '@docusaurus/Link';
import useGlobalData from '@docusaurus/useGlobalData';
import styles from './BlogCards.module.css';

export default function BlogCards() {
  const globalData = useGlobalData();
  const blogPosts = globalData['docusaurus-plugin-content-blog']?.default?.blogPosts ?? [];

  return (
      <div className={styles.cardContainer}>
        {blogPosts.slice(0, 3).map((post: any) => (
            <Link key={post.id} to={post.metadata.permalink} className={styles.card}>
              <h3>{post.metadata.title}</h3>
              <p>{post.metadata.description}</p>
            </Link>
        ))}
      </div>
  );
}