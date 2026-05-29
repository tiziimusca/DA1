package com.example.auctionapp.dto;

import java.util.List;

public class HomeResponseDTO {
    private HomeMetricasDTO metricas;
    private List<HomeSubastaDTO> subastasActivas;

    public HomeResponseDTO() {
    }

    public HomeResponseDTO(HomeMetricasDTO metricas, List<HomeSubastaDTO> subastasActivas) {
        this.metricas = metricas;
        this.subastasActivas = subastasActivas;
    }

    public HomeMetricasDTO getMetricas() {
        return metricas;
    }

    public void setMetricas(HomeMetricasDTO metricas) {
        this.metricas = metricas;
    }

    public List<HomeSubastaDTO> getSubastasActivas() {
        return subastasActivas;
    }

    public void setSubastasActivas(List<HomeSubastaDTO> subastasActivas) {
        this.subastasActivas = subastasActivas;
    }
}
