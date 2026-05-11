package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "registroDeSubasta")
public class RegistroDeSubasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @Column(nullable = false)
    private Integer subasta;

    @Column(nullable = false)
    private Integer duenio;

    @Column(nullable = false)
    private Integer producto;

    @Column(nullable = false)
    private Integer cliente;

    @Column(nullable = false)
    private BigDecimal importe;

    @Column(nullable = false)
    private BigDecimal comision;

}
