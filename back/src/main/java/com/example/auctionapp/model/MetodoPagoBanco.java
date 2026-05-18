package com.example.auctionapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "metodos_pago_banco")
public class MetodoPagoBanco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private Integer clienteId;

    @Column(nullable = false, length = 100)
    private String nombreTitular;

    @Column(nullable = false)
    private Integer dniTitular;

    @Column(nullable = false, length = 100)
    private String nombreBanco;

    @Column(nullable = false, length = 50)
    private String numeroCuenta;

    @Column(nullable = false, length = 20)
    private String estado; // "en_revision", "aprobado", "rechazado"

    @Column(name = "fecha_creacion")
    private Long fechaCreacion;

    @PrePersist
    protected void onCreate() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = System.currentTimeMillis();
        }
    }
}
