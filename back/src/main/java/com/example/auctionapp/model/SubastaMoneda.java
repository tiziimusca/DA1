package com.example.auctionapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "subastas_monedas")
public class SubastaMoneda {

    @Id
    @Column(name = "subasta_id")
    private Integer subastaId;

    @Column(name = "moneda", length = 3, nullable = false)
    private String moneda; // "ARS" o "USD"
}
