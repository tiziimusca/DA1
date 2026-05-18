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
public class MetodoPagoChequeDTO {

    @NotNull(message = "El número de cheque es obligatorio")
    private Integer numeroCheque;

    @NotBlank(message = "La foto del frente es obligatoria")
    private String fotoFrente; // base64

    @NotBlank(message = "La foto del dorso es obligatoria")
    private String fotoDorso; // base64
}
