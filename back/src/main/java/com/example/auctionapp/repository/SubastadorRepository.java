package com.example.auctionapp.repository;

import com.example.auctionapp.model.Subastador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubastadorRepository extends JpaRepository<Subastador, Integer> {
}
