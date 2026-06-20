package com.example.auctionapp.service;

import com.example.auctionapp.dto.HomeMetricasDTO;
import com.example.auctionapp.dto.HomeResponseDTO;
import com.example.auctionapp.dto.HomeSubastaDTO;
import com.example.auctionapp.model.Catalogo;
import com.example.auctionapp.model.ItemCatalogo;
import com.example.auctionapp.model.RegistroDeSubasta;
import com.example.auctionapp.model.Subasta;
import com.example.auctionapp.repository.CatalogoRepository;
import com.example.auctionapp.repository.FotoRepository;
import com.example.auctionapp.repository.ItemCatalogoRepository;
import com.example.auctionapp.repository.RegistroDeSubastaRepository;
import com.example.auctionapp.repository.SubastaRepository;
import com.example.auctionapp.repository.UsuarioRepository;
import com.example.auctionapp.repository.PujaRepository;
import com.example.auctionapp.model.Usuario;
import com.example.auctionapp.model.Puja;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HomeService {

    private final SubastaRepository subastaRepository;
    private final CatalogoRepository catalogoRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final RegistroDeSubastaRepository registroDeSubastaRepository;
    private final FotoRepository fotoRepository;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final PujaRepository pujaRepository;

    public HomeService(SubastaRepository subastaRepository,
            CatalogoRepository catalogoRepository,
            ItemCatalogoRepository itemCatalogoRepository,
            RegistroDeSubastaRepository registroDeSubastaRepository,
            FotoRepository fotoRepository,
            JwtService jwtService,
            UsuarioRepository usuarioRepository,
            PujaRepository pujaRepository) {
        this.subastaRepository = subastaRepository;
        this.catalogoRepository = catalogoRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.registroDeSubastaRepository = registroDeSubastaRepository;
        this.fotoRepository = fotoRepository;
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.pujaRepository = pujaRepository;
    }

    public HomeResponseDTO obtenerHome(String authorizationHeader) {
        boolean autenticado = esTokenAutenticado(authorizationHeader);

        List<Subasta> subastasAbiertas = subastaRepository.findByEstadoIgnoreCase("abierta");
        List<HomeSubastaDTO> tarjetas = subastasAbiertas.stream()
                .map(subasta -> toHomeSubastaDTO(subasta, autenticado))
                .toList();

        Integer subastasGanadas = null;
        if (autenticado) {
            try {
                String token = jwtService.extraerToken(authorizationHeader);
                String email = jwtService.validarTokenAutenticacion(token);
                Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
                if (usuario != null) {
                    Integer clienteId = usuario.getPersonaId();
                    List<Puja> clientePujas = pujaRepository.findByAsistente_Cliente_Identificador(clienteId);
                    
                    Map<Integer, Puja> maxBidsByItem = new HashMap<>();
                    for (Puja puja : clientePujas) {
                        Integer itemId = puja.getItem().getIdentificador();
                        Puja existing = maxBidsByItem.get(itemId);
                        if (existing == null || puja.getImporte().compareTo(existing.getImporte()) > 0) {
                            maxBidsByItem.put(itemId, puja);
                        }
                    }

                    int dbGanadas = 0;
                    for (Puja p : maxBidsByItem.values()) {
                        if (p.getGanador() != null && p.getGanador().equalsIgnoreCase("SI")) {
                            dbGanadas++;
                        }
                    }
                    subastasGanadas = dbGanadas;
                } else {
                    subastasGanadas = 0;
                }
            } catch (Exception e) {
                subastasGanadas = 0;
            }
        }

        HomeMetricasDTO metricas = autenticado
                ? new HomeMetricasDTO(subastaRepository.countByEstadoIgnoreCase("abierta"), subastasGanadas)
                : new HomeMetricasDTO(null, null);

        return new HomeResponseDTO(metricas, tarjetas);
    }

    private boolean esTokenAutenticado(String authorizationHeader) {
        try {
            String token = jwtService.extraerToken(authorizationHeader);
            if (token == null || token.isBlank()) {
                return false;
            }
            jwtService.validarTokenAutenticacion(token);
            return true;
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private HomeSubastaDTO toHomeSubastaDTO(Subasta subasta, boolean autenticado) {
        Catalogo catalogo = catalogoRepository.findBySubasta_Identificador(subasta.getIdentificador())
                .orElse(null);
        ItemCatalogo item = catalogo == null ? null
                : itemCatalogoRepository
                        .findFirstByCatalogo_IdentificadorOrderByIdentificadorAsc(catalogo.getIdentificador())
                        .orElse(null);

        String titulo = "Subasta " + subasta.getIdentificador();
        BigDecimal precioBase = null;

        if (item != null && item.getProducto() != null && item.getProducto().getDescripcionCompleta() != null) {
            titulo = item.getProducto().getDescripcionCompleta();
        }

        List<String> fotosData = fotoRepository
                .findByProducto_IdentificadorOrderByIdentificadorAsc(item.getProducto().getIdentificador())
                .stream()
                .limit(1)
                .map(foto -> {
                    byte[] bytes = foto.getFoto();
                    String str = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
                    if (str.startsWith("http")) {
                        return str;
                    }
                    return java.util.Base64.getEncoder().encodeToString(bytes);
                })
                .collect(Collectors.toList());

        byte[] foto = fotosData.isEmpty() ? null : fotosData.get(0).getBytes(java.nio.charset.StandardCharsets.UTF_8);

        if (autenticado && item != null) {
            precioBase = item.getPrecioBase();
        }

        java.time.LocalDateTime fechaHora = subasta.getHora() == null
                ? subasta.getFecha().atStartOfDay()
                : subasta.getFecha().atTime(subasta.getHora());

        return new HomeSubastaDTO(
                subasta.getIdentificador(),
                titulo,
                autenticado ? "USD" : null,
                subasta.getCategoria(),
                precioBase,
                fechaHora,
                foto
            );
    }
}
