package com.example.auctionapp.repository;

import com.example.auctionapp.model.Asistente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AsistenteRepository extends JpaRepository<Asistente, Integer> {
}
