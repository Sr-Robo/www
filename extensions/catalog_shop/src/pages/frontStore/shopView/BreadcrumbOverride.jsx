import React from 'react';

export default function HideBreadcrumb() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: '[data-slot="breadcrumb"], nav[aria-label="trilha de navegação"] { display: none !important; }'
    }} />
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 1
};
