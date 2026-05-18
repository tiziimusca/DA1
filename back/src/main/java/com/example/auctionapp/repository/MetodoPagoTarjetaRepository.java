package com.example.auctionapp.repository;

import com.example.auctionapp.model.MetodoPagoTarjeta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetodoPagoTarjetaRepository extends JpaRepository<MetodoPagoTarjeta, Integer> {

    List<MetodoPagoTarjeta> findByClienteId(Integer clienteId);

    Optional<MetodoPagoTarjeta> findByIdAndClienteId(Integer id, Integer clienteId);

    List<MetodoPagoTarjeta> findByClienteIdAndEstado(Integer clienteId, String estado);
}
