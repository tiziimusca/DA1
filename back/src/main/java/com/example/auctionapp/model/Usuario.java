package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
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

    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] dorso_doc;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] frente_doc;

    @Column(name = "contraseña", nullable = false)
    private String password;

    @Column(nullable = false)
    private Integer personaId;
}