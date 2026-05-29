package com.example.auctionapp.dto;

public class HomeMetricasDTO {
    private Integer subastasActivas;
    private Integer subastasGanadas;

    public HomeMetricasDTO() {
    }

    public HomeMetricasDTO(Integer subastasActivas, Integer subastasGanadas) {
        this.subastasActivas = subastasActivas;
        this.subastasGanadas = subastasGanadas;
    }

    public Integer getSubastasActivas() {
        return subastasActivas;
    }

    public void setSubastasActivas(Integer subastasActivas) {
        this.subastasActivas = subastasActivas;
    }

    public Integer getSubastasGanadas() {
        return subastasGanadas;
    }

    public void setSubastasGanadas(Integer subastasGanadas) {
        this.subastasGanadas = subastasGanadas;
    }
}
