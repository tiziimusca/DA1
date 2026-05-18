package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "subastadores")
public class Subastador {

    @Id
    private Integer identificador;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador", referencedColumnName = "identificador", nullable = false)
    private Persona persona;

    @Column(length = 15)
    private String matricula;

    @Column(length = 50)
    private String region;

}
