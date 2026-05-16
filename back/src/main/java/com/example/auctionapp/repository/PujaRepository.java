package com.example.auctionapp.repository;

import com.example.auctionapp.model.Puja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PujaRepository extends JpaRepository<Puja, Integer> {
}
