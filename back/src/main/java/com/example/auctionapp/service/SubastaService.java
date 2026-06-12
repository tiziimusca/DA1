package com.example.auctionapp.service;

import com.example.auctionapp.dto.SubastaActivaDTO;
import com.example.auctionapp.dto.DetalleEstaticoResponseDTO;
import com.example.auctionapp.dto.DetalleEstaticoItemDTO;
import com.example.auctionapp.dto.EstadoVivoResponseDTO;
import com.example.auctionapp.dto.PujaDTO;
import com.example.auctionapp.model.Catalogo;
import com.example.auctionapp.model.Foto;
import com.example.auctionapp.model.ItemCatalogo;
import com.example.auctionapp.model.Producto;
import com.example.auctionapp.model.Subasta;
import com.example.auctionapp.repository.CatalogoRepository;
import com.example.auctionapp.repository.FotoRepository;
import com.example.auctionapp.repository.ItemCatalogoRepository;
import com.example.auctionapp.repository.SubastaRepository;
import com.example.auctionapp.repository.PujaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SubastaService {

    private final SubastaRepository subastaRepository;
    private final CatalogoRepository catalogoRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final FotoRepository fotoRepository;
    private final PujaRepository pujaRepository;

    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

    public SubastaService(SubastaRepository subastaRepository,
            CatalogoRepository catalogoRepository,
            ItemCatalogoRepository itemCatalogoRepository,
            FotoRepository fotoRepository,
            PujaRepository pujaRepository) {
        this.subastaRepository = subastaRepository;
        this.catalogoRepository = catalogoRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.fotoRepository = fotoRepository;
        this.pujaRepository = pujaRepository;
    }

    public List<Subasta> obtenerTodas() {
        return subastaRepository.findAll();
    }

    public Optional<Subasta> obtenerPorId(Integer id) {
        return subastaRepository.findById(id);
    }

    public List<Subasta> obtenerAbiertas() {
        return subastaRepository.findAll()
                .stream()
                .filter(s -> "abierta".equalsIgnoreCase(s.getEstado()))
                .toList();
    }

    public List<SubastaActivaDTO> obtenerActivas() {
        return obtenerAbiertas().stream()
                .map(this::toSubastaActivaDTO)
                .toList();
    }

    public List<Subasta> obtenerProximas() {
        LocalDate hoy = LocalDate.now();
        return subastaRepository.findAll()
                .stream()
                .filter(s -> s.getFecha() != null && s.getFecha().isAfter(hoy))
                .toList();
    }

    public Subasta crear(Subasta subasta) {
        if (subasta.getEstado() == null) {
            subasta.setEstado("abierta");
        }
        return subastaRepository.save(subasta);
    }

    public Subasta actualizar(Integer id, Subasta subasta) {
        return subastaRepository.findById(id)
                .map(existing -> {
                    existing.setFecha(subasta.getFecha());
                    existing.setHora(subasta.getHora());
                    existing.setEstado(subasta.getEstado());
                    existing.setSubastador(subasta.getSubastador());
                    existing.setUbicacion(subasta.getUbicacion());
                    existing.setCapacidadAsistentes(subasta.getCapacidadAsistentes());
                    existing.setTieneDeposito(subasta.getTieneDeposito());
                    existing.setSeguridadPropia(subasta.getSeguridadPropia());
                    existing.setCategoria(subasta.getCategoria());
                    return subastaRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Subasta no encontrada"));
    }

    public void eliminar(Integer id) {
        subastaRepository.deleteById(id);
    }

    private SubastaActivaDTO toSubastaActivaDTO(Subasta subasta) {
        Catalogo catalogo = catalogoRepository.findBySubasta_Identificador(subasta.getIdentificador()).orElse(null);
        ItemCatalogo item = itemCatalogoRepository
                .findFirstByCatalogo_IdentificadorAndSubastadoIgnoreCaseOrderByIdentificadorAsc(
                        catalogo.getIdentificador(), "no")
                .orElse(null);

        Producto producto = item.getProducto();

        SubastaActivaDTO dto = new SubastaActivaDTO();
        dto.setId(subasta.getIdentificador());
        dto.setTituloProducto(producto.getDescripcionCatalogo());
        dto.setCategoria(subasta.getCategoria());
        dto.setFecha(formatFecha(subasta));
        dto.setPrecioBase(item.getPrecioBase());
        dto.setMoneda("USD");
        dto.setImagen(primerUrlImagen(item));
        return dto;
    }

    private String primerUrlImagen(ItemCatalogo item) {
        if (item == null || item.getProducto() == null) {
            return null;
        }

        List<Foto> fotos = fotoRepository
                .findByProducto_IdentificadorOrderByIdentificadorAsc(item.getProducto().getIdentificador());
        if (fotos == null || fotos.isEmpty()) {
            return null;
        }

        byte[] bytes = fotos.get(0).getFoto();
        if (bytes == null) {
            return null;
        }
        String str = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
        if (str.startsWith("http")) {
            return str;
        }
        return java.util.Base64.getEncoder().encodeToString(bytes);
    }

    private String formatFecha(Subasta subasta) {
        if (subasta.getFecha() == null) {
            return null;
        }
        LocalDateTime fechaHora = subasta.getHora() == null
                ? subasta.getFecha().atStartOfDay()
                : subasta.getFecha().atTime(subasta.getHora());
        return fechaHora.format(FECHA_FORMATTER);
    }

    public Optional<DetalleEstaticoResponseDTO> obtenerDetalleEstatico(Integer id, String authorizationHeader) {
        return subastaRepository.findById(id).map(subasta -> {
            DetalleEstaticoResponseDTO dto = new DetalleEstaticoResponseDTO();
            dto.setFecha(formatFecha(subasta));
            if (subasta.getSubastador() != null && subasta.getSubastador().getPersona() != null) {
                dto.setRematador(subasta.getSubastador().getPersona().getNombre());
            }

            Catalogo catalogo = catalogoRepository.findBySubasta_Identificador(subasta.getIdentificador()).orElse(null);
            if (catalogo != null) {
                List<ItemCatalogo> items = itemCatalogoRepository
                        .findByCatalogo_IdentificadorOrderByIdentificadorAsc(catalogo.getIdentificador());

                if (!items.isEmpty()) {
                    ItemCatalogo firstItem = items.get(0);
                    Producto producto = firstItem.getProducto();
                    if (producto != null) {
                        dto.setTitulo(producto.getDescripcionCatalogo());
                        dto.setDescripcion(producto.getDescripcionCompleta());
                        if (producto.getDuenioEntity() != null && producto.getDuenioEntity().getPersona() != null) {
                            dto.setDuenio(producto.getDuenioEntity().getPersona().getNombre());
                        }
                    }

                    List<DetalleEstaticoItemDTO> itemDtos = items.stream().map(item -> {
                        DetalleEstaticoItemDTO itemDto = new DetalleEstaticoItemDTO();
                        itemDto.setId(item.getIdentificador());
                        if (item.getProducto() != null) {
                            itemDto.setTitulo(item.getProducto().getDescripcionCatalogo());
                            itemDto.setDescripcion(item.getProducto().getDescripcionCompleta());
                            List<Foto> fotos = fotoRepository.findByProducto_IdentificadorOrderByIdentificadorAsc(
                                    item.getProducto().getIdentificador());
                            if (fotos != null && !fotos.isEmpty()) {
                                itemDto.setFotos(fotos.stream().map(f -> {
                                    byte[] bytes = f.getFoto();
                                    if (bytes == null) return null;
                                    String str = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
                                    if (str.startsWith("http")) {
                                        return str;
                                    }
                                    return java.util.Base64.getEncoder().encodeToString(bytes);
                                }).filter(java.util.Objects::nonNull).toList());
                            } else {
                                itemDto.setFotos(java.util.Collections.emptyList());
                            }
                        }
                        itemDto.setPrecioBase(item.getPrecioBase());
                        itemDto.setMoneda("USD");
                        return itemDto;
                    }).toList();
                    dto.setItems(itemDtos);
                } else {
                    dto.setItems(java.util.Collections.emptyList());
                }
            } else {
                dto.setItems(java.util.Collections.emptyList());
            }
            return dto;
        });
    }

    public Optional<EstadoVivoResponseDTO> obtenerEstadoVivo(Integer id) {
        return subastaRepository.findById(id).map(subasta -> {
            EstadoVivoResponseDTO dto = new EstadoVivoResponseDTO();
            dto.setSubastaId(subasta.getIdentificador());
            dto.setEstado(subasta.getEstado());
            dto.setEnVivo("abierta".equalsIgnoreCase(subasta.getEstado())
                    || "en curso".equalsIgnoreCase(subasta.getEstado()));

            Catalogo catalogo = catalogoRepository.findBySubasta_Identificador(subasta.getIdentificador()).orElse(null);
            if (catalogo != null) {
                ItemCatalogo item = itemCatalogoRepository
                        .findFirstByCatalogo_IdentificadorAndSubastadoIgnoreCaseOrderByIdentificadorAsc(
                                catalogo.getIdentificador(), "no")
                        .orElse(null);

                if (item != null) {
                    List<com.example.auctionapp.model.Puja> pujas = pujaRepository
                            .findByItem_IdentificadorOrderByImporteDesc(item.getIdentificador());
                    List<PujaDTO> pujasDtos = pujas.stream().map(p -> {
                        PujaDTO pujaDto = new PujaDTO();
                        pujaDto.setId(p.getIdentificador());
                        pujaDto.setImporte(p.getImporte());
                        if (p.getAsistente() != null && p.getAsistente().getCliente() != null
                                && p.getAsistente().getCliente().getPersona() != null) {
                            pujaDto.setNombreAsistente(p.getAsistente().getCliente().getPersona().getNombre());
                        }
                        pujaDto.setFecha(LocalDateTime.now());
                        return pujaDto;
                    }).toList();
                    dto.setUltimasPujas(pujasDtos);
                } else {
                    dto.setUltimasPujas(java.util.Collections.emptyList());
                }
            } else {
                dto.setUltimasPujas(java.util.Collections.emptyList());
            }
            return dto;
        });
    }

}
