package com.example.auctionapp.repository;

import com.example.auctionapp.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Integer> {
    Empleado getEmpleadoByIdentificador(Integer identificador);

    Empleado findFirstByOrderByIdentificadorAsc();
}
