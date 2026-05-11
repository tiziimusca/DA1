package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "duenios")
public class Dueno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @Column
    private Integer numeroPais;

    @Column(length = 2)
    private String verificacionFinanciera;

    @Column(length = 2)
    private String verificacionJudicial;

    @Column
    private Integer calificacionRiesgo;

    @Column(nullable = false)
    private Integer verificador;

}
