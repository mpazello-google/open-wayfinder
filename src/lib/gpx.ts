import { PontoGPS } from '@/types/gps';

/**
 * Generates a GPX file content from GPS points
 */
export function generateGPX(points: PontoGPS[]): string {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="OpenWayfinder" xmlns="http://www.topografix.com/GPX/1/1">`;

  const waypoints = points
    .map((point) => {
      const name = point.nome ? `    <name>${escapeXml(point.nome)}</name>` : '';
      const desc = point.descricao ? `    <desc>${escapeXml(point.descricao)}</desc>` : '';
      const ele = point.elevacao !== null ? `    <ele>${point.elevacao}</ele>` : '';

      return `  <wpt lat="${point.lat}" lon="${point.lng}">
${name}
${desc}
${ele}
  </wpt>`;
    })
    .join('\n');

  const footer = `</gpx>`;

  return `${header}
${waypoints}
${footer}`;
}

/**
 * Escapes special XML characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Downloads a GPX file with the given content
 */
export function downloadGPX(content: string, filename: string = 'waypoints.gpx'): void {
  const blob = new Blob([content], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
