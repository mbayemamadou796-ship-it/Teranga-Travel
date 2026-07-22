/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TerangaLogo } from '../../shared/ui/TerangaLogo';

interface TouristAppProps {
  children?: React.ReactNode;
}

export default function TouristApp({ children }: TouristAppProps) {
  return (
    <div id="app-tourist-root" className="space-y-8 animate-fade-in">
      {children}
    </div>
  );
}
