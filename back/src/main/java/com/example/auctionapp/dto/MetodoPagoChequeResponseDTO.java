package com.example.auctionapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MetodoPagoChequeResponseDTO {

    private Integer id;
    private String tipo = "cheque";
    private MetodoPagoChequeDatosDTO datos;
    private String estado;
    private java.math.BigDecimal montoDisponible;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetodoPagoChequeDatosDTO {
        private String numeroCheque;
        private MetodoPagoChequePhotosDTO fotos;
        private java.math.BigDecimal montoDisponible;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetodoPagoChequePhotosDTO {
        private String frente;
        private String dorso;
    }
}
