import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../theme/AppTheme';
import { createWebSocket, enviarPujaRest, fetchEstadoVivo, fetchDetalleEstatico } from '../api/auctionApi';
import authManager from '../auth/authManager';

export default function BidScreen({ navigation, route }) {
  const { colors, radius } = useAppTheme();
  const { subasta } = route.params || {};
  const [monto, setMonto] = useState('');
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [liveState, setLiveState] = useState(null);
  const [staticDetails, setStaticDetails] = useState(null);

  const loadData = async () => {
    if (!subasta?.identificador) return;
    try {
      const token = await authManager.getToken();
      const authHeader = token ? `Bearer ${token}` : null;
      
      const [vivoData, estaticoData] = await Promise.all([
        fetchEstadoVivo(subasta.identificador),
        fetchDetalleEstatico(subasta.identificador, authHeader)
      ]);
      
      setLiveState(vivoData);
      setStaticDetails(estaticoData);
    } catch (error) {
      console.error('Error fetching auction data:', error);
    }
  };

  const loadLiveState = async () => {
    if (!subasta?.identificador) return;
    try {
      const data = await fetchEstadoVivo(subasta.identificador);
      setLiveState(data);
    } catch (error) {
      console.error('Error fetching live state:', error);
    }
  };

  useEffect(() => {
    loadData();
    
    const ws = createWebSocket(
      (data) => {
        console.log('Bid recibido:', data);
        if (data && data.type === 'NEW_BID' && data.subastaId === subasta?.identificador) {
          // If a new bid is placed on this auction, we refresh the live state from the server
          loadLiveState();
        }
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
  }, [subasta?.identificador]);

  const formatDate = (value) => {
    if (!value) return 'Próximamente';
    const date = new Date(value);
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getImageUri = () => {
    let imageSource = null;
    if (staticDetails?.items && staticDetails.items.length > 0 && staticDetails.items[0].fotos?.length > 0) {
      imageSource = staticDetails.items[0].fotos[0];
    } else {
      imageSource = Array.isArray(subasta?.fotos) ? subasta.fotos[0] : subasta?.imagen || subasta?.foto;
    }

    if (!imageSource) {
      return 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80';
    }
    if (typeof imageSource === 'string') {
      if (imageSource.startsWith('http')) return imageSource;
      if (imageSource.startsWith('/api/')) return `https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80`;
      return `data:image/jpeg;base64,${imageSource}`;
    }
    return 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80';
  };

  const bidHistory = liveState?.ultimasPujas || subasta?.ultimasPujas || [];

  const currentPrice = bidHistory.length > 0 ? bidHistory[0].importe : (staticDetails?.items?.[0]?.precioBase || subasta?.precioBase || 0);
  const basePrice = staticDetails?.items?.[0]?.precioBase || subasta?.precioBase || subasta?.precio || 0;
  const itemTitle = staticDetails?.titulo || subasta?.titulo || subasta?.tituloProducto || subasta?.nombre || `Subasta #${subasta?.identificador}`;
  const itemStatus = String(liveState?.estado || subasta?.estado || 'ATENCIÓN').toUpperCase();
  const itemLocation = subasta?.ubicacion || 'Ubicación no definida';
  const itemCatalog = subasta?.categoria || 'GENERAL';

  const enviarPuja = async () => {
    if (!monto || isNaN(monto)) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    try {
      const token = await authManager.getToken();
      // Nota: AsistenteId y itemId deberían ser sacados del usuario conectado y del catálogo de la subasta.
      // Como no tenemos esos datos en este mock, estoy asumiendo valores de prueba o datos provenientes de 'subasta'.
      // El backend requiere { asistenteId, itemId, importe }
      const firstItemId = staticDetails?.items && staticDetails.items.length > 0 ? staticDetails.items[0].id : 1;

      const bidData = {
        asistenteId: 1, // REQUIERE CAMBIO DEPENDIENDO DEL LOGIN
        itemId: firstItemId, 
        importe: parseFloat(monto),
      };

      await enviarPujaRest(bidData, token ? `Bearer ${token}` : null);
      Alert.alert('Éxito', 'Puja enviada');
      setMonto('');
      loadLiveState(); // Refresh immediately
    } catch (error) {
      Alert.alert('Error al pujar', error.message || 'No se pudo enviar la puja');
    }
  };

  if (!subasta) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}> 
        <View style={[styles.fallback, { backgroundColor: colors.surface }]}> 
          <Text style={[styles.fallbackTitle, { color: colors.text }]}>Subasta no encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}> 
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.statusPill, { backgroundColor: conectado ? '#E6F5EC' : '#FDEDEA' }]}> 
            <Text style={[styles.statusPillText, { color: conectado ? colors.success : '#D14343' }]}>
              {conectado ? 'VIVO' : 'DESCONECTADO'}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}> 
          <Image source={{ uri: getImageUri() }} style={styles.mainImage} resizeMode="cover" />
          <View style={[styles.tagRow, { backgroundColor: colors.surface }]}> 
            <View style={[styles.chip, { backgroundColor: colors.primarySoft }]}> 
              <Text style={[styles.chipText, { color: colors.primary }]}>{itemCatalog.toUpperCase()}</Text>
            </View>
            <Text style={[styles.detailLabel, { color: colors.muted }]}>{formatDate(subasta?.fecha)}</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{itemTitle}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]} numberOfLines={2}>{itemLocation}</Text>

            <View style={styles.pricesRow}>
              <View style={[styles.priceBox, { backgroundColor: colors.primarySoft, borderRadius: radius.md, marginRight: 12 }]}> 
                <Text style={[styles.priceLabel, { color: colors.muted }]}>Precio base</Text>
                <Text style={[styles.priceValue, { color: colors.primary }]}>{subasta?.moneda || 'USD'} {Number(basePrice).toFixed(2)}</Text>
              </View>
              <View style={[styles.priceBox, { backgroundColor: '#EEF5FF', borderRadius: radius.md }]}> 
                <Text style={[styles.priceLabel, { color: colors.muted }]}>Mayor puja</Text>
                <Text style={[styles.priceValue, { color: colors.primary }]}>{subasta?.moneda || 'USD'} {Number(currentPrice).toFixed(2)}</Text>
              </View>
            </View>

            <View style={[styles.infoRow, { borderColor: colors.border }]}> 
              <View>
                <Text style={[styles.infoLabel, { color: colors.muted }]}>Estado</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{itemStatus}</Text>
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: colors.muted }]}>Tiempo</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(subasta?.fecha)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderRadius: radius.lg }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Últimas pujas</Text>
          {bidHistory.length === 0 ? (
            <Text style={[styles.noHistoryText, { color: colors.muted }]}>Aún no hay pujas para este lote.</Text>
          ) : (
            bidHistory.slice(0, 3).map((puja, index) => {
              const userName = puja.usuario?.nombre || puja.nombre || puja.bidder || `Usuario ${index + 1}`;
              const amount = puja.monto || puja.importe || puja.valor || puja.amount || 0;
              const when = puja.fecha || puja.timestamp || puja.createdAt;
              return (
                <View key={index} style={styles.historyRow}>
                  <View>
                    <Text style={[styles.historyName, { color: colors.text }]}>{userName}</Text>
                    <Text style={[styles.historyTime, { color: colors.muted }]}>{formatDate(when)}</Text>
                  </View>
                  <Text style={[styles.historyAmount, { color: colors.primary }]}>{subasta?.moneda || 'USD'} {Number(amount).toFixed(2)}</Text>
                </View>
              );
            })
          )}
        </View>

        <View style={[styles.inputCard, { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.border }]}> 
          <Text style={[styles.inputLabel, { color: colors.muted }]}>Puja mínima: {subasta?.moneda || 'USD'} {Number(currentPrice + 1).toFixed(2)}</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, backgroundColor: '#F8F9FD', color: colors.text }]}
            placeholder="Ingresa tu monto"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            value={monto}
            onChangeText={setMonto}
          />
          <TouchableOpacity
            style={[styles.bidButton, { backgroundColor: conectado ? colors.primary : '#A0A7B3' }]}
            onPress={enviarPuja}
            disabled={!conectado}
          >
            <Text style={styles.bidButtonText}>Pujar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    padding: 20,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 20,
  },
  mainImage: {
    width: '100%',
    height: 240,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailLabel: {
    fontSize: 12,
  },
  cardBody: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  pricesRow: {
    flexDirection: 'row',
  },
  priceBox: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  infoLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  noHistoryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  historyName: {
    fontSize: 14,
    fontWeight: '700',
  },
  historyTime: {
    fontSize: 12,
    marginTop: 4,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  inputCard: {
    padding: 18,
    borderWidth: 1,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  bidButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    borderRadius: 20,
    padding: 24,
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});
