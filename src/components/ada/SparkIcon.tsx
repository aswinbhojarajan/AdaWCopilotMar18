import React from 'react';
import svgPaths from '../../imports/svg-htxx3p4b7c';

interface SparkIconProps {
  className?: string;
  size?: number;
  color?: string;
}

export function SparkIcon({ className = '', size = 18, color = '#d8d8d8' }: SparkIconProps) {
  return (
    <svg 
      className={className}
      width={size} 
      height={size} 
      viewBox="0 0 34.6913 34.3456" 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_174_386)">
        <path d={svgPaths.p11ae8b00} stroke={color} strokeWidth="1" />
        <path d={svgPaths.pbd88980} stroke={color} strokeWidth="1" />
      </g>
      <defs>
        <clipPath id="clip0_174_386">
          <rect fill="white" height="34.3456" width="34.6913" />
        </clipPath>
      </defs>
    </svg>
  );
}
