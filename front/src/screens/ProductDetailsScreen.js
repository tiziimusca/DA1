import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

export default function ProductDetailsScreen({ route, navigation }) {
  const { subasta } = route.params || {};

  if (!subasta) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Subasta no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Subasta #{subasta.identificador}</Text>
      <Text style={styles.property}>Estado: {subasta.estado}</Text>
      <Text style={styles.property}>Fecha: {subasta.fecha}</Text>
      <Text style={styles.property}>Hora: {subasta.hora}</Text>
      <Text style={styles.property}>Ubicación: {subasta.ubicacion || 'No definida'}</Text>
      <Text style={styles.property}>Capacidad: {subasta.capacidadAsistentes || '---'}</Text>
      <Text style={styles.property}>Categoría: {subasta.categoria}</Text>
      <Button title="Ir a pujar" onPress={() => navigation.navigate('Bid', { subasta })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  property: {
    fontSize: 16,
    marginBottom: 12,
  },
});
