package com.example.auctionapp.config;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.sql.PreparedStatement;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("!railway")
public class DataSeeder implements CommandLineRunner {

        private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

        private final JdbcTemplate jdbcTemplate;
        private final PasswordEncoder passwordEncoder;

        public DataSeeder(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
                this.jdbcTemplate = jdbcTemplate;
                this.passwordEncoder = passwordEncoder;
        }

        @Override
        @Transactional
        public void run(String... args) {
                jdbcTemplate.update("DELETE FROM paises");

                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Argentina", "AR", "Buenos Aires", "Argentina", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Bolivia", "BO", "Sucre", "Bolivia", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Brasil", "BR", "Brasilia", "Brasil", "Portugués");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Chile", "CL", "Santiago", "Chile", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Colombia", "CO", "Bogotá", "Colombia", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Costa Rica", "CR", "San José", "Costa Rica", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Cuba", "CU", "La Habana", "Cuba", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "República Dominicana", "DO", "Santo Domingo", "República Dominicana", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Ecuador", "EC", "Quito", "Ecuador", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "El Salvador", "SV", "San Salvador", "El Salvador", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Guatemala", "GT", "Ciudad de Guatemala", "Guatemala", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Honduras", "HN", "Tegucigalpa", "Honduras", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "México", "MX", "Ciudad de México", "México", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Nicaragua", "NI", "Managua", "Nicaragua", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Panamá", "PA", "Ciudad de Panamá", "Panamá", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Paraguay", "PY", "Asunción", "Paraguay", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Perú", "PE", "Lima", "Perú", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Puerto Rico", "PR", "San Juan", "Puerto Rico", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Uruguay", "UY", "Montevideo", "Uruguay", "Español");
                jdbcTemplate.update(
                                "INSERT INTO paises (nombre, nombre_corto, capital, nacionalidad, idiomas) VALUES (?, ?, ?, ?, ?)",
                                "Venezuela", "VE", "Caracas", "Venezuela", "Español");

                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-1001", "Usuario Demo", "Calle 1", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-3001", "Dueno Demo 1", "Calle 3", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-3002", "Dueno Demo 2", "Calle 32", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-3003", "Dueno Demo 3", "Calle 33", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-2001", "Cliente Demo 1", "Calle 2", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-2002", "Cliente Demo 2", "Calle 22", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-2003", "Cliente Demo 3", "Calle 23", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-3004", "Dueno Demo 4", "Calle 34", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-3005", "Dueno Demo 5", "Calle 35", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-3006", "Dueno Demo 6", "Calle 36", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-3007", "Dueno Demo 7", "Calle 37", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-3008", "Dueno Demo 8", "Calle 38", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-2004", "Cliente Demo 4", "Calle 24", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-2005", "Cliente Demo 5", "Calle 25", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-4001", "Subastador Demo 1", "Calle 4", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-4002", "Subastador Demo 2", "Calle 42", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-4003", "Subastador Demo 3", "Calle 43", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-4004", "Subastador Demo 4", "Calle 44", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-4005", "Subastador Demo 5", "Calle 45", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-4006", "Subastador Demo 6", "Calle 46", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-4007", "Subastador Demo 7", "Calle 47", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-4008", "Subastador Demo 8", "Calle 48", "Activo");

                Integer personaUsuarioId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-1001");
                Integer duenoUnoId = getInteger("SELECT identificador FROM personas WHERE documento = ?", "DNI-3001");
                Integer duenoDosId = getInteger("SELECT identificador FROM personas WHERE documento = ?", "DNI-3002");
                Integer duenoTresId = getInteger("SELECT identificador FROM personas WHERE documento = ?", "DNI-3003");
                Integer clienteUnoId = getInteger("SELECT identificador FROM personas WHERE documento = ?", "DNI-2001");
                Integer clienteDosId = getInteger("SELECT identificador FROM personas WHERE documento = ?", "DNI-2002");
                Integer clienteTresId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-2003");
                Integer duenoCuatroId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-3004");
                Integer duenoCincoId = getInteger("SELECT identificador FROM personas WHERE documento = ?", "DNI-3005");
                Integer duenoSeisId = getInteger("SELECT identificador FROM personas WHERE documento = ?", "DNI-3006");
                Integer duenoSieteId = getInteger("SELECT identificador FROM personas WHERE documento = ?", "DNI-3007");
                Integer duenoOchoId = getInteger("SELECT identificador FROM personas WHERE documento = ?", "DNI-3008");
                Integer clienteCuatroId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-2004");
                Integer clienteCincoId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-2005");
                Integer subastadorUnoId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-4001");
                Integer subastadorDosId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-4002");
                Integer subastadorTresId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-4003");
                Integer subastadorCuatroId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-4004");
                Integer subastadorCincoId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-4005");
                Integer subastadorSeisId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-4006");
                Integer subastadorSieteId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-4007");
                Integer subastadorOchoId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-4008");

                jdbcTemplate.update("INSERT INTO usuarios (email, contraseña, persona_id) VALUES (?, ?, ?)",
                                "demo@gmail.com", passwordEncoder.encode("demo123"), personaUsuarioId);
                jdbcTemplate.update("INSERT INTO usuarios (email, contraseña, persona_id) VALUES (?, ?, ?)",
                                "cliente1@gmail.com", passwordEncoder.encode("demo123"), clienteUnoId);
                jdbcTemplate.update("INSERT INTO usuarios (email, contraseña, persona_id) VALUES (?, ?, ?)",
                                "cliente2@gmail.com", passwordEncoder.encode("demo123"), clienteDosId);
                jdbcTemplate.update("INSERT INTO usuarios (email, contraseña, persona_id) VALUES (?, ?, ?)",
                                "cliente3@gmail.com", passwordEncoder.encode("demo123"), clienteTresId);
                jdbcTemplate.update("INSERT INTO usuarios (email, contraseña, persona_id) VALUES (?, ?, ?)",
                                "cliente4@gmail.com", passwordEncoder.encode("demo123"), clienteCuatroId);
                jdbcTemplate.update("INSERT INTO usuarios (email, contraseña, persona_id) VALUES (?, ?, ?)",
                                "cliente5@gmail.com", passwordEncoder.encode("demo123"), clienteCincoId);

                jdbcTemplate.update("INSERT INTO empleados (cargo, sector) VALUES (?, ?)", "Verificador Demo", 100);
                jdbcTemplate.update("INSERT INTO empleados (cargo, sector) VALUES (?, ?)", "Responsable Catalogo 1",
                                200);
                jdbcTemplate.update("INSERT INTO empleados (cargo, sector) VALUES (?, ?)", "Responsable Catalogo 2",
                                201);
                jdbcTemplate.update("INSERT INTO empleados (cargo, sector) VALUES (?, ?)", "Responsable Catalogo 3",
                                202);
                jdbcTemplate.update("INSERT INTO empleados (cargo, sector) VALUES (?, ?)", "Responsable Catalogo 4",
                                203);
                jdbcTemplate.update("INSERT INTO empleados (cargo, sector) VALUES (?, ?)", "Responsable Catalogo 5",
                                204);
                jdbcTemplate.update("INSERT INTO empleados (cargo, sector) VALUES (?, ?)", "Responsable Catalogo 6",
                                205);
                jdbcTemplate.update("INSERT INTO empleados (cargo, sector) VALUES (?, ?)", "Responsable Catalogo 7",
                                206);
                jdbcTemplate.update("INSERT INTO empleados (cargo, sector) VALUES (?, ?)", "Responsable Catalogo 8",
                                207);

                Integer empleadoVerificadorId = getInteger("SELECT identificador FROM empleados WHERE cargo = ?",
                                "Verificador Demo");
                Integer responsableUnoId = getInteger("SELECT identificador FROM empleados WHERE cargo = ?",
                                "Responsable Catalogo 1");
                Integer responsableDosId = getInteger("SELECT identificador FROM empleados WHERE cargo = ?",
                                "Responsable Catalogo 2");
                Integer responsableTresId = getInteger("SELECT identificador FROM empleados WHERE cargo = ?",
                                "Responsable Catalogo 3");
                Integer responsableCuatroId = getInteger("SELECT identificador FROM empleados WHERE cargo = ?",
                                "Responsable Catalogo 4");
                Integer responsableCincoId = getInteger("SELECT identificador FROM empleados WHERE cargo = ?",
                                "Responsable Catalogo 5");
                Integer responsableSeisId = getInteger("SELECT identificador FROM empleados WHERE cargo = ?",
                                "Responsable Catalogo 6");
                Integer responsableSieteId = getInteger("SELECT identificador FROM empleados WHERE cargo = ?",
                                "Responsable Catalogo 7");
                Integer responsableOchoId = getInteger("SELECT identificador FROM empleados WHERE cargo = ?",
                                "Responsable Catalogo 8");

                jdbcTemplate.update(
                                "INSERT INTO sectores (nombre_sector, codigo_sector, responsable_sector) VALUES (?, ?, ?)",
                                "Catalogo y Operaciones", "CAT-01", responsableUnoId);
                Integer sectorId = getInteger("SELECT identificador FROM sectores WHERE codigo_sector = ?", "CAT-01");
                jdbcTemplate.update("UPDATE empleados SET sector = ? WHERE identificador = ?", sectorId,
                                responsableUnoId);

                Integer argentinaId = getInteger("SELECT numero FROM paises WHERE nombre_corto = ?", "AR");
                Integer chileId = getInteger("SELECT numero FROM paises WHERE nombre_corto = ?", "CL");

                jdbcTemplate.update(
                                "INSERT INTO duenios (identificador, numero_pais, verificacion_financiera, verificacion_judicial, calificacion_riesgo, verificador) VALUES (?, ?, ?, ?, ?, ?)",
                                duenoUnoId, argentinaId, "SI", "SI", 2, empleadoVerificadorId);
                jdbcTemplate.update(
                                "INSERT INTO duenios (identificador, numero_pais, verificacion_financiera, verificacion_judicial, calificacion_riesgo, verificador) VALUES (?, ?, ?, ?, ?, ?)",
                                duenoDosId, chileId, "SI", "SI", 3, empleadoVerificadorId);
                jdbcTemplate.update(
                                "INSERT INTO duenios (identificador, numero_pais, verificacion_financiera, verificacion_judicial, calificacion_riesgo, verificador) VALUES (?, ?, ?, ?, ?, ?)",
                                duenoTresId, argentinaId, "SI", "NO", 4, empleadoVerificadorId);
                jdbcTemplate.update(
                                "INSERT INTO duenios (identificador, numero_pais, verificacion_financiera, verificacion_judicial, calificacion_riesgo, verificador) VALUES (?, ?, ?, ?, ?, ?)",
                                duenoCuatroId, argentinaId, "SI", "SI", 2, empleadoVerificadorId);
                jdbcTemplate.update(
                                "INSERT INTO duenios (identificador, numero_pais, verificacion_financiera, verificacion_judicial, calificacion_riesgo, verificador) VALUES (?, ?, ?, ?, ?, ?)",
                                duenoCincoId, chileId, "SI", "SI", 2, empleadoVerificadorId);
                jdbcTemplate.update(
                                "INSERT INTO duenios (identificador, numero_pais, verificacion_financiera, verificacion_judicial, calificacion_riesgo, verificador) VALUES (?, ?, ?, ?, ?, ?)",
                                duenoSeisId, argentinaId, "SI", "SI", 2, empleadoVerificadorId);
                jdbcTemplate.update(
                                "INSERT INTO duenios (identificador, numero_pais, verificacion_financiera, verificacion_judicial, calificacion_riesgo, verificador) VALUES (?, ?, ?, ?, ?, ?)",
                                duenoSieteId, argentinaId, "SI", "SI", 2, empleadoVerificadorId);
                jdbcTemplate.update(
                                "INSERT INTO duenios (identificador, numero_pais, verificacion_financiera, verificacion_judicial, calificacion_riesgo, verificador) VALUES (?, ?, ?, ?, ?, ?)",
                                duenoOchoId, argentinaId, "SI", "SI", 2, empleadoVerificadorId);

                jdbcTemplate.update(
                                "INSERT INTO clientes (identificador, numero_pais, admitido, categoria, verificador) VALUES (?, ?, ?, ?, ?)",
                                clienteUnoId, chileId, "SI", "Platino", empleadoVerificadorId);
                jdbcTemplate.update(
                                "INSERT INTO clientes (identificador, numero_pais, admitido, categoria, verificador) VALUES (?, ?, ?, ?, ?)",
                                clienteDosId, argentinaId, "SI", "Oro", empleadoVerificadorId);
                jdbcTemplate.update(
                                "INSERT INTO clientes (identificador, numero_pais, admitido, categoria, verificador) VALUES (?, ?, ?, ?, ?)",
                                clienteTresId, chileId, "SI", "Comun", empleadoVerificadorId);
                jdbcTemplate.update(
                                "INSERT INTO clientes (identificador, numero_pais, admitido, categoria, verificador) VALUES (?, ?, ?, ?, ?)",
                                clienteCuatroId, argentinaId, "SI", "Platino", empleadoVerificadorId);
                jdbcTemplate.update(
                                "INSERT INTO clientes (identificador, numero_pais, admitido, categoria, verificador) VALUES (?, ?, ?, ?, ?)",
                                clienteCincoId, chileId, "SI", "Plata", empleadoVerificadorId);

                jdbcTemplate.update(
                                "INSERT INTO clientes (identificador, numero_pais, admitido, categoria, verificador) VALUES (?, ?, ?, ?, ?)",
                                personaUsuarioId, argentinaId, "SI", "Especial", empleadoVerificadorId);

                jdbcTemplate.update("INSERT INTO subastadores (identificador, matricula, region) VALUES (?, ?, ?)",
                                subastadorUnoId, "SUB-0001", "Centro");
                jdbcTemplate.update("INSERT INTO subastadores (identificador, matricula, region) VALUES (?, ?, ?)",
                                subastadorDosId, "SUB-0002", "Norte");
                jdbcTemplate.update("INSERT INTO subastadores (identificador, matricula, region) VALUES (?, ?, ?)",
                                subastadorTresId, "SUB-0003", "Sur");
                jdbcTemplate.update("INSERT INTO subastadores (identificador, matricula, region) VALUES (?, ?, ?)",
                                subastadorCuatroId, "SUB-0004", "Este");
                jdbcTemplate.update("INSERT INTO subastadores (identificador, matricula, region) VALUES (?, ?, ?)",
                                subastadorCincoId, "SUB-0005", "Oeste");
                jdbcTemplate.update("INSERT INTO subastadores (identificador, matricula, region) VALUES (?, ?, ?)",
                                subastadorSeisId, "SUB-0006", "Centro");
                jdbcTemplate.update("INSERT INTO subastadores (identificador, matricula, region) VALUES (?, ?, ?)",
                                subastadorSieteId, "SUB-0007", "Norte");
                jdbcTemplate.update("INSERT INTO subastadores (identificador, matricula, region) VALUES (?, ?, ?)",
                                subastadorOchoId, "SUB-0008", "Sur");

                jdbcTemplate.update(
                                "INSERT INTO seguros (nro_poliza, compania, poliza_combinada, importe) VALUES (?, ?, ?, ?)",
                                "POL-0001", "Seguros Demo SA 1", "SI", new BigDecimal("1250.00"));
                jdbcTemplate.update(
                                "INSERT INTO seguros (nro_poliza, compania, poliza_combinada, importe) VALUES (?, ?, ?, ?)",
                                "POL-0002", "Seguros Demo SA 2", "SI", new BigDecimal("1350.00"));
                jdbcTemplate.update(
                                "INSERT INTO seguros (nro_poliza, compania, poliza_combinada, importe) VALUES (?, ?, ?, ?)",
                                "POL-0003", "Seguros Demo SA 3", "NO", new BigDecimal("1450.00"));

                seedAuction(
                                LocalDate.now().minusDays(5),
                                LocalTime.of(19, 0),
                                "finalizada",
                                subastadorUnoId,
                                "Salon antiguo",
                                40,
                                "SI",
                                "SI",
                                "Oro",
                                "Catalogo pasado",
                                responsableUnoId,
                                new ProductSpec(
                                                "Pintura clasica europea",
                                                "Pintura del siglo XIX",
                                                empleadoVerificadorId,
                                                duenoUnoId,
                                                "POL-0001",
                                                new BigDecimal("3000.00"),
                                                new BigDecimal("250.00"),
                                                "SI",
                                                new String[] {
                                                                "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=900&q=80",
                                                                "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80",
                                                                "https://images.unsplash.com/flagged/photo-1572392640988-ba48d1a74457?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=719&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?q=80&w=390&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?q=80&w=489&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                                }),
                                new BidSpec(clienteUnoId, 1, new BigDecimal("3550.00"), "SI"),
                                "USD");

                seedAuction(
                                LocalDate.now().plusDays(2),
                                LocalTime.of(18, 30),
                                "abierta",
                                subastadorDosId,
                                "Salon principal",
                                50,
                                "SI",
                                "NO",
                                "Comun",
                                "Catalogo futuro uno",
                                responsableDosId,
                                new ProductSpec(
                                                "Reloj de pared",
                                                "Reloj antiguo de pared",
                                                empleadoVerificadorId,
                                                duenoDosId,
                                                "POL-0002",
                                                new BigDecimal("5000.00"),
                                                new BigDecimal("500.00"),
                                                "NO",
                                                new String[] {
                                                                "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1606674556490-c2bbb4ee05e5?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1633603125151-6a3c1a4778a5?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1590587754330-6fc06e3a9bb7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1558603655-491ecfa8324f?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                                }),
                                null,
                                "ARS");

                seedAuction(
                                LocalDate.now().plusDays(14),
                                LocalTime.of(20, 0),
                                "abierta",
                                subastadorTresId,
                                "Galeria norte",
                                60,
                                "SI",
                                "NO",
                                "Plata",
                                "Catalogo futuro dos",
                                responsableTresId,
                                new ProductSpec(
                                                "Bicicleta clasica",
                                                "Bicicleta restaurada",
                                                empleadoVerificadorId,
                                                duenoTresId,
                                                "POL-0003",
                                                new BigDecimal("900.00"),
                                                new BigDecimal("100.00"),
                                                "NO",
                                                new String[] {
                                                                "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=1122&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1534146789009-76ed5060ec70?q=80&w=709&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1501147830916-ce44a6359892?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1528629297340-d1d466945dc5?q=80&w=1222&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                                }),
                                null,
                                "USD");

                LocalDateTime especialTime = LocalDateTime.now().plusMinutes(3);
                LocalDate fechaEspecial = especialTime.toLocalDate();
                LocalTime horaEspecial = especialTime.toLocalTime().withNano(0);

                seedAuction(
                                fechaEspecial,
                                horaEspecial,
                                "abierta",
                                subastadorCuatroId,
                                "Salon especial",
                                30,
                                "SI",
                                "SI",
                                "Especial",
                                "Catalogo especial",
                                responsableCuatroId,
                                new ProductSpec(
                                                "Escultura moderna",
                                                "Escultura moderna del siglo XX en bronce.",
                                                empleadoVerificadorId,
                                                duenoCuatroId,
                                                "POL-0001",
                                                new BigDecimal("1200.00"),
                                                new BigDecimal("120.00"),
                                                "NO",
                                                new String[] {
                                                                "https://images.unsplash.com/photo-1566054757965-8c4085344c96?q=80&w=865&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1548811579-017cf2a4268b?q=80&w=689&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1601887389937-0b02c26b602c?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1600173293426-65190a24be72?q=80&w=1112&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1593494193844-c2bd6b1a0e16?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1591102972305-213abaa76d6f?q=80&w=436&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                                }),
                                null,
                                "ARS");

                LocalDate fechaPlatino = LocalDate.now().plusDays(5);
                LocalTime horaPlatino = LocalTime.of(15, 0);

                seedAuction(
                                fechaPlatino,
                                horaPlatino,
                                "abierta",
                                subastadorCincoId,
                                "Salon platino",
                                20,
                                "SI",
                                "SI",
                                "Platino",
                                "Catalogo de platino",
                                responsableCincoId,
                                new ProductSpec(
                                                "Anillo de diamantes",
                                                "Anillo de diamantes exclusivo de platino 950.",
                                                empleadoVerificadorId,
                                                duenoCincoId,
                                                "POL-0002",
                                                new BigDecimal("15000.00"),
                                                new BigDecimal("1500.00"),
                                                "NO",
                                                new String[] {
                                                                "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1605100804567-1ffe942b5cd6?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1607703829739-c05b7beddf60?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1613945407943-59cd755fd69e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1677045419454-e8b201856472?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1481980235850-66e47651e431?q=80&w=388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                                }),
                                null,
                                "USD");

                jdbcTemplate.update(
                                "INSERT INTO metodos_pago_banco (cliente_id, nombre_titular, dni_titular, nombre_banco, numero_cuenta, estado, extranjero, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                                clienteUnoId, "Cliente Demo 1", 12345678, "Banco Demo", "000123456789", "aprobado", true,
                                System.currentTimeMillis());

                jdbcTemplate.update(connection -> {
                        PreparedStatement statement = connection.prepareStatement(
                                        "INSERT INTO metodos_pago_cheque (cliente_id, numero_cheque, foto_frente, foto_dorso, estado, moneda, fecha_creacion, monto_disponible) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                        statement.setInt(1, clienteUnoId);
                        statement.setInt(2, 1001);
                        statement.setBytes(3, "cheque-frente".getBytes(StandardCharsets.UTF_8));
                        statement.setBytes(4, "cheque-dorso".getBytes(StandardCharsets.UTF_8));
                        statement.setString(5, "aprobado");
                        statement.setString(6, "USD");
                        statement.setLong(7, System.currentTimeMillis());
                        statement.setBigDecimal(8, new java.math.BigDecimal("15000.00"));
                        return statement;
                });

                jdbcTemplate.update(
                                "INSERT INTO metodos_pago_tarjeta (cliente_id, nombre_titular, numero_tarjeta, fecha_vencimiento, cvv, estado, internacional, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                                clienteUnoId, "Cliente Demo 1", 4111111111111111L, "12/28", "123", "aprobado", true,
                                System.currentTimeMillis());

                jdbcTemplate.update(
                                "INSERT INTO metodos_pago_tarjeta (cliente_id, nombre_titular, numero_tarjeta, fecha_vencimiento, cvv, estado, internacional, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                                personaUsuarioId, "Usuario Demo", 5111111111111111L, "12/29", "456", "aprobado", true,
                                System.currentTimeMillis());
                jdbcTemplate.update(
                                "INSERT INTO metodos_pago_tarjeta (cliente_id, nombre_titular, numero_tarjeta, fecha_vencimiento, cvv, estado, internacional, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                                personaUsuarioId, "Usuario Demo", 5111111111112222L, "06/34", "123", "aprobado", false,
                                System.currentTimeMillis());

                Integer catalogo2Id = getInteger("SELECT identificador FROM catalogos WHERE descripcion = ?",
                                "Catalogo futuro uno");

                jdbcTemplate.update(
                                "INSERT INTO productos (fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio, seguro) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                LocalDate.now(), "SI", "Reloj Rolex Daytona",
                                "Importante reloj de mano Rolex Daytona en oro de 18k, cronógrafo automático, modelo 2021 en estado de colección.",
                                empleadoVerificadorId, duenoDosId, "POL-0002");

                Integer relojId = getInteger("SELECT identificador FROM productos WHERE descripcion_completa = ?",
                                "Importante reloj de mano Rolex Daytona en oro de 18k, cronógrafo automático, modelo 2021 en estado de colección.");

                String relojUrl = "https://images.unsplash.com/photo-1639006570490-79c0c53f1080?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                byte[] fotoRelojBytes = relojUrl.getBytes(StandardCharsets.UTF_8);
                jdbcTemplate.update("INSERT INTO fotos (producto, foto) VALUES (?, ?)", relojId, fotoRelojBytes);
                String relojUrl2 = "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1180&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                byte[] fotoRelojBytes2 = relojUrl2.getBytes(StandardCharsets.UTF_8);
                jdbcTemplate.update("INSERT INTO fotos (producto, foto) VALUES (?, ?)", relojId, fotoRelojBytes2);
                String relojUrl3 = "https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                byte[] fotoRelojBytes3 = relojUrl3.getBytes(StandardCharsets.UTF_8);
                jdbcTemplate.update("INSERT INTO fotos (producto, foto) VALUES (?, ?)", relojId, fotoRelojBytes3);
                String relojUrl4 = "https://images.unsplash.com/photo-1639006570490-79c0c53f1080?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                byte[] fotoRelojBytes4 = relojUrl4.getBytes(StandardCharsets.UTF_8);
                jdbcTemplate.update("INSERT INTO fotos (producto, foto) VALUES (?, ?)", relojId, fotoRelojBytes4);
                String relojUrl5 = "https://images.unsplash.com/photo-1662384197911-e82189f4dc60?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                byte[] fotoRelojBytes5 = relojUrl5.getBytes(StandardCharsets.UTF_8);
                jdbcTemplate.update("INSERT INTO fotos (producto, foto) VALUES (?, ?)", relojId, fotoRelojBytes5);
                String relojUrl6 = "https://images.unsplash.com/photo-1670404160620-a3a86428560e?q=80&w=725&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                byte[] fotoRelojBytes6 = relojUrl6.getBytes(StandardCharsets.UTF_8);
                jdbcTemplate.update("INSERT INTO fotos (producto, foto) VALUES (?, ?)", relojId, fotoRelojBytes6);

                jdbcTemplate.update(
                                "INSERT INTO items_catalogo (catalogo, producto, precio_base, comision, subastado) VALUES (?, ?, ?, ?, ?)",
                                catalogo2Id, relojId, new BigDecimal("25000.00"), new BigDecimal("2500.00"), "NO");

                jdbcTemplate.update(
                                "INSERT INTO subastas (fecha, hora, estado, subastador, ubicacion, capacidad_asistentes, tiene_deposito, seguridad_propia, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                LocalDate.now().minusDays(3), Time.valueOf(LocalTime.of(15, 0)), "finalizada",
                                subastadorSeisId, "Salon Rolex", 30, "SI", "SI", "Oro");
                Integer subastaRolexId = getInteger("SELECT identificador FROM subastas WHERE ubicacion = ?",
                                "Salon Rolex");
                jdbcTemplate.update("INSERT INTO subastas_monedas (subasta_id, moneda) VALUES (?, ?)", subastaRolexId, "USD");

                jdbcTemplate.update("INSERT INTO catalogos (descripcion, subasta, responsable) VALUES (?, ?, ?)",
                                "Subasta Rolex", subastaRolexId, responsableSeisId);
                Integer catalogoRolexId = getInteger("SELECT identificador FROM catalogos WHERE descripcion = ?",
                                "Subasta Rolex");

                jdbcTemplate.update(
                                "INSERT INTO productos (fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio, seguro) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                LocalDate.now(), "SI", "Reloj Rolex", "Reloj Rolex de colección", empleadoVerificadorId,
                                duenoSeisId, "POL-0001");
                Integer productoRolexId = getInteger(
                                "SELECT identificador FROM productos WHERE descripcion_completa = ?",
                                "Reloj Rolex de colección");

                jdbcTemplate.update("INSERT INTO fotos (producto, foto) VALUES (?, ?)", productoRolexId,
                                "https://images.unsplash.com/photo-1639006570490-79c0c53f1080?q=80&w=200&auto=format&fit=crop"
                                                .getBytes(StandardCharsets.UTF_8));

                jdbcTemplate.update(
                                "INSERT INTO items_catalogo (catalogo, producto, precio_base, comision, subastado) VALUES (?, ?, ?, ?, ?)",
                                catalogoRolexId, productoRolexId, new BigDecimal("4000.00"), new BigDecimal("400.00"),
                                "SI");
                Integer itemRolexId = getInteger("SELECT identificador FROM items_catalogo WHERE producto = ?",
                                productoRolexId);

                jdbcTemplate.update("INSERT INTO asistentes (numero_postor, cliente, subasta) VALUES (?, ?, ?)", 12,
                                personaUsuarioId, subastaRolexId);
                Integer asistenteRolexId = getInteger(
                                "SELECT identificador FROM asistentes WHERE cliente = ? AND subasta = ?",
                                personaUsuarioId, subastaRolexId);

                jdbcTemplate.update("INSERT INTO pujos (asistente, item, importe, ganador) VALUES (?, ?, ?, ?)",
                                asistenteRolexId, itemRolexId, new BigDecimal("4400.00"), "SI");

                jdbcTemplate.update(
                                "INSERT INTO subastas (fecha, hora, estado, subastador, ubicacion, capacidad_asistentes, tiene_deposito, seguridad_propia, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                LocalDate.now().minusDays(2), Time.valueOf(LocalTime.of(16, 0)), "finalizada",
                                subastadorSieteId, "Salon Mustang", 30, "SI", "SI", "Especial");
                Integer subastaMustangId = getInteger("SELECT identificador FROM subastas WHERE ubicacion = ?",
                                "Salon Mustang");
                jdbcTemplate.update("INSERT INTO subastas_monedas (subasta_id, moneda) VALUES (?, ?)", subastaMustangId, "USD");

                jdbcTemplate.update("INSERT INTO catalogos (descripcion, subasta, responsable) VALUES (?, ?, ?)",
                                "Subasta Mustang", subastaMustangId, responsableSieteId);
                Integer catalogoMustangId = getInteger("SELECT identificador FROM catalogos WHERE descripcion = ?",
                                "Subasta Mustang");

                jdbcTemplate.update(
                                "INSERT INTO productos (fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio, seguro) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                LocalDate.now(), "SI", "1967 Mustang", "Ford Mustang 1967 impecable",
                                empleadoVerificadorId, duenoSieteId, "POL-0002");
                Integer productoMustangId = getInteger(
                                "SELECT identificador FROM productos WHERE descripcion_completa = ?",
                                "Ford Mustang 1967 impecable");

                jdbcTemplate.update("INSERT INTO fotos (producto, foto) VALUES (?, ?)", productoMustangId,
                                "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?q=80&w=200&auto=format&fit=crop"
                                                .getBytes(StandardCharsets.UTF_8));

                jdbcTemplate.update(
                                "INSERT INTO items_catalogo (catalogo, producto, precio_base, comision, subastado) VALUES (?, ?, ?, ?, ?)",
                                catalogoMustangId, productoMustangId, new BigDecimal("120000.00"),
                                new BigDecimal("10000.00"), "SI");
                Integer itemMustangId = getInteger("SELECT identificador FROM items_catalogo WHERE producto = ?",
                                productoMustangId);

                jdbcTemplate.update("INSERT INTO asistentes (numero_postor, cliente, subasta) VALUES (?, ?, ?)", 12,
                                personaUsuarioId, subastaMustangId);
                Integer asistenteMustangId = getInteger(
                                "SELECT identificador FROM asistentes WHERE cliente = ? AND subasta = ?",
                                personaUsuarioId, subastaMustangId);

                jdbcTemplate.update("INSERT INTO pujos (asistente, item, importe, ganador) VALUES (?, ?, ?, ?)",
                                asistenteMustangId, itemMustangId, new BigDecimal("130000.00"), "SI");

                jdbcTemplate.update(
                                "INSERT INTO subastas (fecha, hora, estado, subastador, ubicacion, capacidad_asistentes, tiene_deposito, seguridad_propia, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                LocalDate.now().minusDays(1), Time.valueOf(LocalTime.of(17, 0)), "finalizada",
                                subastadorOchoId, "Salon Horizonte", 30, "SI", "SI", "Comun");
                Integer subastaHorizonteId = getInteger("SELECT identificador FROM subastas WHERE ubicacion = ?",
                                "Salon Horizonte");
                jdbcTemplate.update("INSERT INTO subastas_monedas (subasta_id, moneda) VALUES (?, ?)", subastaHorizonteId, "ARS");

                jdbcTemplate.update("INSERT INTO catalogos (descripcion, subasta, responsable) VALUES (?, ?, ?)",
                                "Subasta Horizonte", subastaHorizonteId, responsableOchoId);
                Integer catalogoHorizonteId = getInteger("SELECT identificador FROM catalogos WHERE descripcion = ?",
                                "Subasta Horizonte");

                jdbcTemplate.update(
                                "INSERT INTO productos (fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio, seguro) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                LocalDate.now(), "SI", "Horizonte No. 4", "Cuadro abstracto Horizonte No. 4",
                                empleadoVerificadorId, duenoOchoId, "POL-0003");
                Integer productoHorizonteId = getInteger(
                                "SELECT identificador FROM productos WHERE descripcion_completa = ?",
                                "Cuadro abstracto Horizonte No. 4");

                jdbcTemplate.update("INSERT INTO fotos (producto, foto) VALUES (?, ?)", productoHorizonteId,
                                "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=200&auto=format&fit=crop"
                                                .getBytes(StandardCharsets.UTF_8));

                jdbcTemplate.update(
                                "INSERT INTO items_catalogo (catalogo, producto, precio_base, comision, subastado) VALUES (?, ?, ?, ?, ?)",
                                catalogoHorizonteId, productoHorizonteId, new BigDecimal("250000.00"),
                                new BigDecimal("7000.00"), "SI");
                Integer itemHorizonteId = getInteger("SELECT identificador FROM items_catalogo WHERE producto = ?",
                                productoHorizonteId);

                jdbcTemplate.update("INSERT INTO asistentes (numero_postor, cliente, subasta) VALUES (?, ?, ?)", 12,
                                personaUsuarioId, subastaHorizonteId);
                Integer asistenteHorizonteUserId = getInteger(
                                "SELECT identificador FROM asistentes WHERE cliente = ? AND subasta = ?",
                                personaUsuarioId, subastaHorizonteId);

                jdbcTemplate.update("INSERT INTO pujos (asistente, item, importe, ganador) VALUES (?, ?, ?, ?)",
                                asistenteHorizonteUserId, itemHorizonteId, new BigDecimal("257000.00"), "no");

                jdbcTemplate.update("INSERT INTO asistentes (numero_postor, cliente, subasta) VALUES (?, ?, ?)", 15,
                                clienteUnoId, subastaHorizonteId);
                Integer asistenteHorizonteOtherId = getInteger(
                                "SELECT identificador FROM asistentes WHERE cliente = ? AND subasta = ?", clienteUnoId,
                                subastaHorizonteId);

                jdbcTemplate.update("INSERT INTO pujos (asistente, item, importe, ganador) VALUES (?, ?, ?, ?)",
                                asistenteHorizonteOtherId, itemHorizonteId, new BigDecimal("260000.00"), "SI");

                log.info("Datos iniciales creados correctamente");
        }

        private boolean hasSeedData() {
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM personas", Integer.class);
                return count != null && count > 0;
        }

        private Integer getInteger(String sql, Object... args) {
                Integer value = jdbcTemplate.queryForObject(sql, Integer.class, args);
                if (value == null) {
                        throw new IllegalStateException("No se encontro el valor esperado para: " + sql);
                }
                return value;
        }

        private void seedAuction(
                        LocalDate fecha,
                        LocalTime hora,
                        String estado,
                        Integer subastadorId,
                        String ubicacion,
                        Integer capacidadAsistentes,
                        String tieneDeposito,
                        String seguridadPropia,
                        String categoria,
                        String catalogoDescripcion,
                        Integer responsableId,
                        ProductSpec product,
                        BidSpec bid,
                        String moneda) {

                jdbcTemplate.update(
                                "INSERT INTO subastas (fecha, hora, estado, subastador, ubicacion, capacidad_asistentes, tiene_deposito, seguridad_propia, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                fecha, Time.valueOf(hora), estado, subastadorId, ubicacion, capacidadAsistentes,
                                tieneDeposito,
                                seguridadPropia, categoria);
                Integer subastaId = getInteger("SELECT identificador FROM subastas WHERE ubicacion = ?", ubicacion);
                jdbcTemplate.update("INSERT INTO subastas_monedas (subasta_id, moneda) VALUES (?, ?)", subastaId, moneda);

                jdbcTemplate.update("INSERT INTO catalogos (descripcion, subasta, responsable) VALUES (?, ?, ?)",
                                catalogoDescripcion, subastaId, responsableId);
                Integer catalogoId = getInteger("SELECT identificador FROM catalogos WHERE descripcion = ?",
                                catalogoDescripcion);

                jdbcTemplate.update(
                                "INSERT INTO productos (fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio, seguro) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                LocalDate.now(), "SI", product.descripcionCatalogo(), product.descripcionCompleta(),
                                product.revisorId(), product.duenioId(), product.seguro());
                Integer productoId = getInteger("SELECT identificador FROM productos WHERE descripcion_completa = ?",
                                product.descripcionCompleta());

                for (String url : product.photoUrls()) {
                        jdbcTemplate.update("INSERT INTO fotos (producto, foto) VALUES (?, ?)", productoId,
                                        url.getBytes(StandardCharsets.UTF_8));
                }

                jdbcTemplate.update(
                                "INSERT INTO items_catalogo (catalogo, producto, precio_base, comision, subastado) VALUES (?, ?, ?, ?, ?)",
                                catalogoId, productoId, product.precioBase(), product.comision(), product.subastado());
                Integer itemId = getInteger("SELECT identificador FROM items_catalogo WHERE producto = ?", productoId);

                if (bid != null) {
                        jdbcTemplate.update("INSERT INTO asistentes (numero_postor, cliente, subasta) VALUES (?, ?, ?)",
                                        bid.numeroPostor(), bid.clienteId(), subastaId);
                        Integer asistenteId = getInteger(
                                        "SELECT identificador FROM asistentes WHERE cliente = ? AND subasta = ?",
                                        bid.clienteId(), subastaId);

                        jdbcTemplate.update("INSERT INTO pujos (asistente, item, importe, ganador) VALUES (?, ?, ?, ?)",
                                        asistenteId, itemId, bid.importe(), bid.ganador());

                        jdbcTemplate.update(
                                        "INSERT INTO registro_de_subasta (subasta, duenio, producto, cliente, importe, comision) VALUES (?, ?, ?, ?, ?, ?)",
                                        subastaId, product.duenioId(), productoId, bid.clienteId(), bid.importe(),
                                        product.comision());
                }
        }

        private record ProductSpec(
                        String descripcionCatalogo,
                        String descripcionCompleta,
                        Integer revisorId,
                        Integer duenioId,
                        String seguro,
                        BigDecimal precioBase,
                        BigDecimal comision,
                        String subastado,
                        String[] photoUrls) {
        }

        private record BidSpec(Integer clienteId, Integer numeroPostor, BigDecimal importe, String ganador) {
        }
}