import React, {type ReactNode} from 'react';
import {HtmlClassNameProvider} from '@docusaurus/theme-common';
import {DocProvider} from '@docusaurus/plugin-content-docs/client';
import DocItemMetadata from '@theme/DocItem/Metadata';
import DocItemLayout from '@theme/DocItem/Layout';
import type {Props} from '@theme/DocItem';

import DisqusComments from '@site/src/components/DisqusComments';

export default function DocItem(props: Props): ReactNode {
  const docHtmlClassName = `docs-doc-id-${props.content.metadata.id}`;
  const MDXComponent = props.content;

  return (
      <DocProvider content={props.content}>
        <HtmlClassNameProvider className={docHtmlClassName}>
          <DocItemMetadata />
          <DocItemLayout>
            <MDXComponent />
            <DisqusComments /> {/* Disqus 댓글 위젯 */}
          </DocItemLayout>
        </HtmlClassNameProvider>
      </DocProvider>
  );
}