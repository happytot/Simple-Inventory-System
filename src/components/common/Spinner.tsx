// This is a clean, Apple-style loading arc
export default function Spinner() {
  return (
    // We wrap it in a div to apply layout classes
    <div role="status" className="-ml-1 mr-2" aria-live="polite">
      <svg
        width="20"
        height="20"
        viewBox="0 0 38 38"
        xmlns="http://www.w3.org/2000/svg"
        stroke="#fff" // Set to white for the blue primary button
      >
        <title>Loading...</title>
        <g fill="none" fillRule="evenodd">
          <g transform="translate(1 1)" strokeWidth="2.5">
            {/* The background track */}
            <circle strokeOpacity=".2" cx="18" cy="18" r="18" />
            {/* The spinning arc */}
            <path d="M36 18c0-9.94-8.06-18-18-18">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 18 18"
                to="360 18 18"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        </g>
      </svg>
    </div>
  );
}