package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @Column
    private LocalDate fecha;

    @Column(length = 2)
    private String disponible;

    @Column(length = 500)
    private String descripcionCatalogo = "No posee";

    @Column(nullable = false, length = 300)
    private String descripcionCompleta;

    @Column(nullable = false)
    private Integer revisor;

    @Column(nullable = false)
    private Integer duenio;

    @Column(length = 30)
    private String seguro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revisor", insertable = false, updatable = false)
    private Empleado revisorEmpleado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "duenio", insertable = false, updatable = false)
    private Dueno duenioEntity;

}
