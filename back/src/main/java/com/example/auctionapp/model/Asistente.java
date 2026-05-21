package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "asistentes")
public class Asistente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @Column(nullable = false)
    private Integer numeroPostor;

    @OneToOne
    @JoinColumn(name = "cliente", referencedColumnName = "identificador", nullable = false)
    private Cliente cliente;

    @OneToOne
    @JoinColumn(name = "subasta", referencedColumnName = "identificador", nullable = false)
    private Subasta subasta;

}
