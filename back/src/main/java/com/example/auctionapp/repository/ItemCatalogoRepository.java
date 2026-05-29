package com.example.auctionapp.repository;

import com.example.auctionapp.model.ItemCatalogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItemCatalogoRepository extends JpaRepository<ItemCatalogo, Integer> {
    Optional<ItemCatalogo> findFirstByCatalogo_IdentificadorOrderByIdentificadorAsc(Integer catalogoId);
}
