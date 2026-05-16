package com.example.auctionapp.controller;

import com.example.auctionapp.model.Producto;
import com.example.auctionapp.service.ProductoService;
import com.example.auctionapp.dto.ProductoDTO;
import com.example.auctionapp.util.MapperUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
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

    @PostMapping
    public ProductoDTO crear(@Valid @RequestBody ProductoDTO productoDto) {
        Producto p = MapperUtil.toProductoEntity(productoDto);
        Producto saved = productoService.crear(p);
        return MapperUtil.toProductoDTO(saved);
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
}
