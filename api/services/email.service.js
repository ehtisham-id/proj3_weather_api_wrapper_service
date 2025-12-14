import transporter from "../config/email.config.js";
import pino from 'pino';

const logger = pino();

const sendEmail = async function (
    subject = "Welcome to Weather Pro",
    text = "Hello",
    html = "<h1>We welcome you to Our Api Service 🚀</h1>",
    to = process.env.DUMMY_EMAIL_TO
) {
    try {
        await transporter.sendMail({
            from: `"My App" <${process.env.EMAIL_FROM}>`,
            to: `${to}`,
            subject,
            text,
            html
        });
        logger.info("Email sent successfully");
    } catch (err) {
        logger.error(`Error sending email: ${err.message}`);
    }
}

export default sendEmail;
