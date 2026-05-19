package com.example.auctionapp.service;

import com.example.auctionapp.model.ItemCatalogo;
import com.example.auctionapp.repository.ItemCatalogoRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemCatalogoService {

    private final ItemCatalogoRepository itemCatalogoRepository;

    public ItemCatalogoService(ItemCatalogoRepository itemCatalogoRepository) {
        this.itemCatalogoRepository = itemCatalogoRepository;
    }

    public List<ItemCatalogo> obtenerTodos() {
        return itemCatalogoRepository.findAll();
    }

    public Optional<ItemCatalogo> obtenerPorId(Integer id) {
        return itemCatalogoRepository.findById(id);
    }

    public ItemCatalogo crear(ItemCatalogo item) {
        return itemCatalogoRepository.save(item);
    }

    public ItemCatalogo actualizar(Integer id, ItemCatalogo item) {
        return itemCatalogoRepository.findById(id)
                .map(existing -> {
                    BeanUtils.copyProperties(item, existing, "identificador");
                    return itemCatalogoRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("ItemCatalogo no encontrado"));
    }

    public void eliminar(Integer id) {
        itemCatalogoRepository.deleteById(id);
    }
}
