import type { SVGProps } from 'react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 50" // Adjusted viewBox for potentially longer text
      width="180" // Adjusted width
      height="37.5"
      aria-label="QuickInvoice Logo"
      {...props}
    >
      <rect width="220" height="50" fill="transparent" />
      <text
        x="10" // Adjusted x for better alignment
        y="35"
        fontFamily="Inter, sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="hsl(var(--foreground))"
      >
        QuickInvoice
      </text>
    </svg>
  );
}
