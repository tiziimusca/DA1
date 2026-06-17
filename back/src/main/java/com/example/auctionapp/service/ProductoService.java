package com.example.auctionapp.service;

import com.example.auctionapp.model.Producto;
import com.example.auctionapp.model.ProductoDetalle;
import com.example.auctionapp.dto.ProponerProductoDTO;
import com.example.auctionapp.model.Dueno;
import com.example.auctionapp.model.Empleado;
import com.example.auctionapp.model.Foto;
import com.example.auctionapp.model.HistorialEstado;
import com.example.auctionapp.model.Persona;
import com.example.auctionapp.repository.ProductoRepository;
import com.example.auctionapp.util.MapperUtil;
import com.example.auctionapp.repository.ProductoDetalleRepository;
import com.example.auctionapp.repository.DuenoRepository;
import com.example.auctionapp.repository.EmpleadoRepository;
import com.example.auctionapp.repository.FotoRepository;
import com.example.auctionapp.repository.PersonaRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.Base64;

import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProductoDetalleRepository productoDetalleRepository;
    private final FotoRepository fotoRepository;
    private final DuenoRepository duenoRepository;
    private final PersonaRepository personaRepository;
    private final EmpleadoRepository empleadoRepository;

    public ProductoService(ProductoRepository productoRepository, ProductoDetalleRepository productoDetalleRepository, FotoRepository fotoRepository,
            DuenoRepository duenoRepository, PersonaRepository personaRepository, EmpleadoRepository empleadoRepository) {
        this.productoRepository = productoRepository;
        this.productoDetalleRepository = productoDetalleRepository;
        this.fotoRepository = fotoRepository;
        this.duenoRepository = duenoRepository;
        this.personaRepository = personaRepository;
        this.empleadoRepository = empleadoRepository;
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
    public ProductoDetalle crearProductoDetalle(ProponerProductoDTO requestDto) {

        // Garantizar que exista el dueño (la FK productos.duenio es obligatoria)
        asegurarDueno(requestDto.getDuenioId());

        // 1. Crear y guardar el Producto base (Los datos ya están validados por el DTO)
        Producto p = MapperUtil.toProductoEntity(requestDto);
        Producto productoGuardado = productoRepository.save(p);
        
        // 2. Procesar y guardar fotos
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
        
        // 3. Crear y guardar ProductoDetalle
        ProductoDetalle detalle = new ProductoDetalle();
        detalle.setTitulo(requestDto.getTitulo());
        detalle.setHistoria(requestDto.getHistoria());
        detalle.setDeclaracionPropiedad(requestDto.getDeclaracionPropiedad());
        detalle.setEstado("en_inspeccion");
        detalle.setFechaEnviado(LocalDateTime.now());
        detalle.setProducto(productoGuardado);
        
        productoDetalleRepository.save(detalle);
        
        return detalle;
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

    public void eliminar(Integer id) {
        productoRepository.deleteById(id);
    }

    public List<Producto> obtenerPorUsuario(Integer usuarioId) {
        return productoRepository.findByDuenio(usuarioId);
    }

    public List<ProductoDetalle> obtenerDetallesPorUsuario(Integer usuarioId) {
        return productoDetalleRepository.findByDuenio(usuarioId);
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

    public void devolverProducto(Integer productoId) {
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
    }
}
