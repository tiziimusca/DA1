package com.example.auctionapp.repository;

import com.example.auctionapp.model.ProductoDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoDetalleRepository extends JpaRepository<ProductoDetalle, Integer> {
    Optional<ProductoDetalle> findByProductoIdentificador(Integer productoId);
    
    @Query("SELECT pd FROM ProductoDetalle pd WHERE pd.producto.duenio = :duenioId")
    List<ProductoDetalle> findByDuenio(@Param("duenioId") Integer duenioId);
}
