package com.example.auctionapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "metodos_pago_cheque")
public class MetodoPagoCheque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private Integer clienteId;

    @Column(nullable = false)
    private Integer numeroCheque;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] fotoFrente;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] fotoDorso;

    @Column(nullable = false, length = 20)
    private String estado; // "en_revision", "aprobado", "rechazado"

    @Column(name = "moneda", length = 3, nullable = false)
    private String moneda = "USD";

    @Column(name = "monto_disponible", nullable = false, columnDefinition = "DECIMAL(19,2) DEFAULT 0.00")
    private java.math.BigDecimal montoDisponible = java.math.BigDecimal.ZERO;

    @Column(name = "fecha_creacion")
    private Long fechaCreacion;

    @PrePersist
    protected void onCreate() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = System.currentTimeMillis();
        }
    }
}
