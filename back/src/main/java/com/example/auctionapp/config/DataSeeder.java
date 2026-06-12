package com.example.auctionapp.config;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.sql.PreparedStatement;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
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
                // Reemplazamos/insertamos explícitamente la lista de países en el mismo orden
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
                                "DNI-4001", "Subastador Demo 1", "Calle 4", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-4002", "Subastador Demo 2", "Calle 42", "Activo");
                jdbcTemplate.update("INSERT INTO personas (documento, nombre, direccion, estado) VALUES (?, ?, ?, ?)",
                                "DNI-4003", "Subastador Demo 3", "Calle 43", "Activo");

                Integer personaUsuarioId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-1001");
                Integer duenoUnoId = getInteger("SELECT identificador FROM personas WHERE documento = ?", "DNI-3001");
                Integer duenoDosId = getInteger("SELECT identificador FROM personas WHERE documento = ?", "DNI-3002");
                Integer duenoTresId = getInteger("SELECT identificador FROM personas WHERE documento = ?", "DNI-3003");
                Integer clienteUnoId = getInteger("SELECT identificador FROM personas WHERE documento = ?", "DNI-2001");
                Integer clienteDosId = getInteger("SELECT identificador FROM personas WHERE documento = ?", "DNI-2002");
                Integer clienteTresId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-2003");
                Integer subastadorUnoId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-4001");
                Integer subastadorDosId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-4002");
                Integer subastadorTresId = getInteger("SELECT identificador FROM personas WHERE documento = ?",
                                "DNI-4003");

                jdbcTemplate.update("INSERT INTO usuarios (email, contraseña, persona_id) VALUES (?, ?, ?)",
                                "demo@gmail.com", passwordEncoder.encode("demo123"), personaUsuarioId);

                jdbcTemplate.update("INSERT INTO empleados (cargo, sector) VALUES (?, ?)", "Verificador Demo", 100);
                jdbcTemplate.update("INSERT INTO empleados (cargo, sector) VALUES (?, ?)", "Responsable Catalogo 1",
                                200);
                jdbcTemplate.update("INSERT INTO empleados (cargo, sector) VALUES (?, ?)", "Responsable Catalogo 2",
                                201);
                jdbcTemplate.update("INSERT INTO empleados (cargo, sector) VALUES (?, ?)", "Responsable Catalogo 3",
                                202);

                Integer empleadoVerificadorId = getInteger("SELECT identificador FROM empleados WHERE cargo = ?",
                                "Verificador Demo");
                Integer responsableUnoId = getInteger("SELECT identificador FROM empleados WHERE cargo = ?",
                                "Responsable Catalogo 1");
                Integer responsableDosId = getInteger("SELECT identificador FROM empleados WHERE cargo = ?",
                                "Responsable Catalogo 2");
                Integer responsableTresId = getInteger("SELECT identificador FROM empleados WHERE cargo = ?",
                                "Responsable Catalogo 3");

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
                                "INSERT INTO clientes (identificador, numero_pais, admitido, categoria, verificador) VALUES (?, ?, ?, ?, ?)",
                                clienteUnoId, chileId, "SI", "A", empleadoVerificadorId);
                jdbcTemplate.update(
                                "INSERT INTO clientes (identificador, numero_pais, admitido, categoria, verificador) VALUES (?, ?, ?, ?, ?)",
                                clienteDosId, argentinaId, "SI", "B", empleadoVerificadorId);
                jdbcTemplate.update(
                                "INSERT INTO clientes (identificador, numero_pais, admitido, categoria, verificador) VALUES (?, ?, ?, ?, ?)",
                                clienteTresId, chileId, "SI", "C", empleadoVerificadorId);

                jdbcTemplate.update(
                                "INSERT INTO clientes (identificador, numero_pais, admitido, categoria, verificador) VALUES (?, ?, ?, ?, ?)",
                                personaUsuarioId, argentinaId, "SI", "A", empleadoVerificadorId);

                jdbcTemplate.update("INSERT INTO subastadores (identificador, matricula, region) VALUES (?, ?, ?)",
                                subastadorUnoId, "SUB-0001", "Centro");
                jdbcTemplate.update("INSERT INTO subastadores (identificador, matricula, region) VALUES (?, ?, ?)",
                                subastadorDosId, "SUB-0002", "Norte");
                jdbcTemplate.update("INSERT INTO subastadores (identificador, matricula, region) VALUES (?, ?, ?)",
                                subastadorTresId, "SUB-0003", "Sur");

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
                                                "NO",
                                                new String[] {
                                                                "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=900&q=80",
                                                                "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80",
                                                                "https://images.unsplash.com/flagged/photo-1572392640988-ba48d1a74457?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=719&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?q=80&w=390&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                                                                "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?q=80&w=489&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                                }),
                                new BidSpec(clienteUnoId, 1, new BigDecimal("3550.00"), "SI"));

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
                                new BidSpec(clienteDosId, 2, new BigDecimal("6200.00"), "SI"));

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
                                new BidSpec(clienteTresId, 3, new BigDecimal("1250.00"), "SI"));

                jdbcTemplate.update(
                                "INSERT INTO metodos_pago_banco (cliente_id, nombre_titular, dni_titular, nombre_banco, numero_cuenta, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                clienteUnoId, "Cliente Demo 1", 12345678, "Banco Demo", "000123456789", "aprobado",
                                System.currentTimeMillis());

                jdbcTemplate.update(connection -> {
                        PreparedStatement statement = connection.prepareStatement(
                                        "INSERT INTO metodos_pago_cheque (cliente_id, numero_cheque, foto_frente, foto_dorso, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?)");
                        statement.setInt(1, clienteUnoId);
                        statement.setInt(2, 1001);
                        statement.setBytes(3, "cheque-frente".getBytes(StandardCharsets.UTF_8));
                        statement.setBytes(4, "cheque-dorso".getBytes(StandardCharsets.UTF_8));
                        statement.setString(5, "en_revision");
                        statement.setLong(6, System.currentTimeMillis());
                        return statement;
                });

                jdbcTemplate.update(
                                "INSERT INTO metodos_pago_tarjeta (cliente_id, nombre_titular, numero_tarjeta, fecha_vencimiento, cvv, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                clienteUnoId, "Cliente Demo 1", 4111111111111111L, "12/28", "123", "aprobado",
                                System.currentTimeMillis());

                // --- Agregar producto "Reloj de mano importante" al Catalogo 2 ("Catalogo
                // futuro uno") ---
                Integer catalogo2Id = getInteger("SELECT identificador FROM catalogos WHERE descripcion = ?",
                                "Catalogo futuro uno");

                jdbcTemplate.update(
                                "INSERT INTO productos (fecha, disponible, descripcion_catalogo, descripcion_completa, revisor, duenio, seguro) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                LocalDate.now(), "SI", "Reloj Rolex Daytona",
                                "Importante reloj de mano Rolex Daytona en oro de 18k, cronógrafo automático, modelo 2021 en estado de colección.",
                                empleadoVerificadorId, duenoDosId, "POL-0002");

                Integer relojId = getInteger("SELECT identificador FROM productos WHERE descripcion_completa = ?",
                                "Importante reloj de mano Rolex Daytona en oro de 18k, cronógrafo automático, modelo 2021 en estado de colección.");

                // Guardamos la URL directamente como bytes UTF-8 para que se use como imagen
                // remota
                String relojUrl = "https://images.unsplash.com/photo-1639006570490-79c0c53f1080?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                byte[] fotoRelojBytes = relojUrl.getBytes(StandardCharsets.UTF_8);
                jdbcTemplate.update("INSERT INTO fotos (producto, foto) VALUES (?, ?)", relojId, fotoRelojBytes);

                jdbcTemplate.update(
                                "INSERT INTO items_catalogo (catalogo, producto, precio_base, comision, subastado) VALUES (?, ?, ?, ?, ?)",
                                catalogo2Id, relojId, new BigDecimal("25000.00"), new BigDecimal("2500.00"), "NO");

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
                        BidSpec bid) {

                jdbcTemplate.update(
                                "INSERT INTO subastas (fecha, hora, estado, subastador, ubicacion, capacidad_asistentes, tiene_deposito, seguridad_propia, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                                fecha, Time.valueOf(hora), estado, subastadorId, ubicacion, capacidadAsistentes,
                                tieneDeposito,
                                seguridadPropia, categoria);
                Integer subastaId = getInteger("SELECT identificador FROM subastas WHERE ubicacion = ?", ubicacion);

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