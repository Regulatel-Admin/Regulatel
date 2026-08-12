/**
 * Plantilla HTML de correos REGULATEL (compatible con Gmail).
 * El logo vive en /images/regulatel-logo.png (fondo negro).
 */

export function siteBaseUrl() {
  return (
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.regulatel.org")
  ).replace(/\/$/, "");
}

export function logoUrl() {
  return `${siteBaseUrl()}/images/regulatel-logo.png`;
}

const NAVY = "#163d59";
const BLUE = "#4489c6";
const LIME = "#bdd034";
const MUTED = "#6b7c8a";

export function emailButton(href: string, label: string, variant: "primary" | "ghost" = "primary") {
  const styles =
    variant === "ghost"
      ? "background-color:#ffffff;color:#b91c1c;border:2px solid #b91c1c;"
      : `background-color:${BLUE};color:#ffffff;border:2px solid ${BLUE};`;
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;margin:0 8px 8px 0;">
      <tr>
        <td align="center" style="${styles}border-radius:10px;">
          <a href="${href}" style="display:inline-block;padding:13px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;text-decoration:none;color:inherit;letter-spacing:0.02em;">${label}</a>
        </td>
      </tr>
    </table>`;
}

export function wrapEmailHtml(params: {
  preheader?: string;
  title: string;
  bodyHtml: string;
  footerNote?: string;
}) {
  const preheader = params.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${params.preheader}</div>`
    : "";
  const footerNote = params.footerNote
    ? `<p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#c5d4e0;">${params.footerNote}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${params.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#e8eef3;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e8eef3;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td align="center" style="background-color:#000000;padding:28px 24px 22px;">
              <a href="${siteBaseUrl()}" style="text-decoration:none;">
                <img src="${logoUrl()}" width="220" alt="REGULATEL" style="display:block;width:220px;max-width:80%;height:auto;border:0;" />
              </a>
              <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#9bb8cc;">Foro Latinoamericano de Entes Reguladores de Telecomunicaciones</p>
            </td>
          </tr>
          <tr>
            <td style="height:5px;line-height:5px;font-size:0;background-color:${BLUE};">&nbsp;</td>
          </tr>
          <tr>
            <td style="height:3px;line-height:3px;font-size:0;background-color:${LIME};">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px 28px 8px;">
              <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.3;color:${NAVY};">${params.title}</h1>
              ${params.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${MUTED};">Este mensaje fue enviado por el portal de REGULATEL.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:${NAVY};padding:22px 28px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#ffffff;">REGULATEL</p>
              <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#c5d4e0;">
                <a href="${siteBaseUrl()}" style="color:${LIME};text-decoration:none;">www.regulatel.org</a>
              </p>
              ${footerNote}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const EMAIL_NAVY = NAVY;
export const EMAIL_MUTED = MUTED;
