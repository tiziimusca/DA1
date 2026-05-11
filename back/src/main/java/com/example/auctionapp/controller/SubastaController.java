package com.example.auctionapp.controller;

import com.example.auctionapp.model.Subasta;
import com.example.auctionapp.service.SubastaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subastas")
public class SubastaController {

    private final SubastaService subastaService;

    public SubastaController(SubastaService subastaService) {
        this.subastaService = subastaService;
    }

    @GetMapping
    public List<Subasta> listar() {
        return subastaService.obtenerTodas();
    }

    @GetMapping("/abiertas")
    public List<Subasta> obtenerAbiertas() {
        return subastaService.obtenerAbiertas();
    }

    @GetMapping("/proximas")
    public List<Subasta> obtenerProximas() {
        return subastaService.obtenerProximas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subasta> buscar(@PathVariable Integer id) {
        return subastaService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Subasta crear(@RequestBody Subasta subasta) {
        return subastaService.crear(subasta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subasta> actualizar(@PathVariable Integer id, @RequestBody Subasta subasta) {
        try {
            return ResponseEntity.ok(subastaService.actualizar(id, subasta));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        subastaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
