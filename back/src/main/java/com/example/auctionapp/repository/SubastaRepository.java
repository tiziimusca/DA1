package com.example.auctionapp.repository;

import com.example.auctionapp.model.Subasta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubastaRepository extends JpaRepository<Subasta, Integer> {
}
