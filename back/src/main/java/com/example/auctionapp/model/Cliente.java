package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "clientes")
public class Cliente {

    @Id
    private Integer identificador;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador", referencedColumnName = "identificador", nullable = false)
    private Persona persona;

    @ManyToOne
    @JoinColumn(name = "numeroPais", referencedColumnName = "numero")
    private Pais numeroPais;

    @Column(length = 2)
    private String admitido;

    @Column(length = 10)
    private String categoria;

    @ManyToOne
    @JoinColumn(name = "verificador", referencedColumnName = "identificador", nullable = false)
    private Empleado verificador;

}
