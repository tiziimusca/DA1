import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { createWebSocket, sendBid } from '../api/auctionApi';

export default function BidScreen({ route }) {
  const { subasta } = route.params || {};
  const [monto, setMonto] = useState('');
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    const ws = createWebSocket(
      (data) => {
        console.log('Bid recibido:', data);
        Alert.alert('Nueva puja', JSON.stringify(data));
      },
      () => setConectado(true),
      (error) => {
        console.error('WebSocket error:', error);
        setConectado(false);
      }
    );

    setSocket(ws);

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const enviarPuja = () => {
    if (!monto || isNaN(monto)) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    const bid = {
      subasta: subasta?.identificador,
      monto: parseFloat(monto),
      timestamp: new Date().toISOString(),
    };

    sendBid(socket, bid);
    Alert.alert('Éxito', 'Puja enviada');
    setMonto('');
  };

  if (!subasta) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Subasta no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pujar en Subasta #{subasta.identificador}</Text>
      <Text style={styles.statusText}>
        Conexión WebSocket: {conectado ? '✓ Conectado' : '✗ Desconectado'}
      </Text>
      <Text style={styles.property}>Estado: {subasta.estado}</Text>
      <Text style={styles.property}>Ubicación: {subasta.ubicacion || 'No definida'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa tu monto de puja"
        keyboardType="decimal-pad"
        value={monto}
        onChangeText={setMonto}
      />

      <View style={styles.buttonContainer}>
        <Button title="Enviar Puja" onPress={enviarPuja} disabled={!conectado} />
      </View>
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
  statusText: {
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  property: {
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
