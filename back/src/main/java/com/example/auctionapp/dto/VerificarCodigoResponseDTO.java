package com.example.auctionapp.dto;

public class VerificarCodigoResponseDTO {

    private String tokenReseteo;

    public VerificarCodigoResponseDTO(String tokenReseteo) {
        this.tokenReseteo = tokenReseteo;
    }

    public String getTokenReseteo() {
        return tokenReseteo;
    }

    public void setTokenReseteo(String tokenReseteo) {
        this.tokenReseteo = tokenReseteo;
    }
}
