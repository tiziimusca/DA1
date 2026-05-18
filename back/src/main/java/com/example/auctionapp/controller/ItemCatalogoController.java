package com.example.auctionapp.controller;

import com.example.auctionapp.model.ItemCatalogo;
import com.example.auctionapp.service.ItemCatalogoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items-catalogo")
public class ItemCatalogoController {

    private final ItemCatalogoService itemCatalogoService;

    public ItemCatalogoController(ItemCatalogoService itemCatalogoService) {
        this.itemCatalogoService = itemCatalogoService;
    }

    @GetMapping
    public List<ItemCatalogo> listar() {
        return itemCatalogoService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemCatalogo> buscar(@PathVariable Integer id) {
        return itemCatalogoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ItemCatalogo crear(@Valid @RequestBody ItemCatalogo itemCatalogo) {
        return itemCatalogoService.crear(itemCatalogo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemCatalogo> actualizar(@PathVariable Integer id,
            @Valid @RequestBody ItemCatalogo itemCatalogo) {
        try {
            ItemCatalogo updated = itemCatalogoService.actualizar(id, itemCatalogo);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        itemCatalogoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
