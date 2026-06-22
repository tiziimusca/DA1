package com.example.auctionapp.service;

import com.example.auctionapp.dto.MisPropuestosResponseDTO;
import com.example.auctionapp.dto.productoPropuestoDTO;
import com.example.auctionapp.dto.SeguimientoResponseDTO;
import com.example.auctionapp.dto.SeguroInfoDTO;
import com.example.auctionapp.dto.ProductoDTO;
import com.example.auctionapp.model.Producto;
import com.example.auctionapp.model.ProductoDetalle;
import com.example.auctionapp.dto.ProponerProductoDTO;
import com.example.auctionapp.model.Dueno;
import com.example.auctionapp.model.Empleado;
import com.example.auctionapp.model.Foto;
import com.example.auctionapp.model.HistorialEstado;
import com.example.auctionapp.model.Usuario;
import com.example.auctionapp.model.Persona;
import com.example.auctionapp.repository.ProductoRepository;
import com.example.auctionapp.util.MapperUtil;
import com.example.auctionapp.repository.ProductoDetalleRepository;
import com.example.auctionapp.repository.DuenoRepository;
import com.example.auctionapp.repository.EmpleadoRepository;
import com.example.auctionapp.repository.FotoRepository;
import com.example.auctionapp.repository.HistorialEstadoRepository;
import com.example.auctionapp.repository.ClienteRepository;
import com.example.auctionapp.repository.UsuarioRepository;
import com.example.auctionapp.repository.PersonaRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Base64;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

