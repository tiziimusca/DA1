package com.example.auctionapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public class SeguimientoResponseDTO {

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm")
    private LocalDateTime fechaEnviado;
    
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm")
    private LocalDateTime fechaRevision;
    
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm")
    private LocalDateTime fechaInspeccionTecnica;
    
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm")
    private LocalDateTime fechaAceptado;
    
    private String tituloProducto;
    private String deposito;
    
    private SeguroInfoDTO seguro;
    
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm")
    private LocalDateTime fechaSubasta;
    
    private String sedeSubasta;
    private BigDecimal precioBase;
    private BigDecimal comision;
    private BigDecimal costoVerificacion;
    private String estadoActual;

    public LocalDateTime getFechaEnviado() {
        return fechaEnviado;
    }

    public void setFechaEnviado(LocalDateTime fechaEnviado) {
        this.fechaEnviado = fechaEnviado;
    }

    public LocalDateTime getFechaRevision() {
        return fechaRevision;
    }

    public void setFechaRevision(LocalDateTime fechaRevision) {
        this.fechaRevision = fechaRevision;
    }

    public LocalDateTime getFechaInspeccionTecnica() {
        return fechaInspeccionTecnica;
    }

    public void setFechaInspeccionTecnica(LocalDateTime fechaInspeccionTecnica) {
        this.fechaInspeccionTecnica = fechaInspeccionTecnica;
    }

    public LocalDateTime getFechaAceptado() {
        return fechaAceptado;
    }
    
    public void setFechaAceptado(LocalDateTime fechaAceptado) {
        this.fechaAceptado = fechaAceptado;
    }

    public String getTituloProducto() {
        return tituloProducto;
    }

    public void setTituloProducto(String tituloProducto) {
        this.tituloProducto = tituloProducto;
    }

    public String getDeposito() {
        return deposito;
    }

    public void setDeposito(String deposito) {
        this.deposito = deposito;
    }

    public SeguroInfoDTO getSeguro() {
        return seguro;
    }

    public void setSeguro(SeguroInfoDTO seguro) {
        this.seguro = seguro;
    }   

    public LocalDateTime getFechaSubasta() {
        return fechaSubasta;
    }

    public void setFechaSubasta(LocalDateTime fechaSubasta) {
        this.fechaSubasta = fechaSubasta;
    }

    public String getSedeSubasta() {
        return sedeSubasta;
    }

    public void setSedeSubasta(String sedeSubasta) {
        this.sedeSubasta = sedeSubasta;
    }

    public BigDecimal getPrecioBase() {
        return precioBase;
    }

    public void setPrecioBase(BigDecimal precioBase) {
        this.precioBase = precioBase;
    }

    public BigDecimal getComision() {
        return comision;
    }

    public void setComision(BigDecimal comision) {
        this.comision = comision;
    }

    public BigDecimal getCostoVerificacion() {
        return costoVerificacion;
    }

    public void setCostoVerificacion(BigDecimal costoVerificacion) {
        this.costoVerificacion = costoVerificacion; 
    }

    public String getEstadoActual() {
        return estadoActual;
    }

    public void setEstadoActual(String estadoActual) {
        this.estadoActual = estadoActual;
    }
}
