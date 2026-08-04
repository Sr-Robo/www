import Area from '@components/common/Area.js';
import React from 'react';

export function Header() {
  return (
    <header className="header bg-background">
      {/* Announcement bar area (Announcement bar widget lands here). */}
      <Area
        id="headerTop"
        className="header__top"
        isGlobal
        editableInPageBuilder
      />
      {/* Full-width: logo/menu colados à esquerda da viewport, ícones à direita.
          px-4/px-6 dão o respiro lateral sem limitar com page-width. */}
      <div className="header__middle w-full flex items-center gap-6 py-4 px-4 lg:px-6">
        <Area
          id="headerMiddleCenter"
          className="header__middle__center flex shrink-0 items-center"
          isGlobal
          editableInPageBuilder
        />
        <Area
          id="headerMiddleLeft"
          className="header__middle__left flex items-center order-first md:order-none"
          isGlobal
          editableInPageBuilder
        />
        <Area
          id="headerMiddleRight"
          className="header__middle__right ml-auto flex items-center gap-1"
          isGlobal
          editableInPageBuilder
        />
      </div>
      <Area
        id="headerBottom"
        className="header__bottom"
        isGlobal
        editableInPageBuilder
      />
    </header>
  );
}
