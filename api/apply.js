const Busboy = require("busboy");
const nodemailer = require("nodemailer");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseApplication(req) {
  return new Promise((resolve, reject) => {
    let parser;

    try {
      parser = Busboy({
        headers: req.headers,
        limits: {
          fields: 20,
          fieldSize: 20 * 1024,
          files: 1,
          fileSize: MAX_FILE_SIZE,
        },
      });
    } catch {
      reject(new Error("invalid_form"));
      return;
    }

    const fields = {};
    let resume = null;
    let uploadError = null;

    parser.on("field", (name, value) => {
      fields[name] = value.trim();
    });

    parser.on("file", (name, stream, info) => {
      if (name !== "cv") {
        stream.resume();
        return;
      }

      const chunks = [];
      const safeName = info.filename
        .replace(/[^a-zA-Z0-9._ -]/g, "")
        .slice(0, 120);

      if (!ALLOWED_TYPES.has(info.mimeType)) {
        uploadError = "invalid_file_type";
        stream.resume();
        return;
      }

      stream.on("limit", () => {
        uploadError = "file_too_large";
      });
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => {
        if (!uploadError) {
          resume = {
            content: Buffer.concat(chunks),
            contentType: info.mimeType,
            filename: safeName || "resume",
          };
        }
      });
    });

    parser.on("filesLimit", () => {
      uploadError = "too_many_files";
    });
    parser.on("error", () => reject(new Error("invalid_form")));
    parser.on("finish", () => {
      if (uploadError) {
        reject(new Error(uploadError));
        return;
      }
      resolve({ fields, resume });
    });

    req.pipe(parser);
  });
}

function validate(fields, resume) {
  if (fields.website) return "spam";

  const required = [
    "role",
    "name",
    "email",
    "phone",
    "question",
    "question-2",
    "question-3",
    "question-4",
    "question-8",
  ];

  if (required.some((field) => !fields[field])) return "missing_fields";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return "invalid_email";
  if (!/^[+()\-\s0-9]{7,20}$/.test(fields.phone)) return "invalid_phone";
  if (!resume) return "missing_resume";
  return null;
}

function redirect(res, location) {
  res.statusCode = 303;
  res.setHeader("Location", location);
  res.end();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!req.headers["content-type"]?.startsWith("multipart/form-data")) {
    res.status(415).json({ error: "A multipart form submission is required." });
    return;
  }

  try {
    const { fields, resume } = await parseApplication(req);
    const validationError = validate(fields, resume);

    if (validationError === "spam") {
      redirect(res, "/accpeted.html");
      return;
    }

    if (validationError) {
      redirect(res, `/application-error.html?reason=${validationError}`);
      return;
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const recipient = process.env.APPLICATION_TO || smtpUser;

    if (!smtpUser || !smtpPassword || !recipient) {
      throw new Error("email_not_configured");
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.hostinger.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const answers = [
      ["Challenge Resolution", fields.question],
      ["Project Proud Moment", fields["question-2"]],
      ["Portfolio Links", fields["question-3"]],
      ["Unique Skills", fields["question-4"]],
      ["Current & Expected Salary", fields["question-8"]],
    ];

    const answerHtml = answers
      .map(
        ([label, value]) =>
          `<p><strong>${escapeHtml(label)}:</strong><br>${escapeHtml(value).replaceAll("\n", "<br>")}</p>`,
      )
      .join("");

    await transporter.sendMail({
      from: `"Nuance Media Careers" <${smtpUser}>`,
      to: recipient,
      replyTo: fields.email,
      subject: `New ${fields.role} application — ${fields.name}`,
      html: `
        <h2>New career application</h2>
        <p><strong>Role:</strong> ${escapeHtml(fields.role)}</p>
        <p><strong>Name:</strong> ${escapeHtml(fields.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(fields.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(fields.phone)}</p>
        ${answerHtml}
      `,
      attachments: [resume],
    });

    redirect(res, "/accpeted.html");
  } catch (error) {
    console.error("Career application failed:", error.message);
    redirect(res, "/application-error.html?reason=server_error");
  }
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
