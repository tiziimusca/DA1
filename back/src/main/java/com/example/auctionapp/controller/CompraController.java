package com.example.auctionapp.controller;

import com.example.auctionapp.service.CompraService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compras")
public class CompraController {

    private final CompraService compraService;

    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    @PostMapping("/{id}/completar-pago")
    public ResponseEntity<?> completarPago(@PathVariable Integer id) {
        return compraService.completarPago(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
