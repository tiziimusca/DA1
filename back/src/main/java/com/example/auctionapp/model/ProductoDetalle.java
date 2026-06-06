package com.example.auctionapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "productos_detalles")
public class ProductoDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @OneToOne
    @JoinColumn(name = "producto_id", referencedColumnName = "identificador", nullable = false)
    private Producto producto;

    @Column
    private String titulo;

    @Column
    private Boolean declaracionPropiedad;

    @Column(length = 20)
    private String estado = "en_inspeccion";

    @Column(length = 500)
    private String historia;

    @Column
    private String deposito;

    @Column
    private BigDecimal costoVerificacion;

    @Column
    private LocalDateTime fechaEnviado;

    @Column
    private LocalDateTime fechaRevision;

    @Column
    private LocalDateTime fechaInspeccionTecnica;

    @Column
    private LocalDateTime fechaAceptado;

    @ManyToOne
    @JoinColumn(name = "seguro_id", referencedColumnName = "identificador")
    private Seguro seguroEntity;
    
}