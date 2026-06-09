package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "seguros")
public class Seguro {

    @Id
    @Column(name = "nro_poliza", length = 30, nullable = false)
    private String nroPoliza;

    @Column(nullable = false, length = 150)
    private String compania;

    @Column(length = 2)
    private String polizaCombinada;

    @Column(nullable = false)
    private BigDecimal importe;

}
