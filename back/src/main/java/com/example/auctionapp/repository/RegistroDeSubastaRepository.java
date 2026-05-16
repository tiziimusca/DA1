package com.example.auctionapp.repository;

import com.example.auctionapp.model.RegistroDeSubasta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistroDeSubastaRepository extends JpaRepository<RegistroDeSubasta, Integer> {
}
