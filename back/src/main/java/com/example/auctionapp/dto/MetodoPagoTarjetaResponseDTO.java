package com.example.auctionapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MetodoPagoTarjetaResponseDTO {

    private Integer id;
    private String tipo = "tarjeta";
    private MetodoPagoTarjetaDatosDTO datos;
    private String estado;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetodoPagoTarjetaDatosDTO {
        private String nombreTitular;
        private String numeroTarjeta;
        private String fechaVencimiento; // MM/YY
        private String tipoTarjeta; // visa, mastercard, etc.
    }
}
