import type { APIRoute } from "astro";
import { Resend } from "resend";
import {
  CONTACT_FROM_EMAIL,
  CONTACT_TO_EMAIL,
  RESEND_API_KEY,
} from "astro:env/server";

import { CONTACT_APPS, CONTACT_KINDS } from "consts";
import { buildEmail } from "../../lib/contact-email";

export const prerender = false;

const LIMITS = { name: 80, email: 160, message: 4000 } as const;
const MIN_MESSAGE = 10;

const EMAIL_RE = /^[^\s@,]+@[^\s@,.]+\.[^\s@,]{2,}$/;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });

const seen = new Map<string, number[]>();
const MAX_PER_HOUR = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const recent = (seen.get(ip) ?? []).filter((t) => t > hourAgo);

  if (recent.length >= MAX_PER_HOUR) {
    seen.set(ip, recent);
    return true;
  }

  recent.push(now);
  seen.set(ip, recent);
  return false;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: "Malformed request." });
  }

  // Honeypot: bots fill every field.
  if (str(payload.company)) return json(200, { ok: true });

  const name = str(payload.name);
  const email = str(payload.email);
  const app = str(payload.app);
  const kind = str(payload.kind);
  const message = str(payload.message);

  if (!name || name.length > LIMITS.name) {
    return json(400, { error: "Please add your name." });
  }
  if (!EMAIL_RE.test(email) || email.length > LIMITS.email) {
    return json(400, { error: "That email address does not look right." });
  }
  if (!(CONTACT_APPS as readonly string[]).includes(app)) {
    return json(400, { error: "Pick one of the listed apps." });
  }
  if (!(CONTACT_KINDS as readonly string[]).includes(kind)) {
    return json(400, { error: "Pick one of the listed message kinds." });
  }
  if (message.length < MIN_MESSAGE) {
    return json(400, {
      error: "A few more words, so the message is answerable.",
    });
  }
  if (message.length > LIMITS.message) {
    return json(400, { error: "That message is too long for this form." });
  }

  if (rateLimited(clientAddress || "unknown")) {
    return json(429, {
      error: "That is a few messages in a row — try again a little later.",
    });
  }

  const contact = { name, email, app, kind, message, sentAt: new Date() };

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: `Simplify my app <${CONTACT_FROM_EMAIL}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: `${name} <${email}>`,
      ...buildEmail(contact),
    });

    if (error) {
      console.error("[contact] resend rejected the message:", error);
      return json(502, {
        error:
          "The message could not be sent. Please email me directly instead.",
      });
    }
  } catch (cause) {
    console.error("[contact] send failed:", cause);
    return json(502, {
      error: "The message could not be sent. Please email me directly instead.",
    });
  }

  return json(200, { ok: true });
};

export const ALL: APIRoute = () =>
  json(405, { error: "Send this form with POST." });
