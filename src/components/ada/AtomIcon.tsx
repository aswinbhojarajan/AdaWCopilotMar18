import React from 'react';
import svgPaths from '../../imports/svg-02a400puk5';

interface AtomIconProps {
  size?: number;
  className?: string;
}

/**
 * AtomIcon Component
 * 
 * A decorative atom-style icon with orbital paths.
 * Used as a visual element in chat interfaces and AI-related sections.
 * 
 * @param size - Width and height of the icon (default: 40)
 * @param className - Additional CSS classes
 */
export function AtomIcon({ size = 40, className = '' }: AtomIconProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34.6913 34.3456">
        <g clipPath="url(#clip0_174_386)" id="Group 1000011033">
          <path d={svgPaths.p11ae8b00} id="Ellipse 3627" stroke="#555555" strokeWidth="0.5" fill="none" />
          <path d={svgPaths.pbd88980} id="Ellipse 3628" stroke="#555555" strokeWidth="0.5" fill="none" />
        </g>
        <defs>
          <clipPath id="clip0_174_386">
            <rect fill="white" height="34.3456" width="34.6913" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
