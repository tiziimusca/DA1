package com.example.auctionapp.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class SmtpEmailService implements EmailService {

    private final JavaMailSender mailSender;
    private final Logger logger = LoggerFactory.getLogger(SmtpEmailService.class);

    @Value("${spring.mail.username:}")
    private String from;

    @Value("${app.name:Auction App}")
    private String appName;

    @Autowired
    public SmtpEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void enviarCodigoRecuperacion(String to, String codigo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");

            String subject = String.format("[%s] Código de recuperación", appName);

            String html = buildHtmlBody(codigo);

            helper.setTo(to);
            if (from != null && !from.isBlank())
                helper.setFrom(from);
            helper.setSubject(subject);
            helper.setText(html, true); // true = isHtml

            mailSender.send(message);
            logger.info("Correo de recuperación enviado a {}", to);
        } catch (MessagingException ex) {
            logger.error("Error enviando email de recuperación", ex);
            throw new RuntimeException("No se pudo enviar el email de recuperación", ex);
        }
    }

    private String buildHtmlBody(String codigo) {
        StringBuilder sb = new StringBuilder();
        sb.append("<html><body style=\"font-family:Arial,Helvetica,sans-serif;color:#333;\">\n");
        sb.append(String.format("<h2 style=\"color:#2a7ae2;\">%s</h2>", appName));
        sb.append("<p>Hola,</p>");
        sb.append(
                "<p>Hemos recibido una solicitud para recuperar el acceso a tu cuenta. Usa el siguiente código para continuar:</p>");
        sb.append(String.format(
                "<div style=\"font-size:22px;font-weight:bold;margin:16px 0;padding:12px;background:#f4f6fb;border-radius:6px;display:inline-block;\">%s</div>",
                codigo));
        sb.append("<p>El código expira en 15 minutos. Si no solicitaste este código, ignora este correo.</p>");
        sb.append("<hr style=\"border:none;border-top:1px solid #eee;\">\n");
        sb.append("<p style=\"font-size:12px;color:#666;\">Gracias por confiar en nosotros.<br/>Equipo de " + appName
                + "</p>");
        sb.append("</body></html>");
        return sb.toString();
    }
}
