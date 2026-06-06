package com.example.auctionapp.controller;

import com.example.auctionapp.service.MetodoPagoBancoService;
import com.example.auctionapp.service.MetodoPagoTarjetaService;
import com.example.auctionapp.service.MetodoPagoChequeService;
import com.example.auctionapp.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;


@RestController
@RequestMapping("/api/clientes/me/metodos-pago")
public class MetodoPagoController {

    private final MetodoPagoBancoService bancoService;
    private final MetodoPagoTarjetaService tarjetaService;
    private final MetodoPagoChequeService chequeService;
    private final ObjectMapper objectMapper;

    public MetodoPagoController(
            MetodoPagoBancoService bancoService,
            MetodoPagoTarjetaService tarjetaService,
            MetodoPagoChequeService chequeService,
            ObjectMapper objectMapper) {
        this.bancoService = bancoService;
        this.tarjetaService = tarjetaService;
        this.chequeService = chequeService;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public ResponseEntity<?> crearMetodoPago(
            @RequestParam Integer clienteId,
            @Valid @RequestBody CrearMetodoPagoRequestDTO request) {

        try {
            String tipo = request.getTipo();
            JsonNode datos = request.getDatos();

            switch (tipo) {
                case "banco":
                    MetodoPagoBancoDTO bancoDB = objectMapper.convertValue(datos, MetodoPagoBancoDTO.class);
                    return ResponseEntity.status(HttpStatus.CREATED)
                            .body(bancoService.crear(clienteId, bancoDB));

                case "tarjeta":
                    MetodoPagoTarjetaDTO tarjetaDTO = objectMapper.convertValue(datos, MetodoPagoTarjetaDTO.class);
                    return ResponseEntity.status(HttpStatus.CREATED)
                            .body(tarjetaService.crear(clienteId, tarjetaDTO));

                case "cheque":
                    MetodoPagoChequeDTO chequeDTO = objectMapper.convertValue(datos, MetodoPagoChequeDTO.class);
                    return ResponseEntity.status(HttpStatus.CREATED)
                            .body(chequeService.crear(clienteId, chequeDTO));

                default:
                    return ResponseEntity.badRequest()
                            .body("Tipo de método de pago inválido. Debe ser 'banco', 'tarjeta' o 'cheque'");
            }

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Faltan datos obligatorios para el método seleccionado o el formato es incorrecto: "
                            + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Object>> listarMetodosPago(
            @RequestParam Integer clienteId) {

        List<Object> todosMétodos = new ArrayList<>();

        todosMétodos.addAll(bancoService.obtenerPorCliente(clienteId));
        todosMétodos.addAll(tarjetaService.obtenerPorCliente(clienteId));
        todosMétodos.addAll(chequeService.obtenerPorCliente(clienteId));

        return ResponseEntity.ok(todosMétodos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerMetodoPago(
            @PathVariable Integer id,
            @RequestParam Integer clienteId) {

        // Buscar en banco
        var banco = bancoService.obtenerPorIdYCliente(id, clienteId);
        if (banco.isPresent()) {
            return ResponseEntity.ok(banco.get());
        }

        // Buscar en tarjeta
        var tarjeta = tarjetaService.obtenerPorIdYCliente(id, clienteId);
        if (tarjeta.isPresent()) {
            return ResponseEntity.ok(tarjeta.get());
        }

        // Buscar en cheque
        var cheque = chequeService.obtenerPorIdYCliente(id, clienteId);
        if (cheque.isPresent()) {
            return ResponseEntity.ok(cheque.get());
        }

        return ResponseEntity.notFound().build();
    }

    @GetMapping("/tipo/banco")
    public ResponseEntity<List<MetodoPagoBancoResponseDTO>> obtenerMetodosBanco(
            @RequestParam Integer clienteId) {

        return ResponseEntity.ok(bancoService.obtenerPorCliente(clienteId));
    }

    @GetMapping("/tipo/tarjeta")
    public ResponseEntity<List<MetodoPagoTarjetaResponseDTO>> obtenerMetodosTarjeta(
            @RequestParam Integer clienteId) {

        return ResponseEntity.ok(tarjetaService.obtenerPorCliente(clienteId));
    }

    @GetMapping("/tipo/cheque")
    public ResponseEntity<List<MetodoPagoChequeResponseDTO>> obtenerMetodosCheque(
            @RequestParam Integer clienteId) {

        return ResponseEntity.ok(chequeService.obtenerPorCliente(clienteId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMetodoPago(
            @PathVariable Integer id,
            @RequestParam Integer clienteId) {

        try {
            // Intentar eliminar de banco
            bancoService.obtenerPorIdYCliente(id, clienteId);
            bancoService.eliminar(id, clienteId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            // Continuar
        }

        try {
            // Intentar eliminar de tarjeta
            tarjetaService.obtenerPorIdYCliente(id, clienteId);
            tarjetaService.eliminar(id, clienteId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            // Continuar
        }

        try {
            // Intentar eliminar de cheque
            chequeService.obtenerPorIdYCliente(id, clienteId);
            chequeService.eliminar(id, clienteId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            // No encontrado
        }

        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarMetodoPago(
            @PathVariable Integer id,
            @RequestParam Integer clienteId,
            @Valid @RequestBody CrearMetodoPagoRequestDTO request) {

        try {
            String tipo = request.getTipo();
            JsonNode datos = request.getDatos();

            switch (tipo) {
                case "banco":
                    MetodoPagoBancoDTO bancoDTO = objectMapper.convertValue(datos, MetodoPagoBancoDTO.class);
                    return ResponseEntity.ok(bancoService.actualizar(id, clienteId, bancoDTO));

                case "tarjeta":
                    MetodoPagoTarjetaDTO tarjetaDTO = objectMapper.convertValue(datos, MetodoPagoTarjetaDTO.class);
                    return ResponseEntity.ok(tarjetaService.actualizar(id, clienteId, tarjetaDTO));

                case "cheque":
                    MetodoPagoChequeDTO chequeDTO = objectMapper.convertValue(datos, MetodoPagoChequeDTO.class);
                    return ResponseEntity.ok(chequeService.actualizar(id, clienteId, chequeDTO));

                default:
                    return ResponseEntity.badRequest().body("Tipo de método de pago inválido. Debe ser 'banco', 'tarjeta' o 'cheque'");
            }

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Faltan datos obligatorios para el método seleccionado o el formato es incorrecto: " + e.getMessage());
        } catch (RuntimeException e) {
            String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
            if (msg.contains("no encontrado") || msg.contains("no existe") || msg.contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }
}
