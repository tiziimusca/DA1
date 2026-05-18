package com.example.auctionapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "duenios")
public class Dueno {

    @Id
    private Integer identificador;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador", referencedColumnName = "identificador", nullable = false)
    private Persona persona;

    @Column
    private Integer numeroPais;

    @Column(length = 2)
    private String verificacionFinanciera;

    @Column(length = 2)
    private String verificacionJudicial;

    @Column
    private Integer calificacionRiesgo;

    @ManyToOne
    @JoinColumn(name = "verificador", referencedColumnName = "identificador", nullable = false)
    private Empleado verificador;

}
