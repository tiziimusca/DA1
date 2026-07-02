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
    public ResponseEntity<?> completarPago(
            @PathVariable Integer id,
            @RequestBody(required = false) java.util.Map<String, Object> body) {
        
        Integer metodoPagoId = null;
        String tipo = null;
        Boolean retirarEnPersona = false;

        if (body != null) {
            if (body.get("metodoPagoId") != null) {
                metodoPagoId = ((Number) body.get("metodoPagoId")).intValue();
            }
            if (body.get("tipo") != null) {
                tipo = (String) body.get("tipo");
            }
            if (body.get("retirarEnPersona") != null) {
                retirarEnPersona = (Boolean) body.get("retirarEnPersona");
            }
        }

        return compraService.completarPago(id, metodoPagoId, tipo, retirarEnPersona)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
