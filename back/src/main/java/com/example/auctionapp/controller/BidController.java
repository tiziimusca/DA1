package com.example.auctionapp.controller;

import com.example.auctionapp.dto.PujaBidRequestDTO;
import com.example.auctionapp.model.Asistente;
import com.example.auctionapp.model.ItemCatalogo;
import com.example.auctionapp.model.Puja;
import com.example.auctionapp.dto.PujaBidRequestDTO;
import com.example.auctionapp.model.Asistente;
import com.example.auctionapp.model.Cliente;
import com.example.auctionapp.model.ItemCatalogo;
import com.example.auctionapp.model.Puja;
import com.example.auctionapp.model.Subasta;
import com.example.auctionapp.service.AsistenteService;
import com.example.auctionapp.service.ItemCatalogoService;
import com.example.auctionapp.service.MetodoPagoBancoService;
import com.example.auctionapp.service.MetodoPagoChequeService;
import com.example.auctionapp.service.MetodoPagoTarjetaService;
import com.example.auctionapp.service.PujaService;
import com.example.auctionapp.websocket.BidWebSocketHandler;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class BidController {

    private static final Map<String, Integer> CATEGORIA_ORDEN = Map.of(
            "platino", 4,
            "oro", 3,
            "plata", 2,
            "especial", 1,
            "comun", 0);

    private final PujaService pujaService;
    private final AsistenteService asistenteService;
    private final ItemCatalogoService itemCatalogoService;
    private final MetodoPagoBancoService bancoService;
    private final MetodoPagoTarjetaService tarjetaService;
    private final MetodoPagoChequeService chequeService;
    private final BidWebSocketHandler bidWebSocketHandler;
    private final com.example.auctionapp.service.JwtService jwtService;
    private final com.example.auctionapp.repository.UsuarioRepository usuarioRepository;
    private final com.example.auctionapp.repository.ClienteRepository clienteRepository;

    public BidController(PujaService pujaService,
            AsistenteService asistenteService,
            ItemCatalogoService itemCatalogoService,
            MetodoPagoBancoService bancoService,
            MetodoPagoTarjetaService tarjetaService,
            MetodoPagoChequeService chequeService,
            BidWebSocketHandler bidWebSocketHandler,
            com.example.auctionapp.service.JwtService jwtService,
            com.example.auctionapp.repository.UsuarioRepository usuarioRepository,
            com.example.auctionapp.repository.ClienteRepository clienteRepository) {
        this.pujaService = pujaService;
        this.asistenteService = asistenteService;
        this.itemCatalogoService = itemCatalogoService;
        this.bancoService = bancoService;
        this.tarjetaService = tarjetaService;
        this.chequeService = chequeService;
        this.bidWebSocketHandler = bidWebSocketHandler;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
    }

    @PostMapping("/pujar")
    public ResponseEntity<Puja> pujar(
            @org.springframework.web.bind.annotation.RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @Valid @RequestBody PujaBidRequestDTO request) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token no proporcionado");
        }

        String token = jwtService.extraerToken(authorizationHeader);
        String email = jwtService.validarTokenAutenticacion(token);
        com.example.auctionapp.model.Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

        Cliente cliente = clienteRepository.findById(usuario.getPersonaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cliente no encontrado"));

        ItemCatalogo item = itemCatalogoService.obtenerPorId(request.getItemId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item de catálogo no encontrado"));

        Subasta subastaItem = item.getCatalogo() != null ? item.getCatalogo().getSubasta() : null;
        if (subastaItem == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El item no tiene subasta asociada");
        }

        Asistente asistente = asistenteService
                .obtenerPorClienteYSubasta(cliente.getIdentificador(), subastaItem.getIdentificador())
                .orElseGet(() -> {
                    Asistente nuevo = new Asistente();
                    nuevo.setCliente(cliente);
                    nuevo.setSubasta(subastaItem);
                    int count = asistenteService.contarPorSubasta(subastaItem.getIdentificador());
                    nuevo.setNumeroPostor(count + 1);
                    return asistenteService.crear(nuevo);
                });

        if (cliente == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El asistente no está asociado a un cliente válido");
        }
        if (!tieneMetodoPagoAprobado(cliente.getIdentificador())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Debe tener al menos un método de pago verificado/aprobado para enviar una puja");
        }

        if (!subastaItem.getIdentificador().equals(asistente.getSubasta().getIdentificador())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El item no pertenece a la subasta asociada al asistente");
        }
        String categoriaCliente = normalizeCategoria(cliente.getCategoria());
        String categoriaSubasta = normalizeCategoria(subastaItem.getCategoria());
        if (!permiteCategoria(categoriaCliente, categoriaSubasta)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "La categoría del cliente no es suficiente para participar en esta subasta");
        }
        BigDecimal precioBase = item.getPrecioBase();
        if (precioBase == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El item no tiene precio base definido");
        }

        BigDecimal mejorPujaActual = pujaService.obtenerMejorPujaPorItem(item.getIdentificador())
                .map(Puja::getImporte)
                .orElse(precioBase);

        boolean exentoDeLimites = esCategoriaPremium(categoriaCliente);
        if (!exentoDeLimites) {
            BigDecimal minimo = mejorPujaActual.add(precioBase.multiply(new BigDecimal("0.01")))
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal maximo = mejorPujaActual.add(precioBase.multiply(new BigDecimal("0.20")))
                    .setScale(2, RoundingMode.HALF_UP);

            if (request.getImporte().compareTo(minimo) < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        String.format("La puja debe ser al menos %s", minimo));
            }
            if (request.getImporte().compareTo(maximo) > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        String.format("La puja no puede superar %s", maximo));
            }
        }

        Puja puja = new Puja();
        puja.setAsistente(asistente);
        puja.setItem(item);
        puja.setImporte(request.getImporte());
        puja.setGanador("no");

        Puja savedPuja = pujaService.crear(puja);

        String notification = String.format("{\"type\":\"NEW_BID\",\"subastaId\":%d,\"importe\":%s}",
                subastaItem.getIdentificador(), savedPuja.getImporte().toString());
        bidWebSocketHandler.broadcast(notification);

        return ResponseEntity.ok(savedPuja);
    }

    private boolean tieneMetodoPagoAprobado(Integer clienteId) {
        return !bancoService.obtenerPorClienteYEstado(clienteId, "aprobado").isEmpty()
                || !tarjetaService.obtenerPorClienteYEstado(clienteId, "aprobado").isEmpty()
                || !chequeService.obtenerPorClienteYEstado(clienteId, "aprobado").isEmpty();
    }

    private boolean esCategoriaPremium(String categoria) {
        String normalized = normalizeCategoria(categoria);
        return "oro".equals(normalized) || "platino".equals(normalized);
    }

    private boolean permiteCategoria(String clienteCategoria, String subastaCategoria) {
        if (esCategoriaPremium(clienteCategoria)) {
            return true;
        }
        Integer clienteRank = CATEGORIA_ORDEN.getOrDefault(clienteCategoria, -1);
        Integer subastaRank = CATEGORIA_ORDEN.getOrDefault(subastaCategoria, 0);
        return clienteRank >= subastaRank;
    }

    private String normalizeCategoria(String categoria) {
        if (categoria == null) {
            return "";
        }
        return categoria.trim().toLowerCase();
    }
}
