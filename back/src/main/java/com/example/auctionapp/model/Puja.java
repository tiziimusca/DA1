package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "pujos")
public class Puja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @OneToOne
    @JoinColumn(name = "asistente", referencedColumnName = "identificador", nullable = false)
    private Asistente asistente;

    @OneToOne
    @JoinColumn(name = "item", referencedColumnName = "identificador", nullable = false)
    private ItemCatalogo item;

    @Column(nullable = false)
    private BigDecimal importe;

    @Column(length = 2)
    private String ganador = "no";

}
