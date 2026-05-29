package com.example.auctionapp.service;

import com.example.auctionapp.dto.HomeMetricasDTO;
import com.example.auctionapp.dto.HomeResponseDTO;
import com.example.auctionapp.dto.HomeSubastaDTO;
import com.example.auctionapp.model.Catalogo;
import com.example.auctionapp.model.ItemCatalogo;
import com.example.auctionapp.model.RegistroDeSubasta;
import com.example.auctionapp.model.Subasta;
import com.example.auctionapp.repository.CatalogoRepository;
import com.example.auctionapp.repository.ItemCatalogoRepository;
import com.example.auctionapp.repository.RegistroDeSubastaRepository;
import com.example.auctionapp.repository.SubastaRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class HomeService {

    private final SubastaRepository subastaRepository;
    private final CatalogoRepository catalogoRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final RegistroDeSubastaRepository registroDeSubastaRepository;
    private final JwtService jwtService;

    public HomeService(SubastaRepository subastaRepository,
            CatalogoRepository catalogoRepository,
            ItemCatalogoRepository itemCatalogoRepository,
            RegistroDeSubastaRepository registroDeSubastaRepository,
            JwtService jwtService) {
        this.subastaRepository = subastaRepository;
        this.catalogoRepository = catalogoRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.registroDeSubastaRepository = registroDeSubastaRepository;
        this.jwtService = jwtService;
    }

    public HomeResponseDTO obtenerHome(String authorizationHeader) {
        boolean autenticado = esTokenAutenticado(authorizationHeader);

        List<Subasta> subastasAbiertas = subastaRepository.findByEstadoIgnoreCase("abierta");
        List<HomeSubastaDTO> tarjetas = subastasAbiertas.stream()
                .map(subasta -> toHomeSubastaDTO(subasta, autenticado))
                .toList();

        HomeMetricasDTO metricas = autenticado
                ? new HomeMetricasDTO(subastaRepository.countByEstadoIgnoreCase("abierta"),
                        (int) registroDeSubastaRepository.count())
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

        if (catalogo != null && catalogo.getDescripcion() != null && !catalogo.getDescripcion().isBlank()) {
            titulo = catalogo.getDescripcion();
        } else if (item != null && item.getProducto() != null && item.getProducto().getDescripcionCompleta() != null) {
            titulo = item.getProducto().getDescripcionCompleta();
        }

        if (autenticado && item != null) {
            precioBase = item.getPrecioBase();
        }

        return new HomeSubastaDTO(
                subasta.getIdentificador(),
                titulo,
                autenticado ? "USD" : null,
                subasta.getCategoria(),
                precioBase,
                subasta.getFecha());
    }
}
