import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../theme/AppTheme';
import { createWebSocket, enviarPujaRest, fetchEstadoVivo, fetchDetalleEstatico } from '../api/auctionApi';
import { getToken } from '../auth/authManager';

export default function BidScreen({ navigation, route }) {
  const { colors, radius } = useAppTheme();
  const { subasta: paramSubasta, product } = route.params || {};
  const subasta = paramSubasta || product;
  const [monto, setMonto] = useState('');
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [liveState, setLiveState] = useState(null);
  const [staticDetails, setStaticDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const descripcion =
    staticDetails?.descripcion ||
    staticDetails?.items?.[0]?.descripcion ||
    subasta?.descripcion ||
    'Sin descripción disponible';

  const loadData = async () => {
    console.log('Cargando datos para subasta:', subasta.id);
    if (!subasta?.id) return;
    try {
      
      const [vivoData, estaticoData] = await Promise.all([
        fetchEstadoVivo(subasta.id),
        fetchDetalleEstatico(subasta.id)
      ]);
      console.log('Datos vivo:', vivoData);
      console.log('Datos estático:', estaticoData);
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
  const itemCatalog = subasta?.categoria || 'comun';
  const categoria = (itemCatalog || '').toLowerCase();

  const enviarPuja = async () => {
    if (!monto || isNaN(monto)) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    const bidValue = parseFloat(monto);
    const base = basePrice || 0;
    const lastBid = currentPrice || base;

    // Reglas de validación (excepto oro/platino)
    if (categoria !== 'oro' && categoria !== 'platino') {
      const minBid = lastBid + base * 0.01;
      const maxBid = lastBid + base * 0.20;

      if (bidValue < minBid) {
        Alert.alert('Error', `La puja mínima es ${subasta?.moneda || 'USD'} ${minBid.toFixed(2)}`);
        return;
      }
      if (bidValue > maxBid) {
        Alert.alert('Error', `La puja máxima es ${subasta?.moneda || 'USD'} ${maxBid.toFixed(2)}`);
        return;
      }
    }
    try {
      const token = await getToken();
      const firstItemId = staticDetails?.items?.[0]?.id || 1;

      const bidData = {
        asistenteId: 1, 
        itemId: firstItemId,
        importe: bidValue,
      };

      await enviarPujaRest(bidData, token ? `Bearer ${token}` : null);
      Alert.alert('Éxito', 'Puja enviada');
      setMonto('');
      loadLiveState();
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
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={{ marginBottom: 12 }}
          >
            {(staticDetails?.items?.[0]?.fotos || subasta?.fotos || []).map((foto, index) => {
              const uri = typeof foto === 'string' 
                ? (foto.startsWith('http') ? foto : `data:image/jpeg;base64,${foto}`) 
                : null;

              return (
                <Image 
                  key={index} 
                  source={{ uri: uri || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80' }} 
                  style={{ width: 280, height: 200, borderRadius: 12, marginRight: 12 }} 
                  resizeMode="cover" 
                />
              );
            })}
          </ScrollView>
          <View style={[styles.tagRow, { backgroundColor: colors.surface }]}> 
            <View style={[styles.chip, { backgroundColor: colors.primarySoft }]}> 
              <Text style={[styles.chipText, { color: colors.primary }]}>{itemCatalog.toUpperCase()}</Text>
            </View>
            <Text style={[styles.detailLabel, { color: colors.muted }]}>{formatDate(subasta?.fecha)}</Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#EEF5FF' }]}
              onPress={() =>
                navigation.navigate('Catalog', { product: subasta })
              }
            >
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Ver Catálogo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardBody}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{itemTitle}</Text>
            <Text style={styles.ownerText}>
              DUEÑO ACTUAL: {staticDetails?.duenio || 'Sin información'}
            </Text>

            <Text style={styles.ownerText}>
              REMATADOR: {staticDetails?.rematador || 'Sin información'}
            </Text>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => setShowDetails(!showDetails)}
            >
              <Text style={styles.detailsButtonText}>Detalles</Text>

              <Icon
                name={showDetails ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {showDetails && (
              <View style={styles.detailsContent}>
                <Text style={styles.detailsText}>
                  {descripcion}
                </Text>
              </View>
            )}
            <View style={styles.pricesRow}>
              <View style={styles.basePriceCard}>
                <Text style={styles.cardLabel}>PRECIO BASE</Text>

                <Text style={styles.cardAmount}>
                  ${Number(basePrice).toLocaleString()}
                </Text>
              </View>

              <View style={styles.bidPriceCard}>
                <Text style={styles.cardLabel}>MAYOR PUJA</Text>

                <Text style={styles.cardAmountBlue}>
                  ${Number(currentPrice).toLocaleString()}
                </Text>

                <View style={styles.topBadge}>
                  <Text style={styles.topBadgeText}>TOP</Text>
                </View>
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
                <View style={styles.historyLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {userName.substring(0,2).toUpperCase()}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.historyName}>{userName}</Text>
                    <Text style={styles.historyTime}>
                      {formatDate(when)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.historyAmount}>
                  ${Number(amount).toLocaleString()}
                </Text>
              </View>
              );
            })
          )}
        </View>

      </ScrollView>
        <View style={[styles.inputCard, { backgroundColor: colors.surface, borderRadius: radius.lg, borderColor: colors.border }]}> 
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 12, borderColor: colors.border, backgroundColor: '#F8F9FD', color: colors.text }]}
              placeholder="Ingresa tu monto"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              value={monto}
              onChangeText={setMonto}
            />
            <TouchableOpacity
              style={[styles.bidButton, { paddingHorizontal: 24, backgroundColor: conectado ? colors.primary : '#A0A7B3' }]}
              onPress={enviarPuja}
              disabled={!conectado}
            >
              <Text style={styles.bidButtonText}>Pujar</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.inputLabel, { color: colors.muted }]}>
            {categoria !== 'oro' && categoria !== 'platino'
              ? `Puja minima: ${subasta?.moneda || 'USD'} ${(currentPrice + basePrice * 0.01).toFixed(2)}      Puja maxima: ${(currentPrice + basePrice * 0.20).toFixed(2)}`
              : `Sin límites de puja`}
          </Text>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, marginTop: 20 },
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
  actionButton: {
  flex: 0.6,
  paddingVertical: 12,
  marginHorizontal: 6,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
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
  detailsButton: {
  marginTop: 14,
  borderWidth: 1,
  borderColor: '#DDD',
  borderRadius: 12,
  padding: 14,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

detailsButtonText: {
  fontSize: 15,
  fontWeight: '600',
},

detailsContent: {
  backgroundColor: '#FFF',
  padding: 14,
  borderRadius: 12,
  marginTop: 8,
},

detailsText: {
  color: '#666',
  lineHeight: 22,
},

ownerText: {
  fontSize: 11,
  color: '#666',
  fontWeight: '600',
  marginBottom: 2,
},

basePriceCard: {
  flex: 1,
  backgroundColor: '#DCE8DF',
  borderRadius: 18,
  padding: 16,
  borderWidth: 1,
  borderColor: '#A8B8AC',
},

bidPriceCard: {
  flex: 1,
  backgroundColor: '#E8EEFF',
  borderRadius: 18,
  padding: 16,
  borderWidth: 1,
  borderColor: '#5F7DDB',
  position: 'relative',
},

cardLabel: {
  fontSize: 11,
  color: '#666',
  fontWeight: '700',
},

cardAmount: {
  fontSize: 28,
  fontWeight: '800',
  marginTop: 6,
},

cardAmountBlue: {
  fontSize: 28,
  fontWeight: '800',
  color: '#2244AA',
  marginTop: 6,
},

topBadge: {
  position: 'absolute',
  right: 10,
  bottom: 10,
  backgroundColor: '#2244AA',
  borderRadius: 12,
  paddingHorizontal: 8,
  paddingVertical: 2,
},

topBadgeText: {
  color: 'white',
  fontSize: 10,
  fontWeight: '700',
},

historyLeft: {
  flexDirection: 'row',
  alignItems: 'center',
},

avatar: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '#D9E3FF',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 10,
},

avatarText: {
  fontWeight: '700',
},

bottomBar: {
  flexDirection: 'row',
  padding: 16,
  backgroundColor: '#FFF',
  borderTopWidth: 1,
  borderColor: '#EEE',
},
});
