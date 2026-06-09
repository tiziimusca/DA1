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

    @Value("${spring.mail.properties.mail.smtp.from:}")
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

            String subject = String.format("Código de recuperación - Abast", appName);

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

    @Override
    public void enviarConfirmacionRegistro(String to, String nombre) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");

            String subject = String.format("Registro recibido - Abast", appName);
            String html = buildRegistrationBody(nombre);

            helper.setTo(to);
            if (from != null && !from.isBlank()) {
                helper.setFrom(from);
            }
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);
            logger.info("Correo de confirmación de registro enviado a {}", to);
        } catch (MessagingException ex) {
            logger.error("Error enviando email de confirmación de registro", ex);
            throw new RuntimeException("No se pudo enviar el email de confirmación de registro", ex);
        }
    }

    private String buildHtmlBody(String codigo) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div style=\"background-color:#f4f7f6;padding:40px 20px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;\">\n");
        sb.append("  <div style=\"max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);\">\n");
        sb.append("    <div style=\"background-color:#2a7ae2;padding:30px;text-align:center;\">\n");
        sb.append("    </div>\n");
        sb.append("    <div style=\"padding:40px 30px;color:#333333;line-height:1.6;font-size:16px;\">\n");
        sb.append("      <p style=\"margin-top:0;\">Hola,</p>\n");
        sb.append("      <p>Hemos recibido una solicitud para generar una nueva contraseña en tu cuenta de Abast. Usa el siguiente código para continuar:</p>\n");
        sb.append("      <div style=\"text-align:center;margin:30px 0;\">\n");
        sb.append(String.format("        <span style=\"font-size:28px;font-weight:bold;letter-spacing:4px;color:#2a7ae2;background:#f4f6fb;padding:15px 30px;border-radius:8px;display:inline-block;\">%s</span>\n", codigo));
        sb.append("      </div>\n");
        sb.append("      <p>El código expira en 15 minutos. Si no solicitaste este código, ignora este correo.</p>\n");
        sb.append("    </div>\n");
        sb.append("    <div style=\"background-color:#f9f9f9;padding:20px;text-align:center;color:#888888;font-size:14px;border-top:1px solid #eeeeee;\">\n");
        sb.append("      <p style=\"margin:0;\">Gracias por confiar en nosotros.</p>\n");
        sb.append("      <p style=\"margin:5px 0 0 0;\"><strong>Equipo de Abast</strong></p>\n");
        sb.append("    </div>\n");
        sb.append("  </div>\n");
        sb.append("</div>");
        return sb.toString();
    }

    private String buildRegistrationBody(String nombre) {
        String displayName = (nombre == null || nombre.isBlank()) ? "" : nombre.trim();
        StringBuilder sb = new StringBuilder();
        sb.append("<div style=\"background-color:#f4f7f6;padding:40px 20px;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;\">\n");
        sb.append("  <div style=\"max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);\">\n");
        sb.append("    <div style=\"background-color:#2a7ae2;padding:30px;text-align:center;\">\n");
        sb.append("    </div>\n");
        sb.append("    <div style=\"padding:40px 30px;color:#333333;line-height:1.6;font-size:16px;\">\n");
        sb.append("      <p style=\"margin-top:0;\">Hola" + (displayName.isEmpty() ? "" : " <strong>" + displayName + "</strong>") + ",</p>\n");
        sb.append("      <p>Recibimos tu solicitud de registro correctamente.</p>\n");
        sb.append("      <p>Te notificamos que tu cuenta ha sido verificada y ya se encuentra <strong style=\"color:#2a7ae2;\">activa</strong>.</p>\n");
        sb.append("      <div style=\"background-color:#f4f6fb;padding:20px;border-radius:8px;margin:25px 0;border-left:4px solid #2a7ae2;\">\n");
        sb.append("        <p style=\"margin:0 0 10px 0;\"><strong>Próximos pasos:</strong></p>\n");
        sb.append("        <p style=\"margin:0;\">Para completar tu acceso, ingresa al apartado <strong>Generar una nueva contraseña</strong> en la aplicación y solicita tu código de acceso.</p>\n");
        sb.append("      </div>\n");
        sb.append("      <p>Una vez que recibas el código, podrás usarlo para definir tu nueva contraseña y acceder a todas las funcionalidades.</p>\n");
        sb.append("    </div>\n");
        sb.append("    <div style=\"background-color:#f9f9f9;padding:20px;text-align:center;color:#888888;font-size:14px;border-top:1px solid #eeeeee;\">\n");
        sb.append("      <p style=\"margin:0;\">Gracias por confiar en nosotros.</p>\n");
        sb.append("      <p style=\"margin:5px 0 0 0;\"><strong>Equipo de Abast</strong></p>\n");
        sb.append("    </div>\n");
        sb.append("  </div>\n");
        sb.append("</div>");
        return sb.toString();
    }
}
