package com.example.auctionapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "metodos_pago_tarjeta_tipo")
public class MetodoPagoTarjetaTipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "metodo_pago_tarjeta_id", nullable = false)
    private Integer metodoPagoTarjetaId;

    @Column(name = "tipo_tarjeta", nullable = false, length = 20)
    private String tipoTarjeta; // "credito", "debito"
}
