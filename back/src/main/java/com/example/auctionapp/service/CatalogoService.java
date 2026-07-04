package com.example.auctionapp.service;

import com.example.auctionapp.dto.CatalogoItemDTO;
import com.example.auctionapp.dto.CatalogoResponseDTO;
import com.example.auctionapp.model.Catalogo;
import com.example.auctionapp.model.ItemCatalogo;
import com.example.auctionapp.model.Producto;
import com.example.auctionapp.model.Subasta;
import com.example.auctionapp.repository.CatalogoRepository;
import com.example.auctionapp.repository.FotoRepository;
import com.example.auctionapp.repository.ItemCatalogoRepository;
import com.example.auctionapp.repository.SubastaRepository;
import com.example.auctionapp.repository.SubastaMonedaRepository;
import com.example.auctionapp.model.SubastaMoneda;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CatalogoService {

    private final CatalogoRepository catalogoRepository;
    private final SubastaRepository subastaRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final FotoRepository fotoRepository;
    private final JwtService jwtService;
    private final SubastaMonedaRepository subastaMonedaRepository;

    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

    public CatalogoService(CatalogoRepository catalogoRepository,
            SubastaRepository subastaRepository,
            ItemCatalogoRepository itemCatalogoRepository,
            FotoRepository fotoRepository,
            JwtService jwtService,
            SubastaMonedaRepository subastaMonedaRepository) {
        this.catalogoRepository = catalogoRepository;
        this.subastaRepository = subastaRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.fotoRepository = fotoRepository;
        this.jwtService = jwtService;
        this.subastaMonedaRepository = subastaMonedaRepository;
    }

    public List<Catalogo> obtenerTodos() {
        return catalogoRepository.findAll();
    }

    public Optional<Catalogo> obtenerPorId(Integer id) {
        return catalogoRepository.findById(id);
    }

    public Catalogo crear(Catalogo catalogo) {
        return catalogoRepository.save(catalogo);
    }

    public Catalogo actualizar(Integer id, Catalogo catalogo) {
        return catalogoRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(catalogo, existing, "identificador");
                    return catalogoRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Catalogo no encontrado"));
    }

    public void eliminar(Integer id) {
        catalogoRepository.deleteById(id);
    }

    public CatalogoResponseDTO obtenerCatalogoPorSubasta(Integer subastaId, String authorizationHeader) {
        boolean autenticado = esTokenAutenticado(authorizationHeader);

        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new RuntimeException("Subasta no encontrada"));

        Catalogo catalogo = catalogoRepository.findBySubasta_Identificador(subastaId)
                .orElse(null);

        if (catalogo == null) {
            return new CatalogoResponseDTO(subasta.getIdentificador(), formatFecha(subasta), null, List.of());
        }

        List<ItemCatalogo> itemsCatalogo = itemCatalogoRepository
                .findByCatalogo_IdentificadorOrderByIdentificadorAsc(catalogo.getIdentificador());

        List<CatalogoItemDTO> itemDTOs = itemsCatalogo.stream()
                .map(item -> toCatalogoItemDTO(item, subasta, autenticado))
                .collect(Collectors.toList());

        return new CatalogoResponseDTO(subasta.getIdentificador(), formatFecha(subasta), catalogo.getIdentificador(),
                itemDTOs);
    }

    private CatalogoItemDTO toCatalogoItemDTO(ItemCatalogo item, Subasta subasta, boolean autenticado) {
        Producto producto = item.getProducto();

        List<String> fotosData = fotoRepository
                .findByProducto_IdentificadorOrderByIdentificadorAsc(producto.getIdentificador())
                .stream()
                .map(foto -> fotoBytesToString(foto.getFoto()))
                .collect(Collectors.toList());

        CatalogoItemDTO dto = new CatalogoItemDTO();
        dto.setId(item.getIdentificador());
        dto.setTitulo(producto.getDescripcionCatalogo());
        dto.setDescripcion(producto.getDescripcionCompleta());
        dto.setCategoria(subasta.getCategoria());
        dto.setFotos(fotosData);

        if (autenticado) {
            dto.setPrecioBase(item.getPrecioBase());
            String moneda = subastaMonedaRepository.findById(subasta.getIdentificador())
                                .map(SubastaMoneda::getMoneda)
                                .orElse("USD");
            dto.setMoneda(moneda);
        }

        return dto;
    }

    private String fotoBytesToString(byte[] bytes) {
        if (bytes == null || bytes.length == 0)
            return null;
        try {
            if (bytes.length < 1000) {
                String str = new String(bytes, StandardCharsets.UTF_8);
                if (str.startsWith("http"))
                    return str;
            }
        } catch (Exception ignored) {
        }
        return Base64.getEncoder().encodeToString(bytes);
    }

    private boolean esTokenAutenticado(String authorizationHeader) {
        try {
            String token = jwtService.extraerToken(authorizationHeader);
            if (token == null || token.isBlank())
                return false;
            jwtService.validarTokenAutenticacion(token);
            return true;
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private String formatFecha(Subasta subasta) {
        if (subasta.getFecha() == null)
            return null;
        LocalDateTime fechaHora = subasta.getHora() == null
                ? subasta.getFecha().atStartOfDay()
                : subasta.getFecha().atTime(subasta.getHora());
        return fechaHora.format(FECHA_FORMATTER);
    }
}
