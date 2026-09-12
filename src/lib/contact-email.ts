// The inbox message, drawn with the site's own tokens, type scale and hairline rules.
// Tables and inline styles throughout: Gmail strips <style> blocks, flexbox and grid.
import { SITE, SITE_URL } from "consts";

// One per site theme. Both are imported so THEME below is a real one-word switch; ?inline
// bakes them into the bundle as data: URIs, and the unused one costs ~34KB of dead string.
import logoDark from "../assets/email-logo-dark.png?inline";
import logoLight from "../assets/email-logo-light.png?inline";

export interface ContactMessage {
  name: string;
  email: string;
  app: string;
  kind: string;
  message: string;
  sentAt: Date;
}

const THEMES = {
  light: {
    bg: "#FFFFFF",
    surfaceAlt: "#EDEDEF",
    hairline: "#E3E3E6",
    text: "#131315",
    muted: "#5E5E66",
    faint: "#74747C",
    accent: "#4A5FE0",
    onAccent: "#FFFFFF",
    logo: logoLight,
  },
  dark: {
    bg: "#0B0B0C",
    surfaceAlt: "#1C1C1F",
    hairline: "#2A2A2E",
    text: "#EDEDEF",
    muted: "#8A8A92",
    faint: "#5A5A62",
    accent: "#6E8BFF",
    onAccent: "#0B0B0C",
    logo: logoDark,
  },
} as const;

const THEME: keyof typeof THEMES = "light";

const C = THEMES[THEME];

/**
 * The logo is attached and referenced as cid:, never linked from the site: most clients
 * block remote images on first open, and all but Apple Mail strip SVG outright.
 */
export const LOGO_CID = "simplify-logo";

/** --r-control and --r-card. The site is almost square-cornered; rounder reads as foreign. */
const R = { control: "4px", card: "6px" } as const;

