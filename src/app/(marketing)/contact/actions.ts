"use server";

type ContactInput = {
    name: string;
    email: string;
    subject: string;
    body: string;
};

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function sendContactMessage(
    input: ContactInput
): Promise<{ ok: true } | { ok: false; error: string }> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const subject = input.subject.trim();
    const body = input.body.trim();

    if (!name || !email || !subject || !body) {
        return { ok: false, error: "All fields are required." };
    }
    if (!isValidEmail(email)) {
        return { ok: false, error: "Please enter a valid email." };
    }
    if (body.length > 4000) {
        return { ok: false, error: "Message is too long." };
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_EMAIL_TO ?? "support@leadgen.example.com";
    const from = process.env.CONTACT_EMAIL_FROM ?? "noreply@leadgen.example.com";

    if (!apiKey) {
        console.log("[contact] RESEND_API_KEY not set — logging instead:", { name, email, subject, body });
        return { ok: true };
    }

    try {
        const { Resend } = await import("resend");
        const resend = new Resend(apiKey);

        await resend.emails.send({
            from,
            to,
            replyTo: email,
            subject: `[Contact] ${subject}`,
            text: `From: ${name} <${email}>\n\n${body}`,
        });

        return { ok: true };
    } catch (err) {
        console.error("[contact] send failed:", err);
        return { ok: false, error: "Could not send message. Please try again later." };
    }
}