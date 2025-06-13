import type { SVGProps } from 'react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="150"
      height="37.5"
      aria-label="InvoicePilot Logo"
      {...props}
    >
      <rect width="200" height="50" fill="transparent" />
      <path
        d="M20,10 L20,40 L25,40 L25,25 L35,25 L35,40 L40,40 L40,10 L35,10 L35,20 L25,20 L25,10 Z"
        fill="hsl(var(--primary))"
      />
      <text
        x="50"
        y="35"
        fontFamily="Inter, sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="hsl(var(--foreground))"
      >
        InvoicePilot
      </text>
    </svg>
  );
}
