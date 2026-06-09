package com.example.auctionapp.repository;

import com.example.auctionapp.model.MetodoPagoTarjetaTipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MetodoPagoTarjetaTipoRepository extends JpaRepository<MetodoPagoTarjetaTipo, Integer> {

    Optional<MetodoPagoTarjetaTipo> findByMetodoPagoTarjetaId(Integer metodoPagoTarjetaId);
}
