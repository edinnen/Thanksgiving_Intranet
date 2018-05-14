/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 */

import React from 'react';

import H1 from 'components/H1';
import messages from './messages';

export default function NotFound() {
  return (
    <article>
      <H1>
        404, bitch
      </H1>
    </article>
  );
}
