export function Bluesky(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 10Q2-2 2 6t5 8q-5 3-1 6t6-3q2 6 6 3t-1-6q5 0 5-8t-10 4"
      />
    </svg>
  );
}
