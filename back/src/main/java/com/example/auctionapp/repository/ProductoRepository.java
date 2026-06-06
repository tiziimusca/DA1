package com.example.auctionapp.repository;

import com.example.auctionapp.model.Producto;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    List<Producto> findByDuenio(Integer duenio);
}
