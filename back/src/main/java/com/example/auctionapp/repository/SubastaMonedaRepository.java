package com.example.auctionapp.repository;

import com.example.auctionapp.model.SubastaMoneda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubastaMonedaRepository extends JpaRepository<SubastaMoneda, Integer> {
}
