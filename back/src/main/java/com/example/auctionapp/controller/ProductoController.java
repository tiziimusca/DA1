package com.example.auctionapp.controller;

import static java.lang.String.valueOf;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.auctionapp.dto.ErrorResponseDTO;
import com.example.auctionapp.dto.ProductoDTO;
import com.example.auctionapp.dto.ProponerProductoDTO;
import com.example.auctionapp.service.ProductoService;

import jakarta.validation.Valid;

import com.example.auctionapp.dto.MisPropuestosResponseDTO;


@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @PostMapping("/proponer")
    public ResponseEntity<Object> crear(
            @RequestHeader(value = "Authorization", required = true) String authorizationHeader,
            @Valid @RequestBody ProponerProductoDTO requestDto) {
        try {
            Map<String, Object> response = productoService.crearProductoDetalle(requestDto, authorizationHeader);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponseDTO("unauthorized", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponseDTO("bad_request", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponseDTO("bad_request", "Error al crear el producto"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> actualizar(@PathVariable Integer id,
            @Valid @RequestBody ProductoDTO productoDto) {
        try {
            ProductoDTO updated = productoService.actualizarProducto(id, productoDto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/mis-propuestos")
    public ResponseEntity<Object> obtenerMisProductos(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            MisPropuestosResponseDTO responseDto = productoService.obtenerMisPropuestos(authorizationHeader);
            return ResponseEntity.ok(responseDto); 
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponseDTO("unauthorized", e.getMessage()));
        }
    }

    @GetMapping("/{id}/seguimiento")
    public ResponseEntity<Object> obtenerSeguimiento(@PathVariable Integer id, 
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            Object responseDto = productoService.obtenerSeguimientoDTO(id, authorizationHeader);
            return ResponseEntity.ok(responseDto);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponseDTO("forbidden", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/confirmar")
    public ResponseEntity<Object> confirmar(@PathVariable Integer id) {
        try {
            productoService.confirmarProducto(id);
            return ResponseEntity.ok(Map.of("mensaje", "Confirmación exitosa."));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponseDTO("conflict", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/devolver")
    public ResponseEntity<Object> devolver(
            @PathVariable Integer id,
            @RequestParam(value = "opcion", required = false) String queryOpcion,
            @RequestBody(required = false) Map<String, String> body,
            @RequestHeader(value = "Authorization", required = true) String authorizationHeader) {
        try {
            String opcion = queryOpcion;
            if (opcion == null && body != null) {
                opcion = body.get("opcion");
            }
            Map<String, Object> response = productoService.devolverProducto(id, opcion, authorizationHeader);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponseDTO("unauthorized", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponseDTO("conflict", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
