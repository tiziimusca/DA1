package com.example.auctionapp.dto;

import java.util.List;

public class EstadoVivoResponseDTO {
    private Integer subastaId;
    private String estado;
    private Boolean enVivo;
    private List<PujaDTO> ultimasPujas;

    public Integer getSubastaId() {
        return subastaId;
    }

    public void setSubastaId(Integer subastaId) {
        this.subastaId = subastaId;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Boolean getEnVivo() {
        return enVivo;
    }

    public void setEnVivo(Boolean enVivo) {
        this.enVivo = enVivo;
    }

    public List<PujaDTO> getUltimasPujas() {
        return ultimasPujas;
    }

    public void setUltimasPujas(List<PujaDTO> ultimasPujas) {
        this.ultimasPujas = ultimasPujas;
    }
}