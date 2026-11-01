const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Allow", "POST");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.AGENTMAIL_API_KEY;
  if (!apiKey) {
    console.error("Contact form: AGENTMAIL_API_KEY is not configured");
    return res.status(503).json({ error: "Contact email is not configured yet. Please email sales@adjaaspharma.in directly." });
  }

  try {
    const body = req.body || {};
    const name = String(body.name || "").trim().slice(0, 120);
    const email = String(body.email || "").trim().slice(0, 254);
    const interest = String(body.interest || "General enquiry").trim().slice(0, 100);
    const message = String(body.message || "").trim().slice(0, 5000);

    if (!name || !email || !message) return res.status(400).json({ error: "Please fill in all required fields." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Please enter a valid email address." });
    if (/[\r\n]/.test(email)) return res.status(400).json({ error: "Invalid email address." });

    const subject = "Website enquiry — " + interest;
    const plain = [
      "A new enquiry was submitted on adjaaspharma.in.",
      "",
      "Name: " + name,
      "Email: " + email,
      "Interested in: " + interest,
      "",
      "Message:",
      message,
      "",
      "Sent from the ADJAAS Pharmaceuticals website contact form."
    ].join("\n");
    const html = '<div style="font-family:Arial,sans-serif;color:#173d68;line-height:1.6;max-width:680px;margin:auto">' +
      '<h2 style="color:#159a9c">New ADJAAS Pharma website enquiry</h2>' +
      '<p><strong>Name:</strong> ' + escapeHtml(name) + '</p>' +
      '<p><strong>Email:</strong> ' + escapeHtml(email) + '</p>' +
      '<p><strong>Interested in:</strong> ' + escapeHtml(interest) + '</p>' +
      '<p><strong>Message:</strong></p><div style="white-space:pre-wrap;background:#f3f7fa;padding:16px;border-radius:8px">' + escapeHtml(message) + '</div>' +
      '<p style="font-size:12px;color:#687b8f">Submitted through adjaaspharma.in</p></div>';

    const response = await fetch("https://api.agentmail.to/v0/inboxes/adjaas-website@agentmail.to/messages/send", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: ["adjaaspharma@gmail.com"],
        subject,
        text: plain,
        html
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("AgentMail contact send failed:", response.status, JSON.stringify(result).slice(0, 1200));
      return res.status(502).json({ error: "We couldn't send your enquiry right now. Please email sales@adjaaspharma.in directly." });
    }
    return res.status(200).json({ ok: true, message: "Thank you! Your enquiry has been sent to ADJAAS Pharmaceuticals." });
  } catch (error) {
    console.error("Contact form error:", error?.message || error);
    return res.status(502).json({ error: "We couldn't send your enquiry right now. Please email sales@adjaaspharma.in directly." });
  }
};
