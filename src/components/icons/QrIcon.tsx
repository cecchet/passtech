/** A small black-and-white QR code: the mark for a tech sticker (its QR code). Inline SVG, sized to the text. */
export function QrIcon({ className = "h-4 w-4" }: { className?: string }) {
  // A 9x9 grid: three finder squares and a few modules, on white.
  const modules = [
    [4, 0], [4, 2], [3, 4], [5, 4], [4, 6], [6, 6], [8, 4], [7, 5], [5, 7], [8, 8], [6, 8], [4, 8], [8, 6],
  ];
  return (
    <svg viewBox="0 0 11 11" className={`${className} shrink-0`} aria-hidden="true" shapeRendering="crispEdges">
      <rect width="11" height="11" fill="#fff" rx="1" />
      {[
        [1, 1],
        [7, 1],
        [1, 7],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="3" height="3" fill="#000" />
          <rect x={x + 0.75} y={y + 0.75} width="1.5" height="1.5" fill="#fff" />
          <rect x={x + 1.1} y={y + 1.1} width="0.8" height="0.8" fill="#000" />
        </g>
      ))}
      {modules.map(([x, y]) => (
        <rect key={`m${x}-${y}`} x={x + 1} y={y + 1} width="1" height="1" fill="#000" />
      ))}
    </svg>
  );
}
