package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "personas")
public class Persona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @Column(length = 20, nullable = false)
    private String documento;

    @Column(length = 150, nullable = false)
    private String nombre;

    @Column(length = 250)
    private String direccion;

    @Column(length = 15)
    private String estado;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] foto;
}