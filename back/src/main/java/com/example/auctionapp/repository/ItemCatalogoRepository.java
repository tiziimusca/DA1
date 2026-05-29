package com.example.auctionapp.repository;

import com.example.auctionapp.model.ItemCatalogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ItemCatalogoRepository extends JpaRepository<ItemCatalogo, Integer> {
    Optional<ItemCatalogo> findFirstByCatalogo_IdentificadorOrderByIdentificadorAsc(Integer catalogoId);

    List<ItemCatalogo> findByCatalogo_IdentificadorOrderByIdentificadorAsc(Integer catalogoId);

    Optional<ItemCatalogo> findFirstByCatalogo_IdentificadorAndSubastadoIgnoreCaseOrderByIdentificadorAsc(
            Integer catalogoId,
            String subastado);
}
