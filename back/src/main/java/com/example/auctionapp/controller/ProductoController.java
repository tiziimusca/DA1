package com.example.auctionapp.controller;

import static java.lang.String.valueOf;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.security.core.Authentication;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.auctionapp.dto.ProductoDTO;
import com.example.auctionapp.dto.ProponerProductoDTO;
import com.example.auctionapp.dto.SeguimientoResponseDTO;
import com.example.auctionapp.dto.SeguroInfoDTO;
import com.example.auctionapp.dto.productoPropuestoDTO;
import com.example.auctionapp.model.Foto;
import com.example.auctionapp.model.ItemCatalogo;
import com.example.auctionapp.model.Producto;
import com.example.auctionapp.model.ProductoDetalle;
import com.example.auctionapp.model.Subasta;
import com.example.auctionapp.repository.FotoRepository;
import com.example.auctionapp.service.ProductoService;
import com.example.auctionapp.util.MapperUtil;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.RequestParam;

import com.example.auctionapp.dto.MisPropuestosResponseDTO;


@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;
    private final FotoRepository fotoRepository;

    public ProductoController(ProductoService productoService, FotoRepository fotoRepository) {
        this.productoService = productoService;
        this.fotoRepository = fotoRepository;
    }

    @GetMapping
    public List<ProductoDTO> listar() {
        return productoService.obtenerTodos()
                .stream()
                .map(MapperUtil::toProductoDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/disponibles")
    public List<ProductoDTO> obtenerDisponibles() {
        return productoService.obtenerDisponibles()
                .stream()
                .map(MapperUtil::toProductoDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> buscar(@PathVariable Integer id) {
        return productoService.obtenerPorId(id)
                .map(MapperUtil::toProductoDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/proponer")
    public ResponseEntity<?> crear(@Valid @RequestBody ProponerProductoDTO requestDto, Authentication authentication) {
        try {
            //Integer duenioId = Integer.parseInt(authentication.getName());
            Integer duenioId = 2; // TODO: Eliminar esta línea cuando se integre con autenticación real
            
            requestDto.setDuenioId(duenioId); 
            
            // Le pasamos el DTO COMPLETO al Service
            ProductoDetalle productoDetalle = productoService.crearProductoDetalle(requestDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("productoId", productoDetalle.getProducto().getIdentificador());
            response.put("estado", productoDetalle.getEstado());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear el producto");
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> actualizar(@PathVariable Integer id,
            @Valid @RequestBody ProductoDTO productoDto) {
        try {
            Producto p = MapperUtil.toProductoEntity(productoDto);
            Producto updated = productoService.actualizar(id, p);
            return ResponseEntity.ok(MapperUtil.toProductoDTO(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> obtenerFotoPortada(@PathVariable Integer id) {
        try {
            
            List<Foto> fotos = fotoRepository.findByProducto_IdentificadorOrderByIdentificadorAsc(id);

            if (fotos == null || fotos.isEmpty()) {
                return ResponseEntity.notFound().build(); 
            }

            Foto fotoPortada = fotos.get(0);

          
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG); 

            return new ResponseEntity<>(fotoPortada.getFoto(), headers, HttpStatus.OK);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/mis-propuestos")
    public ResponseEntity<MisPropuestosResponseDTO> obtenerMisProductos(Authentication authentication) {
        //String identificadorToken = authentication.getName(); 
        // Integer usuarioId = Integer.parseInt(identificadorToken);
        Integer usuarioId = 2;
        
        List<productoPropuestoDTO> productos = productoService.obtenerDetallesPorUsuario(usuarioId)
                .stream()
                .map(detalle -> {
                    productoPropuestoDTO dto = new productoPropuestoDTO();
                    dto.setIdentificador(detalle.getProducto().getIdentificador());
                    dto.setTitulo(detalle.getTitulo());
                    dto.setFechaEnvio(detalle.getFechaEnviado().toLocalDate());
                    dto.setEstado(detalle.getEstado());
                    dto.setImagenUrl("/api/productos/" + detalle.getProducto().getIdentificador() + "/foto"); // Endpoint para obtener la foto
                    return dto;
                })
                .collect(Collectors.toList());
                
        MisPropuestosResponseDTO responseDto = new MisPropuestosResponseDTO();
        responseDto.setUsuarioId(usuarioId);
        responseDto.setProductos(productos);
        
        return ResponseEntity.ok(responseDto); 
    }

    @GetMapping("/{id}/seguimiento")
    public ResponseEntity<?> obtenerSeguimiento(@PathVariable Integer id, Authentication authentication) {
        try {
            //Integer usuarioSolicitanteId = Integer.parseInt(authentication.getName());
            Integer usuarioSolicitanteId = 2;
            ProductoDetalle productoDetalle = productoService.obtenerSeguimiento(id, usuarioSolicitanteId);

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

            // Los datos de ItemCatalogo, Subasta, etc. se obtienen desde la tabla de subastas
            // cuando el producto sea incluido en una subasta
            // Por ahora los valores quedan en null hasta que se cree una subasta

            return ResponseEntity.ok(responseDto);

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/confirmar")
    public ResponseEntity<?> confirmar(@PathVariable Integer id) {
        try {
            productoService.confirmarProducto(id);
            return ResponseEntity.ok("Confirmación exitosa.");
            
        } catch (IllegalStateException e) {
            // Retorna 409 Conflict si ya estaba cancelado o publicado
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/devolver")
    public ResponseEntity<?> devolver(@PathVariable Integer id) {
        try {
            productoService.devolverProducto(id);

            Map<String, Object> response = new HashMap<>();
            response.put("opcion", "envio");
            response.put("costoEnvio", new BigDecimal(valueOf(Math.random() * 4000 + 1000))); // Simulación de costo de envío entre 1000 y 5000

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> manejarErroresDeValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        
        // Recorremos todos los errores que saltaron en el DTO
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errores.put(error.getField(), error.getDefaultMessage());
        }
        
        return ResponseEntity.badRequest().body(errores);
    }
}
