package com.example.auctionapp.controller;

import com.example.auctionapp.model.*;
import com.example.auctionapp.repository.*;
import com.example.auctionapp.service.CompraService;
import com.example.auctionapp.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/deudores")
public class DeudorController {

    private final DeudorRepository deudorRepository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final SubastaRepository subastaRepository;
    private final CatalogoRepository catalogoRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final PujaRepository pujaRepository;
    private final CompraService compraService;
    private final JwtService jwtService;

    public DeudorController(DeudorRepository deudorRepository,
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            SubastaRepository subastaRepository,
            CatalogoRepository catalogoRepository,
            ItemCatalogoRepository itemCatalogoRepository,
            PujaRepository pujaRepository,
            CompraService compraService,
            JwtService jwtService) {
        this.deudorRepository = deudorRepository;
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.subastaRepository = subastaRepository;
        this.catalogoRepository = catalogoRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.pujaRepository = pujaRepository;
        this.compraService = compraService;
        this.jwtService = jwtService;
    }

    private Usuario obtenerUsuarioDeToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token no proporcionado");
        }
        String token = jwtService.extraerToken(authHeader);
        String email = jwtService.validarTokenAutenticacion(token);
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> obtenerDeuda(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Usuario usuario = obtenerUsuarioDeToken(authHeader);
        Optional<Deudor> deudorOpt = deudorRepository.findByUsuarioId(usuario.getIdentificador());

        if (deudorOpt.isPresent()) {
            Deudor deudor = deudorOpt.get();
            Subasta subasta = obtenerSubastaGanadaNoPagada(usuario.getPersonaId());
            Integer subastaId = subasta != null ? subasta.getIdentificador() : null;

            return ResponseEntity.ok(Map.of(
                    "deudor", true,
                    "monto", deudor.getMonto(),
                    "subastaId", subastaId != null ? subastaId : -1));
        }

        return ResponseEntity.ok(Map.of("deudor", false));
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarDeuda(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Integer> body) {
        Usuario usuario = obtenerUsuarioDeToken(authHeader);
        Integer subastaId = body.get("subastaId");
        if (subastaId == null) {
            return ResponseEntity.badRequest().body("Falta el subastaId");
        }

        if (deudorRepository.existsByUsuarioId(usuario.getIdentificador())) {
            return ResponseEntity.ok(Map.of("mensaje", "La deuda ya estaba registrada"));
        }

        Optional<Subasta> subastaOpt = subastaRepository.findById(subastaId);
        if (subastaOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Subasta no encontrada");
        }
        Subasta subasta = subastaOpt.get();

        Optional<Catalogo> catalogoOpt = catalogoRepository.findBySubasta_Identificador(subasta.getIdentificador());
        if (catalogoOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Catálogo no encontrado para la subasta");
        }
        Catalogo catalogo = catalogoOpt.get();

        List<ItemCatalogo> items = itemCatalogoRepository
                .findByCatalogo_IdentificadorOrderByIdentificadorAsc(catalogo.getIdentificador());
        if (items.isEmpty()) {
            return ResponseEntity.badRequest().body("La subasta no tiene items");
        }
        ItemCatalogo item = items.get(0);

        Optional<Puja> topBidOpt = pujaRepository
                .findTopByItem_IdentificadorOrderByImporteDesc(item.getIdentificador());
        if (topBidOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No hay pujas en esta subasta");
        }
        Puja topBid = topBidOpt.get();

        BigDecimal base = topBid.getImporte();
        BigDecimal comision = item.getComision();
        BigDecimal multa = topBid.getImporte().multiply(new BigDecimal("0.1"));
        BigDecimal total = base.add(comision).add(multa);

        Deudor deudor = new Deudor();
        deudor.setUsuarioId(usuario.getIdentificador());
        deudor.setMonto(total);
        deudorRepository.save(deudor);

        return ResponseEntity.status(HttpStatus.CREATED).body(deudor);
    }

    @PostMapping("/me/pagar")
    public ResponseEntity<?> pagarDeuda(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        Usuario usuario = obtenerUsuarioDeToken(authHeader);
        Optional<Deudor> deudorOpt = deudorRepository.findByUsuarioId(usuario.getIdentificador());
        if (deudorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("El usuario no tiene deudas registradas");
        }

        Subasta subasta = obtenerSubastaGanadaNoPagada(usuario.getPersonaId());
        if (subasta != null) {
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

            compraService.completarPago(subasta.getIdentificador(), metodoPagoId, tipo, retirarEnPersona);
            return ResponseEntity.ok(Map.of("mensaje", "Pago completado y deuda eliminada"));
        } else {
            deudorRepository.delete(deudorOpt.get());
            return ResponseEntity.ok(Map.of("mensaje", "Deuda eliminada directamente"));
        }
    }

    private Subasta obtenerSubastaGanadaNoPagada(Integer clienteId) {
        List<Subasta> subastas = subastaRepository.findAll();
        for (Subasta subasta : subastas) {
            if ("finalizada".equalsIgnoreCase(subasta.getEstado())) {
                continue;
            }
            List<ItemCatalogo> items = itemCatalogoRepository
                    .findByCatalogo_IdentificadorOrderByIdentificadorAsc(subasta.getIdentificador());
            if (items.isEmpty())
                continue;
            ItemCatalogo item = items.get(0);
            Optional<Puja> topBid = pujaRepository
                    .findTopByItem_IdentificadorOrderByImporteDesc(item.getIdentificador());
            if (topBid.isPresent() && topBid.get().getAsistente().getCliente().getIdentificador().equals(clienteId)) {
                return subasta;
            }
        }
        return null;
    }
}
