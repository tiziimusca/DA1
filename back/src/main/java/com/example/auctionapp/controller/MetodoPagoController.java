package com.example.auctionapp.controller;

import com.example.auctionapp.service.AuthService;
import com.example.auctionapp.service.ClienteService;
import com.example.auctionapp.service.MetodoPagoBancoService;
import com.example.auctionapp.service.MetodoPagoTarjetaService;
import com.example.auctionapp.service.MetodoPagoChequeService;
import com.example.auctionapp.dto.*;
import com.example.auctionapp.model.Cliente;
import com.example.auctionapp.model.Usuario;
import com.example.auctionapp.repository.ClienteRepository;
import com.example.auctionapp.repository.UsuarioRepository;

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
    private final AuthService authService;

    public MetodoPagoController(
            MetodoPagoBancoService bancoService,
            MetodoPagoTarjetaService tarjetaService,
            MetodoPagoChequeService chequeService,
            ObjectMapper objectMapper,
            AuthService authService) {
        this.bancoService = bancoService;
        this.tarjetaService = tarjetaService;
        this.chequeService = chequeService;
        this.objectMapper = objectMapper;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<?> crearMetodoPago(
            
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody CrearMetodoPagoRequestDTO request
            ) {

        try {
            String tipo = request.getTipo();
            JsonNode datos = request.getDatos();
            Cliente cliente = authService.obtenerClienteDesdeToken(authorizationHeader);
            Integer clienteId = cliente.getIdentificador();

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
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {

            Cliente cliente = authService.obtenerClienteDesdeToken(authorizationHeader);
            Integer clienteId = cliente.getIdentificador();

        List<Object> todosMétodos = new ArrayList<>();

        todosMétodos.addAll(bancoService.obtenerPorCliente(clienteId));
        todosMétodos.addAll(tarjetaService.obtenerPorCliente(clienteId));
        todosMétodos.addAll(chequeService.obtenerPorCliente(clienteId));

        return ResponseEntity.ok(todosMétodos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerMetodoPago(
            @PathVariable Integer id,
            @RequestParam Integer clienteId,
            @RequestParam String tipo) {

        // El id NO es único entre tablas: cada tipo tiene su propio autoincremental.
        // Por eso necesitamos el 'tipo' para saber en qué tabla buscar.
        switch (tipo) {
            case "banco":
                return bancoService.obtenerPorIdYCliente(id, clienteId)
                        .<ResponseEntity<?>>map(ResponseEntity::ok)
                        .orElseGet(() -> ResponseEntity.notFound().build());
            case "tarjeta":
                return tarjetaService.obtenerPorIdYCliente(id, clienteId)
                        .<ResponseEntity<?>>map(ResponseEntity::ok)
                        .orElseGet(() -> ResponseEntity.notFound().build());
            case "cheque":
                return chequeService.obtenerPorIdYCliente(id, clienteId)
                        .<ResponseEntity<?>>map(ResponseEntity::ok)
                        .orElseGet(() -> ResponseEntity.notFound().build());
            default:
                return ResponseEntity.badRequest()
                        .body("Tipo de método de pago inválido. Debe ser 'banco', 'tarjeta' o 'cheque'");
        }
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
    public ResponseEntity<?> eliminarMetodoPago(
            @PathVariable Integer id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam String tipo) {

        Integer clienteId;
        try {
            clienteId = authService.obtenerClienteDesdeToken(authorizationHeader).getIdentificador();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }

        // Sin 'tipo' este borrado era ambiguo: con ids repetidos entre tablas
        // podía borrar el método equivocado (ej: borrar el banco id 2 al pedir la tarjeta id 2).
        try {
            switch (tipo) {
                case "banco":
                    bancoService.eliminar(id, clienteId);
                    break;
                case "tarjeta":
                    tarjetaService.eliminar(id, clienteId);
                    break;
                case "cheque":
                    chequeService.eliminar(id, clienteId);
                    break;
                default:
                    return ResponseEntity.badRequest()
                            .body("Tipo de método de pago inválido. Debe ser 'banco', 'tarjeta' o 'cheque'");
            }
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarMetodoPago(
            @PathVariable Integer id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody CrearMetodoPagoRequestDTO request) {

        Integer clienteId;
        try {
            clienteId = authService.obtenerClienteDesdeToken(authorizationHeader).getIdentificador();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }

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
