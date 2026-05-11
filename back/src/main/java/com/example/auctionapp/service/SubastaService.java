package com.example.auctionapp.service;

import com.example.auctionapp.model.Subasta;
import com.example.auctionapp.repository.SubastaRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SubastaService {

    private final SubastaRepository subastaRepository;

    public SubastaService(SubastaRepository subastaRepository) {
        this.subastaRepository = subastaRepository;
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
}
