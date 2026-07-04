package com.example.auctionapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "metodos_pago_tarjeta")
public class MetodoPagoTarjeta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private Integer clienteId;

    @Column(nullable = false, length = 100)
    private String nombreTitular;

    @Column(nullable = false, length = 20)
    private Long numeroTarjeta;

    @Column(nullable = false, length = 10)
    private String fechaVencimiento; // "MM/YY"

    @Column(nullable = false, length = 5)
    private String cvv;

    @Column(nullable = false, length = 20)
    private String estado; // "en_revision", "aprobado", "rechazado"

    @Column(nullable = false)
    private Boolean internacional = false;

    @Column(name = "fecha_creacion")
    private Long fechaCreacion;

    @PrePersist
    protected void onCreate() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = System.currentTimeMillis();
        }
    }
}
