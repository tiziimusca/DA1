package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "registroDeSubasta")
public class RegistroDeSubasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @OneToOne
    @JoinColumn(name = "subasta", referencedColumnName = "identificador", nullable = false)
    private Subasta subasta;

    @OneToOne
    @JoinColumn(name = "duenio", referencedColumnName = "identificador", nullable = false)
    private Dueno duenio;

    @OneToOne
    @JoinColumn(name = "producto", referencedColumnName = "identificador", nullable = false)
    private Producto producto;

    @OneToOne
    @JoinColumn(name = "cliente", referencedColumnName = "identificador", nullable = false)
    private Cliente cliente;

    @Column(nullable = false)
    private BigDecimal importe;

    @Column(nullable = false)
    private BigDecimal comision;

}
