package com.example.auctionapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PaisDTO {

    private Integer numero;

    @NotNull
    @NotBlank
    @Size(max = 250)
    private String nombre;

    @NotNull
    @NotBlank
    @Size(max = 250)
    private String nombreCorto;

    @NotNull
    @NotBlank
    @Size(max = 250)
    private String capital;

    @NotNull
    @NotBlank
    @Size(max = 250)
    private String nacionalidad;

    @NotNull
    @NotBlank
    @Size(max = 150)
    private String idiomas;

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getNombreCorto() {
        return nombreCorto;
    }

    public void setNombreCorto(String nombreCorto) {
        this.nombreCorto = nombreCorto;
    }

    public String getCapital() {
        return capital;
    }

    public void setCapital(String capital) {
        this.capital = capital;
    }

    public String getNacionalidad() {
        return nacionalidad;
    }

    public void setNacionalidad(String nacionalidad) {
        this.nacionalidad = nacionalidad;
    }

    public String getIdiomas() {
        return idiomas;
    }

    public void setIdiomas(String idiomas) {
        this.idiomas = idiomas;
    }
}