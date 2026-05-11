package com.example.auctionapp.service;

import com.example.auctionapp.model.Producto;
import com.example.auctionapp.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerPorId(Integer id) {
        return productoRepository.findById(id);
    }

    public List<Producto> obtenerDisponibles() {
        return productoRepository.findAll()
                .stream()
                .filter(p -> "si".equalsIgnoreCase(p.getDisponible()))
                .toList();
    }

    public Producto crear(Producto producto) {
        if (producto.getDisponible() == null) {
            producto.setDisponible("si");
        }
        if (producto.getDescripcionCatalogo() == null) {
            producto.setDescripcionCatalogo("No Posee");
        }
        return productoRepository.save(producto);
    }

    public Producto actualizar(Integer id, Producto producto) {
        return productoRepository.findById(id)
                .map(existing -> {
                    existing.setFecha(producto.getFecha());
                    existing.setDisponible(producto.getDisponible());
                    existing.setDescripcionCatalogo(producto.getDescripcionCatalogo());
                    existing.setDescripcionCompleta(producto.getDescripcionCompleta());
                    existing.setRevisor(producto.getRevisor());
                    existing.setDuenio(producto.getDuenio());
                    existing.setSeguro(producto.getSeguro());
                    return productoRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    public void eliminar(Integer id) {
        productoRepository.deleteById(id);
    }
}
