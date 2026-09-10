import React from 'react';

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
  replace?: boolean;
  children?: React.ReactNode;
};

export default function Link({
  href,
  onClick,
  children,
  target,
  replace = false,
  prefetch: _prefetch,
  ...rest
}: LinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      target === '_blank' ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.shiftKey
    ) {
      return;
    }

    // If it's an in-page anchor like "#salud-forte", let the browser scroll to the element
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
      }
      return;
    }

    // External URL
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
      return;
    }

    // In-app route navigation
    e.preventDefault();
    if (replace) {
      window.history.replaceState(null, '', href);
    } else {
      window.history.pushState(null, '', href);
    }
    window.dispatchEvent(new PopStateEvent('popstate'));
    if (!href.includes('#')) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <a href={href} onClick={handleClick} target={target} {...rest}>
      {children}
    </a>
  );
}