import org.springframework.transaction.annotation.Transactional;
import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProductoDetalleRepository productoDetalleRepository;
    private final FotoRepository fotoRepository;
    private final HistorialEstadoRepository historialEstadoRepository;
    private final ClienteRepository clienteRepository;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final DuenoRepository duenoRepository;
    private final PersonaRepository personaRepository;
    private final EmpleadoRepository empleadoRepository;

    public ProductoService(ProductoRepository productoRepository,
                           ProductoDetalleRepository productoDetalleRepository,
                           FotoRepository fotoRepository,
                           HistorialEstadoRepository historialEstadoRepository,
                           DuenoRepository duenoRepository,
                           ClienteRepository clienteRepository,
                           JwtService jwtService,
                           UsuarioRepository usuarioRepository,
                           PersonaRepository personaRepository,
                           EmpleadoRepository empleadoRepository) {
        this.productoRepository = productoRepository;
        this.productoDetalleRepository = productoDetalleRepository;
        this.fotoRepository = fotoRepository;
        this.historialEstadoRepository = historialEstadoRepository;
        this.duenoRepository = duenoRepository;
        this.clienteRepository = clienteRepository;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.personaRepository = personaRepository;
        this.empleadoRepository = empleadoRepository;
    }

    // ─── Helpers privados ────────────────────────────────────────────────────────

    private Usuario obtenerUsuarioDesdeToken(String authorizationHeader) {
        String token = jwtService.extraerToken(authorizationHeader);
        if (token == null || token.isBlank()) {
            throw new SecurityException("Token inválido o sesión expirada");
        }
        String email = jwtService.validarTokenAutenticacion(token);
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("Token inválido o sesión expirada"));
    }

    private void asegurarDueno(Integer duenioId) {
        if (duenioId == null || duenoRepository.existsById(duenioId)) return;
        Persona persona = personaRepository.findById(duenioId)
                .orElseThrow(() -> new IllegalArgumentException("No existe una persona para el dueño " + duenioId));
        Empleado verificador = empleadoRepository.findFirstByOrderByIdentificadorAsc();
        if (verificador == null) {
            throw new IllegalStateException("No hay empleados disponibles para asignar como verificador del dueño");
        }
        Dueno dueno = new Dueno();
        dueno.setPersona(persona);
        dueno.setVerificador(verificador);
        duenoRepository.save(dueno);
    }

    private String fotoBytesToString(byte[] bytes) {
        if (bytes == null || bytes.length == 0) return null;
        try {
            if (bytes.length < 1000) {
                String str = new String(bytes, StandardCharsets.UTF_8);
                if (str.startsWith("http")) return str;
            }
        } catch (Exception ignored) {}
        return Base64.getEncoder().encodeToString(bytes);
    }

    // ─── Consultas ───────────────────────────────────────────────────────────────

    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerPorId(Integer id) {
        return productoRepository.findById(id);
    }

    public List<Producto> obtenerDisponibles() {
        return productoRepository.findAll().stream()
                .filter(p -> "si".equalsIgnoreCase(p.getDisponible()))
                .toList();
    }

    public List<Producto> obtenerPorUsuario(Integer usuarioId) {
        return productoRepository.findByDuenio(usuarioId);
    }

    public List<ProductoDetalle> obtenerDetallesPorUsuario(Integer usuarioId) {
        return productoDetalleRepository.findByDuenio(usuarioId);
    }

    // ─── Creación ────────────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> crearProductoDetalle(ProponerProductoDTO requestDto, String authorizationHeader) {
        Usuario usuario = obtenerUsuarioDesdeToken(authorizationHeader);
        Integer usuarioId = usuario.getPersonaId();

        asegurarDueno(usuarioId);

        Producto p = MapperUtil.toProductoEntity(requestDto);
        System.out.println("DEBUG PROPOSAL: requestDto.getTitulo() = " + requestDto.getTitulo());
        System.out.println("DEBUG PROPOSAL: p.getDescripcionCatalogo() = " + p.getDescripcionCatalogo());
        p.setDuenio(usuarioId);
        p.setFecha(LocalDate.now());
        Producto productoGuardado = productoRepository.save(p);

        ProductoDetalle detalle = new ProductoDetalle();
        detalle.setProducto(productoGuardado);
        String titleVal = requestDto.getTitulo();
        if (titleVal == null || titleVal.trim().isEmpty()) {
            titleVal = requestDto.getDescripcionCatalogo();
        }
        detalle.setTitulo(titleVal);
        detalle.setFechaAceptado(null);
        detalle.setFechaEnviado(LocalDateTime.now());
        detalle.setFechaInspeccionTecnica(null);
        detalle.setFechaRevision(null);
        detalle.setFechaRechazado(null);
        detalle.setEstado("enviado");
        detalle.setSeguroEntity(null);
        detalle.setHistoria(requestDto.getHistoria());
        Boolean declPropiedad = requestDto.getDeclaracionPropiedad();
        detalle.setDeclaracionPropiedad(declPropiedad != null ? declPropiedad : true);
        detalle.setEstado("enviado");
        detalle.setFechaEnviado(LocalDateTime.now());
        productoDetalleRepository.save(detalle);

        if (requestDto.getFotos() != null) {
            for (String fotoBase64 : requestDto.getFotos()) {
                if (fotoBase64.contains(",")) fotoBase64 = fotoBase64.split(",")[1];
                Foto foto = new Foto();
                byte[] decodedBytes = Base64.getDecoder().decode(fotoBase64);
                byte[] compressedBytes = compressImage(decodedBytes);
                foto.setFoto(compressedBytes);
                foto.setProducto(productoGuardado);
                fotoRepository.save(foto);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("productoId", productoGuardado.getIdentificador());
        response.put("estado", detalle.getEstado());
        return response;
    }

    // ─── Actualización ───────────────────────────────────────────────────────────

    // Método interno reutilizado por actualizarProducto
    private Producto actualizar(Integer id, Producto producto) {
        return productoRepository.findById(id)
                .map(existing -> {
                    if (producto.getDisponible() != null) existing.setDisponible(producto.getDisponible());
                    if (producto.getDescripcionCatalogo() != null) existing.setDescripcionCatalogo(producto.getDescripcionCatalogo());
                    if (producto.getDescripcionCompleta() != null) existing.setDescripcionCompleta(producto.getDescripcionCompleta());
                    if (producto.getRevisor() != null) existing.setRevisor(producto.getRevisor());
                    if (producto.getDuenio() != null) existing.setDuenio(producto.getDuenio());
                    return productoRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + id));
    }

    public ProductoDTO actualizarProducto(Integer id, ProductoDTO productoDto, String authorizationHeader) {
        obtenerUsuarioDesdeToken(authorizationHeader); // valida sesión activa
        Producto p = MapperUtil.toProductoEntity(productoDto);
        return MapperUtil.toProductoDTO(actualizar(id, p));
    }

    // ─── Eliminación ─────────────────────────────────────────────────────────────

    public void eliminar(Integer id) {
        productoRepository.deleteById(id);
    }

    // ─── Mis propuestos ──────────────────────────────────────────────────────────

    public MisPropuestosResponseDTO obtenerMisPropuestos(String authorizationHeader) {
        Usuario usuario = obtenerUsuarioDesdeToken(authorizationHeader);
        Integer usuarioId = usuario.getPersonaId();

        List<productoPropuestoDTO> productos = obtenerDetallesPorUsuario(usuarioId).stream()
                .map(detalle -> {
                    productoPropuestoDTO dto = new productoPropuestoDTO();
                    dto.setIdentificador(detalle.getProducto().getIdentificador());
                    dto.setTitulo(detalle.getProducto().getDescripcionCatalogo());
                    dto.setFechaEnvio(detalle.getFechaEnviado().toLocalDate());
                    dto.setEstado(detalle.getEstado());
                    // Solo la primera foto para el listado
                    fotoRepository.findFirstByProducto_IdentificadorOrderByIdentificadorAsc(
                            detalle.getProducto().getIdentificador())
                            .ifPresent(foto -> dto.setImagenUrl(fotoBytesToString(foto.getFoto())));
                    return dto;
                })
                .collect(Collectors.toList());

        MisPropuestosResponseDTO responseDto = new MisPropuestosResponseDTO();
        responseDto.setUsuarioId(usuarioId);
        responseDto.setProductos(productos);
        return responseDto;
    }

    // ─── Seguimiento ─────────────────────────────────────────────────────────────

    // Método interno reutilizado por obtenerSeguimientoDTO
    private ProductoDetalle obtenerSeguimiento(Integer productoId, Integer usuarioId) {
        ProductoDetalle productoDetalle = productoDetalleRepository.findByProductoIdentificador(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        if (!productoDetalle.getProducto().getDuenio().equals(usuarioId)) {
            throw new SecurityException("El usuario solicitante no es el dueño original del bien");
        }
        return productoDetalle;
    }

    public Map<String, Object> obtenerSeguimientoDTO(Integer productoId, String authorizationHeader) {
        Usuario usuario = obtenerUsuarioDesdeToken(authorizationHeader);
        Integer usuarioSolicitanteId = usuario.getPersonaId();

        ProductoDetalle productoDetalle = obtenerSeguimiento(productoId, usuarioSolicitanteId);

        Producto producto = productoDetalle.getProducto();

        Map<String, Object> responseDto = new HashMap<>();
        
        String titulo = producto.getDescripcionCatalogo();
        if (titulo == null || titulo.isBlank() || titulo.equalsIgnoreCase("No posee")) {
            titulo = producto.getDescripcionCompleta();
        }


        responseDto.put("tituloProducto", titulo);
        
        responseDto.put("deposito", productoDetalle.getDeposito());

        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
        responseDto.put("fechaEnviado", productoDetalle.getFechaEnviado() != null ? productoDetalle.getFechaEnviado().format(formatter) : null);
        responseDto.put("fechaRevision", productoDetalle.getFechaRevision() != null ? productoDetalle.getFechaRevision().format(formatter) : null);
        responseDto.put("fechaInspeccionTecnica", productoDetalle.getFechaInspeccionTecnica() != null ? productoDetalle.getFechaInspeccionTecnica().format(formatter) : null);
        responseDto.put("fechaAceptado", productoDetalle.getFechaAceptado() != null ? productoDetalle.getFechaAceptado().format(formatter) : null);
        responseDto.put("fechaRechazado", productoDetalle.getFechaRechazado() != null ? productoDetalle.getFechaRechazado().format(formatter) : null);
        responseDto.put("costoVerificacion", productoDetalle.getCostoVerificacion());
        responseDto.put("estadoActual", productoDetalle.getEstado());
        responseDto.put("comentario",productoDetalle.getTitulo());
        responseDto.put("precioBase", productoDetalle.getPrecioProvisorio());

        if (productoDetalle.getSeguroEntity() != null) {
            Map<String, Object> seguroDto = new HashMap<>();
            seguroDto.put("compania", productoDetalle.getSeguroEntity().getCompania());
            seguroDto.put("poliza", productoDetalle.getSeguroEntity().getNroPoliza());
            seguroDto.put("monto", productoDetalle.getSeguroEntity().getImporte());
            responseDto.put("seguro", seguroDto);
        }

        Optional<Foto> fotoOpt = fotoRepository.findFirstByProducto_IdentificadorOrderByIdentificadorAsc(productoId);
        if (fotoOpt.isPresent() && fotoOpt.get().getFoto() != null) {
            byte[] bytes = fotoOpt.get().getFoto();
            try {
                if (bytes.length > 0 && bytes.length < 1000) {
                    String str = new String(bytes, StandardCharsets.UTF_8);
                    if (str.startsWith("http")) {
                        responseDto.put("imagenUrl", str);
                    } else {
                        responseDto.put("imagenUrl", Base64.getEncoder().encodeToString(bytes));
                    }
                } else {
                    responseDto.put("imagenUrl", Base64.getEncoder().encodeToString(bytes));
                }
            } catch (Exception e) {
                responseDto.put("imagenUrl", Base64.getEncoder().encodeToString(bytes));
            }
        }

        return responseDto;
    }

    // ─── Confirmar / Devolver ────────────────────────────────────────────────────

    public void confirmarProducto(Integer productoId, String authorizationHeader) {
        obtenerUsuarioDesdeToken(authorizationHeader); // valida sesión activa

        ProductoDetalle productoDetalle = productoDetalleRepository.findByProductoIdentificador(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        String estadoActual = productoDetalle.getEstado();
        if ("cancelado".equalsIgnoreCase(estadoActual) || "publicado".equalsIgnoreCase(estadoActual)) {
            throw new IllegalStateException("El producto ya ha sido cancelado o ya está publicado");
        }

        productoDetalle.setEstado("finalizado");
        productoDetalleRepository.save(productoDetalle);

    }

    public Map<String, Object> devolverProducto(Integer productoId, String opcion, String authorizationHeader) {
        Usuario usuario = obtenerUsuarioDesdeToken(authorizationHeader);
        Integer usuarioId = usuario.getPersonaId();

        ProductoDetalle productoDetalle = productoDetalleRepository.findByProductoIdentificador(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        Producto producto = productoDetalle.getProducto();
        if (!producto.getDuenio().equals(usuarioId)) {
            throw new SecurityException("El usuario solicitante no es el dueño original del bien");
        }
        
        String estadoActual = productoDetalle.getEstado();
        if ("publicado".equalsIgnoreCase(estadoActual)) {
            throw new IllegalStateException("El producto ya está publicado");
        }

        if ("cancelado".equalsIgnoreCase(estadoActual)) {
            // Si ya está cancelado, significa que se está registrando el pago de la devolución
            HistorialEstado nuevoHistorial = new HistorialEstado();
            nuevoHistorial.setEstado("pagado");
            nuevoHistorial.setFechaCambio(LocalDateTime.now());
            nuevoHistorial.setProducto(producto);
            nuevoHistorial.setUsuario(usuario);
            historialEstadoRepository.save(nuevoHistorial);

            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Pago de devolución registrado exitosamente.");
            return response;
        }

        productoDetalle.setEstado("cancelado");
        productoDetalleRepository.save(productoDetalle);

        Map<String, Object> response = new HashMap<>();
        
        if ("enviado".equalsIgnoreCase(estadoActual) || "revision".equalsIgnoreCase(estadoActual) || "en_revision".equalsIgnoreCase(estadoActual)) {
            response.put("opcion", null);
            response.put("costoEnvio", null);
        } else {
            if ("envio".equalsIgnoreCase(opcion)) {
                response.put("opcion", "envio");
                response.put("costoEnvio", new BigDecimal("2500.00"));
            } else {
                response.put("opcion", "retiro");
                response.put("costoEnvio", null);
            }
        }
        return response;
    }

    private byte[] compressImage(byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length == 0) {
            return imageBytes;
        }
        try {
            ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes);
            BufferedImage originalImage = ImageIO.read(bais);
            if (originalImage == null) {
                return imageBytes;
            }

            int maxWidth = 800;
            int maxHeight = 800;
            int originWidth = originalImage.getWidth();
            int originHeight = originalImage.getHeight();

            if (originWidth <= maxWidth && originHeight <= maxHeight) {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(originalImage, "jpg", baos);
                return baos.toByteArray();
            }

            double ratio = Math.min((double) maxWidth / originWidth, (double) maxHeight / originHeight);
            int newWidth = (int) (originWidth * ratio);
            int newHeight = (int) (originHeight * ratio);

            java.awt.Image resultingImage = originalImage.getScaledInstance(newWidth, newHeight, java.awt.Image.SCALE_SMOOTH);
            BufferedImage outputImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
            
            Graphics2D g2d = outputImage.createGraphics();
            g2d.drawImage(resultingImage, 0, 0, null);
            g2d.dispose();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(outputImage, "jpg", baos);
            return baos.toByteArray();
        } catch (Exception e) {
            System.err.println("Error al comprimir la imagen: " + e.getMessage());
            return imageBytes;
        }
    }
}
