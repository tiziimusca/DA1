package com.example.auctionapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MetodoPagoTarjetaDTO {

    @NotBlank(message = "El nombre del titular es obligatorio")
    private String nombreTitular;

    @NotNull(message = "El número de tarjeta es obligatorio")
    private Long numeroTarjeta;

    @NotBlank(message = "La fecha de vencimiento es obligatoria")
    private String fechaVencimiento; // "MM/YY"

    @NotBlank(message = "El CVV es obligatorio")
    private String cvv;

    @NotBlank(message = "El tipo de tarjeta es obligatorio")
    private String tipoTarjeta; // visa, mastercard, etc.
}
