package com.example.auctionapp.service;

import com.example.auctionapp.model.Catalogo;
import com.example.auctionapp.repository.CatalogoRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CatalogoService {

    private final CatalogoRepository catalogoRepository;

    public CatalogoService(CatalogoRepository catalogoRepository) {
        this.catalogoRepository = catalogoRepository;
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
}
