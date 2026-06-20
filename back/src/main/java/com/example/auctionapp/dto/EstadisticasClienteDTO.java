package com.example.auctionapp.dto;

import java.math.BigDecimal;
import java.util.List;

public class EstadisticasClienteDTO {
    private Integer subastasAsistidas;
    private String subastasAsistidasDelta;
    private String subastasAsistidasPeriodo;

    private Integer subastasGanadas;
    private String subastasGanadasDelta;
    private String subastasGanadasPeriodo;

    private BigDecimal montoTotalOfertado;
    private String montoTotalOfertadoDelta;
    private String montoTotalOfertadoPeriodo;

    private BigDecimal totalGastado;
    private String totalGastadoDelta;
    private String totalGastadoPeriodo;

    private Integer tasaVictorias;
    private String tasaVictoriasInsight;

    private List<SubastaParticipadaDTO> participadas;

    public EstadisticasClienteDTO() {
    }

    public EstadisticasClienteDTO(Integer subastasAsistidas, String subastasAsistidasDelta, String subastasAsistidasPeriodo,
                                   Integer subastasGanadas, String subastasGanadasDelta, String subastasGanadasPeriodo,
                                   BigDecimal montoTotalOfertado, String montoTotalOfertadoDelta, String montoTotalOfertadoPeriodo,
                                   BigDecimal totalGastado, String totalGastadoDelta, String totalGastadoPeriodo,
                                   Integer tasaVictorias, String tasaVictoriasInsight,
                                   List<SubastaParticipadaDTO> participadas) {
        this.subastasAsistidas = subastasAsistidas;
        this.subastasAsistidasDelta = subastasAsistidasDelta;
        this.subastasAsistidasPeriodo = subastasAsistidasPeriodo;
        this.subastasGanadas = subastasGanadas;
        this.subastasGanadasDelta = subastasGanadasDelta;
        this.subastasGanadasPeriodo = subastasGanadasPeriodo;
        this.montoTotalOfertado = montoTotalOfertado;
        this.montoTotalOfertadoDelta = montoTotalOfertadoDelta;
        this.montoTotalOfertadoPeriodo = montoTotalOfertadoPeriodo;
        this.totalGastado = totalGastado;
        this.totalGastadoDelta = totalGastadoDelta;
        this.totalGastadoPeriodo = totalGastadoPeriodo;
        this.tasaVictorias = tasaVictorias;
        this.tasaVictoriasInsight = tasaVictoriasInsight;
        this.participadas = participadas;
    }

    public Integer getSubastasAsistidas() {
        return subastasAsistidas;
    }

    public void setSubastasAsistidas(Integer subastasAsistidas) {
        this.subastasAsistidas = subastasAsistidas;
    }

    public String getSubastasAsistidasDelta() {
        return subastasAsistidasDelta;
    }

    public void setSubastasAsistidasDelta(String subastasAsistidasDelta) {
        this.subastasAsistidasDelta = subastasAsistidasDelta;
    }

    public String getSubastasAsistidasPeriodo() {
        return subastasAsistidasPeriodo;
    }

    public void setSubastasAsistidasPeriodo(String subastasAsistidasPeriodo) {
        this.subastasAsistidasPeriodo = subastasAsistidasPeriodo;
    }

    public Integer getSubastasGanadas() {
        return subastasGanadas;
    }

    public void setSubastasGanadas(Integer subastasGanadas) {
        this.subastasGanadas = subastasGanadas;
    }

    public String getSubastasGanadasDelta() {
        return subastasGanadasDelta;
    }

    public void setSubastasGanadasDelta(String subastasGanadasDelta) {
        this.subastasGanadasDelta = subastasGanadasDelta;
    }

    public String getSubastasGanadasPeriodo() {
        return subastasGanadasPeriodo;
    }

    public void setSubastasGanadasPeriodo(String subastasGanadasPeriodo) {
        this.subastasGanadasPeriodo = subastasGanadasPeriodo;
    }

    public BigDecimal getMontoTotalOfertado() {
        return montoTotalOfertado;
    }

    public void setMontoTotalOfertado(BigDecimal montoTotalOfertado) {
        this.montoTotalOfertado = montoTotalOfertado;
    }

    public String getMontoTotalOfertadoDelta() {
        return montoTotalOfertadoDelta;
    }

    public void setMontoTotalOfertadoDelta(String montoTotalOfertadoDelta) {
        this.montoTotalOfertadoDelta = montoTotalOfertadoDelta;
    }

    public String getMontoTotalOfertadoPeriodo() {
        return montoTotalOfertadoPeriodo;
    }

    public void setMontoTotalOfertadoPeriodo(String montoTotalOfertadoPeriodo) {
        this.montoTotalOfertadoPeriodo = montoTotalOfertadoPeriodo;
    }

    public BigDecimal getTotalGastado() {
        return totalGastado;
    }

    public void setTotalGastado(BigDecimal totalGastado) {
        this.totalGastado = totalGastado;
    }

    public String getTotalGastadoDelta() {
        return totalGastadoDelta;
    }

    public void setTotalGastadoDelta(String totalGastadoDelta) {
        this.totalGastadoDelta = totalGastadoDelta;
    }

    public String getTotalGastadoPeriodo() {
        return totalGastadoPeriodo;
    }

    public void setTotalGastadoPeriodo(String totalGastadoPeriodo) {
        this.totalGastadoPeriodo = totalGastadoPeriodo;
    }

    public Integer getTasaVictorias() {
        return tasaVictorias;
    }

    public void setTasaVictorias(Integer tasaVictorias) {
        this.tasaVictorias = tasaVictorias;
    }

    public String getTasaVictoriasInsight() {
        return tasaVictoriasInsight;
    }

    public void setTasaVictoriasInsight(String tasaVictoriasInsight) {
        this.tasaVictoriasInsight = tasaVictoriasInsight;
    }

    public List<SubastaParticipadaDTO> getParticipadas() {
        return participadas;
    }

    public void setParticipadas(List<SubastaParticipadaDTO> participadas) {
        this.participadas = participadas;
    }
}
