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
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @Column(nullable = false, unique = true)
    private String email;

    @Lob
    @Column
    private byte[] dorso_doc;
    
    @Lob
    @Column
    private byte[] frente_doc;

    @Column(nullable = false)
    private String contraseña;

    @Column(nullable = false)
    private Integer personaId;
}