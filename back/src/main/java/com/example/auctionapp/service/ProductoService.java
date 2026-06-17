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
import com.example.auctionapp.model.Dueno;
import com.example.auctionapp.model.Cliente;
import com.example.auctionapp.model.Usuario;
import com.example.auctionapp.model.Persona;
import com.example.auctionapp.repository.ProductoRepository;
import com.example.auctionapp.util.MapperUtil;
import com.example.auctionapp.repository.ProductoDetalleRepository;
import com.example.auctionapp.repository.DuenoRepository;
import com.example.auctionapp.repository.EmpleadoRepository;
import com.example.auctionapp.repository.FotoRepository;
import com.example.auctionapp.repository.HistorialEstadoRepository;
import com.example.auctionapp.repository.DuenoRepository;
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

    private Usuario obtenerUsuarioDesdeToken(String authorizationHeader) {
        String token = jwtService.extraerToken(authorizationHeader);
        if (token == null || token.isBlank()) {
            throw new SecurityException("Token inválido o sesión expirada");
        }
        String email = jwtService.validarTokenAutenticacion(token);
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("Token inválido o sesión expirada"));
    }

    // Quien propone un producto pasa a ser su "dueño". Si esa persona todavía no
    // figura en la tabla 'duenios', creamos el registro reutilizando su Persona
    // (la FK obligatoria de productos.duenio lo exige).
    // Dueno comparte identificador con Persona vía @MapsId.
    private void asegurarDueno(Integer duenioId) {
        if (duenioId == null || duenoRepository.existsById(duenioId)) {
            return;
        }
        Persona persona = personaRepository.findById(duenioId)
                .orElseThrow(() -> new IllegalArgumentException("No existe una persona para el dueño " + duenioId));
        Empleado verificador = empleadoRepository.findFirstByOrderByIdentificadorAsc();
        if (verificador == null) {
            throw new IllegalStateException("No hay empleados disponibles para asignar como verificador del dueño");
        }
        Dueno dueno = new Dueno();
        dueno.setPersona(persona); // @MapsId: el identificador del dueño = identificador de la persona
        dueno.setVerificador(verificador);
        duenoRepository.save(dueno);
    }

    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerPorId(Integer id) {
        return productoRepository.findById(id);
    }

    public List<Producto> obtenerDisponibles() {
        return productoRepository.findAll()
                .stream()
                .filter(p -> "si".equalsIgnoreCase(p.getDisponible()))
                .toList();
    }

    @Transactional
    public Map<String, Object> crearProductoDetalle(ProponerProductoDTO requestDto, String authorizationHeader) {
        
        // 1. SEGURIDAD: Obtenemos el ID real del usuario logueado desde el token
        Usuario usuario = obtenerUsuarioDesdeToken(authorizationHeader);
        Integer usuarioId = usuario.getPersonaId();

        // 2. DUEÑO: Garantizar que exista usando el helper y el ID del token (no el del DTO)
        asegurarDueno(usuarioId);

        // 3. PRODUCTO: Crear y guardar el base usando el Mapper para ahorrar código
        Producto p = MapperUtil.toProductoEntity(requestDto);
        p.setDuenio(usuarioId); // Sobreescribimos el dueño con el ID seguro del token
        p.setFecha(LocalDate.now()); // Por si el Mapper no lo hace
        Producto productoGuardado = productoRepository.save(p);

        // 4. DETALLE: Crear y guardar ProductoDetalle
        ProductoDetalle detalle = new ProductoDetalle();
        detalle.setProducto(productoGuardado);
        detalle.setTitulo(requestDto.getTitulo());
        detalle.setHistoria(requestDto.getHistoria());
        
        // Manejamos el booleano por si viene nulo
        Boolean declPropiedad = requestDto.getDeclaracionPropiedad();
        detalle.setDeclaracionPropiedad(declPropiedad != null ? declPropiedad : true);
        
        detalle.setEstado("enviado");
        detalle.setFechaEnviado(LocalDateTime.now());
        productoDetalleRepository.save(detalle);

        // 5. FOTOS: Procesar y guardar fotos con validación de nulos
        if (requestDto.getFotos() != null) {
            for (String fotoBase64 : requestDto.getFotos()) {
                if (fotoBase64.contains(",")) {
                    fotoBase64 = fotoBase64.split(",")[1];
                }
                byte[] imagenBytes = Base64.getDecoder().decode(fotoBase64);
                Foto foto = new Foto();
                foto.setFoto(imagenBytes);
                foto.setProducto(productoGuardado);
                fotoRepository.save(foto);
            }
        }

        // 6. HISTORIAL: Crear el registro en HistorialEstado
        HistorialEstado historial = new HistorialEstado();
        historial.setEstado("enviado");
        historial.setFechaCambio(LocalDateTime.now());
        historial.setProducto(productoGuardado);
        historialEstadoRepository.save(historial);

        // 7. RESPUESTA: Retornamos el Map que el Controller está esperando
        Map<String, Object> response = new HashMap<>();
        response.put("productoId", productoGuardado.getIdentificador());
        response.put("estado", detalle.getEstado());
        return response;
    }

    public Producto crearProducto(Producto producto, List<String> fotosBase64, Boolean declaracionPropiedad) {
        
        if (producto.getDisponible() == null) {
            producto.setDisponible("no");
        }
        if (producto.getDescripcionCatalogo() == null) {
            producto.setDescripcionCatalogo("No Posee");
        }

        Producto productoGuardado = productoRepository.save(producto);
        
        for (String fotoBase64 : fotosBase64) {
            Foto foto = new Foto();
            
            byte[] imagenBytes = Base64.getDecoder().decode(fotoBase64);
            
            foto.setFoto(imagenBytes); 
            
            foto.setProducto(productoGuardado);
            fotoRepository.save(foto);
        }
        
        return productoGuardado;
    }

    public Producto actualizar(Integer id, Producto producto) {
        return productoRepository.findById(id)
                .map(existing -> {
                    if (producto.getDisponible() != null) {
                        existing.setDisponible(producto.getDisponible());
                    }
                    if (producto.getDescripcionCatalogo() != null) {
                        existing.setDescripcionCatalogo(producto.getDescripcionCatalogo());
                    }
                    if (producto.getDescripcionCompleta() != null) {
                        existing.setDescripcionCompleta(producto.getDescripcionCompleta());
                    }
                    if (producto.getRevisor() != null) {
                        existing.setRevisor(producto.getRevisor());
                    }
                    if (producto.getDuenio() != null) {
                        existing.setDuenio(producto.getDuenio());
                    }
                    
                    return productoRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con id: " + id));
    }

    public ProductoDTO actualizarProducto(Integer id, ProductoDTO productoDto) {
        Producto p = MapperUtil.toProductoEntity(productoDto);
        Producto updated = actualizar(id, p);
        return MapperUtil.toProductoDTO(updated);
    }

    public void eliminar(Integer id) {
        productoRepository.deleteById(id);
    }

    public List<Producto> obtenerPorUsuario(Integer usuarioId) {
        return productoRepository.findByDuenio(usuarioId);
    }

    public List<ProductoDetalle> obtenerDetallesPorUsuario(Integer usuarioId) {
        return productoDetalleRepository.findByDuenio(usuarioId);
    }
    
    public MisPropuestosResponseDTO obtenerMisPropuestos(String authorizationHeader) {
        Usuario usuario = obtenerUsuarioDesdeToken(authorizationHeader);
        Integer usuarioId = usuario.getPersonaId();

        long t0 = System.currentTimeMillis();

        
        List<productoPropuestoDTO> productos = obtenerDetallesPorUsuario(usuarioId)
                .stream()
                .map(detalle -> {
                    productoPropuestoDTO dto = new productoPropuestoDTO();
                    dto.setIdentificador(detalle.getProducto().getIdentificador());
                    dto.setTitulo(detalle.getProducto().getDescripcionCatalogo());
                    dto.setFechaEnvio(detalle.getFechaEnviado().toLocalDate());
                    dto.setEstado(detalle.getEstado());
                    
                    // Recuperamos solo la primera imagen y la convertimos a Base64
                    Optional<Foto> fotoOpt = fotoRepository.findFirstByProducto_IdentificadorOrderByIdentificadorAsc(detalle.getProducto().getIdentificador());
                    if (fotoOpt.isPresent() && fotoOpt.get().getFoto() != null) {
                        byte[] bytes = fotoOpt.get().getFoto();
                        try {
                            if (bytes.length > 0 && bytes.length < 1000) {
                                String str = new String(bytes, StandardCharsets.UTF_8);
                                if (str.startsWith("http")) {
                                    dto.setImagenUrl(str);
                                } else {
                                    dto.setImagenUrl(Base64.getEncoder().encodeToString(bytes));
                                }
                            } else {
                                dto.setImagenUrl(Base64.getEncoder().encodeToString(bytes));
                            }
                        } catch (Exception e) {
                            dto.setImagenUrl(Base64.getEncoder().encodeToString(bytes));
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toList());
                
        MisPropuestosResponseDTO responseDto = new MisPropuestosResponseDTO();
        responseDto.setUsuarioId(usuarioId);
        responseDto.setProductos(productos);
        return responseDto;
    }

    public ProductoDetalle obtenerSeguimiento(Integer productoId, Integer usuarioId) {
        ProductoDetalle productoDetalle = productoDetalleRepository.findByProductoIdentificador(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Producto producto = productoDetalle.getProducto();
        if (!producto.getDuenio().equals(usuarioId)) {
            throw new SecurityException("El usuario solicitante no es el dueño original del bien");
        }

        return productoDetalle;
    }

    public SeguimientoResponseDTO obtenerSeguimientoDTO(Integer productoId, String authorizationHeader) {
        Usuario usuario = obtenerUsuarioDesdeToken(authorizationHeader);
        Integer usuarioSolicitanteId = usuario.getPersonaId();

        ProductoDetalle productoDetalle = obtenerSeguimiento(productoId, usuarioSolicitanteId);

        SeguimientoResponseDTO responseDto = new SeguimientoResponseDTO();
        responseDto.setTituloProducto(productoDetalle.getTitulo());
        responseDto.setDeposito(productoDetalle.getDeposito());
        responseDto.setFechaEnviado(productoDetalle.getFechaEnviado());
        responseDto.setFechaRevision(productoDetalle.getFechaRevision());
        responseDto.setFechaInspeccionTecnica(productoDetalle.getFechaInspeccionTecnica());
        responseDto.setFechaAceptado(productoDetalle.getFechaAceptado());
        responseDto.setCostoVerificacion(productoDetalle.getCostoVerificacion());
        responseDto.setEstadoActual(productoDetalle.getEstado());

        if (productoDetalle.getSeguroEntity() != null) {
            SeguroInfoDTO seguroDto = new SeguroInfoDTO();
            seguroDto.setCompania(productoDetalle.getSeguroEntity().getCompania());
            seguroDto.setPoliza(productoDetalle.getSeguroEntity().getNroPoliza());
            seguroDto.setMonto(productoDetalle.getSeguroEntity().getImporte());
            responseDto.setSeguro(seguroDto);
        }
        return responseDto;
    }

    public void confirmarProducto(Integer productoId) {
        ProductoDetalle productoDetalle = productoDetalleRepository.findByProductoIdentificador(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        String estadoActual = productoDetalle.getEstado();

        if ("cancelado".equalsIgnoreCase(estadoActual) || "publicado".equalsIgnoreCase(estadoActual)) {
            throw new IllegalStateException("El producto ya ha sido cancelado o ya está publicado");
        }

        productoDetalle.setEstado("confirmado"); 
        productoDetalleRepository.save(productoDetalle);

        // También guardar en historial de estados
        HistorialEstado nuevoHistorial = new HistorialEstado();
        nuevoHistorial.setEstado("confirmado");
        nuevoHistorial.setFechaCambio(LocalDateTime.now());
        nuevoHistorial.setProducto(productoDetalle.getProducto());
    }

    public Map<String, Object> devolverProducto(Integer productoId) {
        ProductoDetalle productoDetalle = productoDetalleRepository.findByProductoIdentificador(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        String estadoActual = productoDetalle.getEstado();

        if ("cancelado".equalsIgnoreCase(estadoActual) || "publicado".equalsIgnoreCase(estadoActual)) {
            throw new IllegalStateException("El producto ya ha sido cancelado o ya está publicado");
        }

        productoDetalle.setEstado("cancelado");
        productoDetalleRepository.save(productoDetalle);

        // También guardar en historial de estados
        HistorialEstado nuevoHistorial = new HistorialEstado();
        nuevoHistorial.setEstado("cancelado");
        nuevoHistorial.setFechaCambio(LocalDateTime.now());
        nuevoHistorial.setProducto(productoDetalle.getProducto());
        historialEstadoRepository.save(nuevoHistorial);

        Map<String, Object> response = new HashMap<>();
        response.put("opcion", "envio");
        response.put("costoEnvio", new BigDecimal(String.valueOf(Math.random() * 4000 + 1000)));
        return response;
    }
}
