package com.example.auctionapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetearPasswordDTO {

    @NotBlank
    private String tokenReseteo;

    @NotBlank
    @Size(min = 8, max = 255)
    private String nuevaPassword;

    @NotBlank
    @Size(min = 8, max = 255)
    private String confirmarPassword;

    public String getTokenReseteo() {
        return tokenReseteo;
    }

    public String getNuevaPassword() {
        return nuevaPassword;
    }

    public String getConfirmarPassword() {
        return confirmarPassword;
    }

    public void setTokenReseteo(String tokenReseteo) {
        this.tokenReseteo = tokenReseteo;
    }

    public void setNuevaPassword(String nuevaPassword) {
        this.nuevaPassword = nuevaPassword;
    }

    public void setConfirmarPassword(String confirmarPassword) {
        this.confirmarPassword = confirmarPassword;
    }
}