// The site's own stacks, fallbacks included: no client is guaranteed to fetch a web font.
const SANS =
  "'Space Grotesk', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO =
  "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const paragraphs = (body: string) => {
  const parts = body.split(/\n{2,}/);
  return parts
    .map((p, i) => {
      const margin = i === parts.length - 1 ? "0" : "0 0 15px";
      return `<p style="margin:${margin};">${esc(p).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
};

const stamp = (d: Date) =>
  `${d.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  })} UTC`;

/** .kicker — mono 10.5/500, 0.09em, uppercase, --text-faint. */
const kicker = (text: string) =>
  `<div style="font-family:${MONO};font-size:10.5px;font-weight:500;letter-spacing:0.09em;text-transform:uppercase;color:${C.faint};">${esc(
    text,
  )}</div>`;

/**
 * One cell of the site's hairline card grid — a 1px grid gap on the page, a top border
 * here, which lands on the same pixel and survives Outlook.
 */
const metaRow = (label: string, value: string, first: boolean) => `
  <tr>
    <td style="padding:16px 20px;background:${C.bg};${
      first ? "" : `border-top:1px solid ${C.hairline};`
    }">
      ${kicker(label)}
      <div style="margin-top:8px;font-family:${SANS};font-size:15px;line-height:1.5;color:${C.text};">${value}</div>
    </td>
  </tr>`;

export const subjectFor = (m: ContactMessage) =>
  `${m.kind} · ${m.app} — ${m.name}`;

export function textFor(m: ContactMessage) {
  return [
    `${m.kind} · ${m.app}`,
    "",
    `From:    ${m.name} <${m.email}>`,
    `App:     ${m.app}`,
    `Kind:    ${m.kind}`,
    `Sent:    ${stamp(m.sentAt)}`,
    "",
    "---",
    "",
    m.message,
    "",
    "---",
    "",
    `Sent from the contact form at ${SITE_URL}/contact/`,
    `Reply to this email to answer ${m.name} directly.`,
  ].join("\n");
}

/**
 * @param logoSrc Usually `cid:${LOGO_CID}`, matching the attachment the endpoint sends.
 */
export function htmlFor(m: ContactMessage, logoSrc = `cid:${LOGO_CID}`) {
  const preheader = `${m.kind} · ${m.app} — from ${m.name}`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="${THEME}">
<meta name="supported-color-schemes" content="${THEME}">
<title>${esc(subjectFor(m))}</title>
<!-- Apple Mail, iOS Mail and Outlook for Mac honour this and get the site's real
     typography. Gmail drops it and lands on the same system-ui the site falls back to. -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&amp;family=IBM+Plex+Mono:wght@400;500&amp;display=swap">
</head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-font-smoothing:antialiased;">
  <!-- Inbox preview line; hidden in the message itself. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};">
    <tr>
      <td align="center" style="padding:0 24px 56px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

          <!-- The site header: the logo on a 68px bar closed by a hairline. -->
          <tr>
            <td style="height:68px;padding:22px 0 20px;border-bottom:1px solid ${C.hairline};">
              <a href="${SITE_URL}/" style="text-decoration:none;">
                <!-- Styled alt text, so a blocked or broken image still reads as the brand
                     rather than a grey placeholder box. -->
                <img src="${logoSrc}" alt="${esc(SITE)}" width="150" height="74"
                     style="display:block;border:0;width:150px;max-width:150px;height:auto;font-family:${SANS};font-size:21px;font-weight:600;letter-spacing:-0.03em;color:${C.text};text-decoration:none;">
              </a>
            </td>
          </tr>

          <!-- .intro: kicker, .page-h1, .lede -->
          <tr>
            <td style="padding:35px 0 30px;">
              ${kicker("Contact form · New message")}
              <h1 style="margin:22px 0 0;font-family:${SANS};font-size:32px;font-weight:600;letter-spacing:-0.03em;line-height:1.08;color:${C.text};">${esc(
                m.kind,
              )} · ${esc(m.app)}</h1>
              <p style="margin:22px 0 0;font-family:${SANS};font-size:16.5px;line-height:1.62;color:${C.muted};">From ${esc(
                m.name,
              )}. Replying to this email answers them directly — there is no address to copy out.</p>
            </td>
          </tr>

          <!-- The hairline card grid the rest of the site lays its facts out in. -->
          <tr>
            <td style="padding:0 0 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.hairline};border-radius:${R.card};overflow:hidden;">
                ${metaRow(
                  "From",
                  `${esc(m.name)}<br><a href="mailto:${esc(
                    m.email,
                  )}" style="font-family:${MONO};font-size:13.5px;color:${C.accent};text-decoration:none;">${esc(
                    m.email,
                  )}</a>`,
                  true,
                )}
                ${metaRow("Which app", esc(m.app), false)}
                ${metaRow("Kind of message", esc(m.kind), false)}
                ${metaRow(
                  "Sent",
                  `<span style="font-family:${MONO};font-size:13.5px;color:${C.muted};">${esc(
                    stamp(m.sentAt),
                  )}</span>`,
                  false,
                )}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 0 30px;">
              ${kicker("The message")}
              <div style="margin-top:14px;padding:20px 22px;background:${C.surfaceAlt};border-left:2px solid ${C.accent};border-radius:0 ${R.card} ${R.card} 0;font-family:${SANS};font-size:15.5px;line-height:1.62;color:${C.text};">${paragraphs(
                m.message,
              )}</div>
            </td>
          </tr>

          <!-- .btn.btn-accent: 44px tall, 0 20px, 14.5/500, --r-control. -->
          <tr>
            <td style="padding:0 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:44px;padding:0 20px;background:${C.accent};border-radius:${R.control};text-align:center;">
                    <a href="mailto:${esc(m.email)}?subject=${encodeURIComponent(
                      `Re: ${m.kind} · ${m.app}`,
                    )}" style="font-family:${SANS};font-size:14.5px;font-weight:500;line-height:44px;color:${C.onAccent};text-decoration:none;white-space:nowrap;">Reply to ${esc(
                      m.name,
                    )}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- The site footer: hairline on top, mono 11.5 in --text-faint. -->
          <tr>
            <td style="padding:26px 0 0;border-top:1px solid ${C.hairline};font-family:${MONO};font-size:11.5px;line-height:1.7;color:${C.faint};">
              Sent from the contact form at
              <a href="${SITE_URL}/contact/" style="color:${C.muted};text-decoration:none;">simplifymy.app/contact</a><br>
              No ads, no accounts, no tracking — including here.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Everything the send call needs apart from the envelope. THEME picks the attached logo,
 * so the endpoint never has to know about images.
 */
export function buildEmail(m: ContactMessage) {
  return {
    subject: subjectFor(m),
    html: htmlFor(m),
    text: textFor(m),
    attachments: [
      {
        filename: "simplify-my-app.png",
        contentType: "image/png",
        // The ?inline import is a data: URI; Resend wants the bare base64 payload.
        content: C.logo.slice(C.logo.indexOf(",") + 1),
        contentId: LOGO_CID,
      },
    ],
  };
}
