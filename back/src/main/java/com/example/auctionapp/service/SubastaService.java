package com.example.auctionapp.service;

import com.example.auctionapp.dto.SubastaActivaDTO;
import com.example.auctionapp.model.Catalogo;
import com.example.auctionapp.model.Foto;
import com.example.auctionapp.model.ItemCatalogo;
import com.example.auctionapp.model.Producto;
import com.example.auctionapp.model.Subasta;
import com.example.auctionapp.repository.CatalogoRepository;
import com.example.auctionapp.repository.FotoRepository;
import com.example.auctionapp.repository.ItemCatalogoRepository;
import com.example.auctionapp.repository.SubastaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class SubastaService {

    private final SubastaRepository subastaRepository;
    private final CatalogoRepository catalogoRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final FotoRepository fotoRepository;

    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

    public SubastaService(SubastaRepository subastaRepository,
            CatalogoRepository catalogoRepository,
            ItemCatalogoRepository itemCatalogoRepository,
            FotoRepository fotoRepository) {
        this.subastaRepository = subastaRepository;
        this.catalogoRepository = catalogoRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.fotoRepository = fotoRepository;
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

        return "/api/fotos/" + fotos.get(0).getIdentificador();
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

}
