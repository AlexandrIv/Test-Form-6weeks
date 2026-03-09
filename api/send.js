import { google } from "googleapis";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    try {
        const { name, email, message } = req.body;

        const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
        const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
        const REDIRECT_URI = "https://developers.google.com/oauthplayground"; // або свій redirect
        const TO_EMAIL = process.env.GMAIL_TO;

        const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

        // отримує access token з Client ID + Client Secret (Node.js сервер)
        const { token } = await oAuth2Client.getAccessToken();

        const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

        const body = `Name: ${name || "n/a"}\nEmail: ${email}\nMessage:\n${message || "n/a"}`;

        const raw = Buffer.from(
            `To: ${TO_EMAIL}\r\n` +
            `Subject: Contact Form\r\n` +
            `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
            body
        ).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');

        await gmail.users.messages.send({
            userId: "me",
            requestBody: { raw }
        });

        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}