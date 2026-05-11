import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSubastasViewModel } from '../hooks/useSubastasViewModel';

export default function AuctionListScreen({ navigation }) {
  const { subastas, loading, error, cargarTodas, limpiarError } = useSubastasViewModel();

  useEffect(() => {
    cargarTodas();
  }, []);

  useEffect(() => {
    if (error) {
      limpiarError();
    }
  }, [error]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Subastas disponibles</Text>
      <FlatList
        data={subastas}
        keyExtractor={item => String(item.identificador)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetails', { subasta: item })}
          >
            <Text style={styles.title}>Subasta #{item.identificador}</Text>
            <Text>Estado: {item.estado}</Text>
            <Text>Fecha: {item.fecha}</Text>
            <Text>Ubicación: {item.ubicacion || 'No definida'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#f4f4f4',
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});
