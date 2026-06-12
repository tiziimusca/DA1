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

    public BidController(PujaService pujaService,
            AsistenteService asistenteService,
            ItemCatalogoService itemCatalogoService,
            MetodoPagoBancoService bancoService,
            MetodoPagoTarjetaService tarjetaService,
            MetodoPagoChequeService chequeService,
            BidWebSocketHandler bidWebSocketHandler) {
        this.pujaService = pujaService;
        this.asistenteService = asistenteService;
        this.itemCatalogoService = itemCatalogoService;
        this.bancoService = bancoService;
        this.tarjetaService = tarjetaService;
        this.chequeService = chequeService;
        this.bidWebSocketHandler = bidWebSocketHandler;
    }

    @PostMapping("/pujar")
    public ResponseEntity<Puja> pujar(@Valid @RequestBody PujaBidRequestDTO request) {
        Asistente asistente = asistenteService.obtenerPorId(request.getAsistenteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asistente no encontrado"));

        ItemCatalogo item = itemCatalogoService.obtenerPorId(request.getItemId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item de catálogo no encontrado"));

        Cliente cliente = asistente.getCliente();
        if (cliente == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El asistente no está asociado a un cliente válido");
        }

        if (!tieneMetodoPagoAprobado(cliente.getIdentificador())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Debe tener al menos un método de pago verificado/aprobado para enviar una puja");
        }

        Subasta subastaItem = item.getCatalogo() != null ? item.getCatalogo().getSubasta() : null;
        if (subastaItem == null || asistente.getSubasta() == null ||
                !subastaItem.getIdentificador().equals(asistente.getSubasta().getIdentificador())) {
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
        
        // Notify all clients about the new bid
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
