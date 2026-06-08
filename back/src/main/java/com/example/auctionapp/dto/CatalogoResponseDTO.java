package com.example.auctionapp.dto;

import java.util.List;

public class CatalogoResponseDTO {
    private Integer subastaId;
    private String fecha;
    private Integer catalogoId;
    private List<CatalogoItemDTO> items;

    public CatalogoResponseDTO(Integer subastaId, String fecha, Integer catalogoId, List<CatalogoItemDTO> items) {
        this.subastaId = subastaId;
        this.fecha = fecha;
        this.catalogoId = catalogoId;
        this.items = items;
    }

    public Integer getSubastaId() {
        return subastaId;
    }

    public void setSubastaId(Integer subastaId) {
        this.subastaId = subastaId;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public Integer getCatalogoId() {
        return catalogoId;
    }

    public void setCatalogoId(Integer catalogoId) {
        this.catalogoId = catalogoId;
    }

    public List<CatalogoItemDTO> getItems() {
        return items;
    }

    public void setItems(List<CatalogoItemDTO> items) {
        this.items = items;
    }
}
