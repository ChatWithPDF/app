import React from 'react';
import clsx from 'clsx';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  type: string;
  className?: string;
  name?: string;
  spin?: boolean;
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => {
  const { type, className, spin, name, ...other } = props;
  const ariaProps = typeof name === 'string' ? { 'aria-label': name } : { 'aria-hidden': true };

  if (type === 'chevron-right') {
    return (
      <svg
        fill="#000"
        height="18px"
        width="18px"
        version="1.1"
        id="XMLID_287_"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 24 24"
        xmlSpace="preserve"
      >
        <g id="next">
          <g>
            <polygon points="6.8,23.7 5.4,22.3 15.7,12 5.4,1.7 6.8,0.3 18.5,12 		" />
          </g>
        </g>
      </svg>
    );
  } else if (type === 'chevron-left') {
    return (
      <svg
        fill="#000"
        height="18px"
        width="18px"
        version="1.1"
        id="XMLID_54_"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 24 24"
        xmlSpace="preserve"
      >
        <g id="previous">
          <g>
            <polygon points="17.2,23.7 5.4,12 17.2,0.3 18.5,1.7 8.4,12 18.5,22.3 		" />
          </g>
        </g>
      </svg>
    );
  }
  return (
    <svg
      className={clsx('Icon', { 'is-spin': spin }, `#svg-icon-${type}`)}
      ref={ref}
      {...ariaProps}
      {...other}
    >
      <use xlinkHref={`#icon-${type}`} />
    </svg>
  );
});
