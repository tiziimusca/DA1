import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  ActivityIndicator,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../theme/AppTheme';
import { fetchMetodosPago, completarPago, completarPagoDevolucion } from '../api/paymentApi';
import { getUser } from '../auth/authManager';

const getMethodTitle = (method) => {
  if (!method || !method.datos) return 'Método de pago';
  if (method.tipo === 'tarjeta') {
    const num = method.datos.numeroTarjeta || '';
    return `${method.datos.tipoTarjeta || 'Tarjeta'} terminada en ${num.slice(-4)}`;
  } else if (method.tipo === 'banco') {
    const num = method.datos.numeroCuenta || '';
    return `${method.datos.nombreBanco || 'Banco'} terminado en ${num.slice(-4)}`;
  } else if (method.tipo === 'cheque') {
    const num = method.datos.numeroCheque || '';
    const numStr = String(num);
    return `Cheque N° ${numStr.startsWith('********') ? numStr : '********' + numStr.slice(-4)}`;
  }
  return 'Método de pago';
};

const getMethodSubtitle = (method) => {
  if (!method || !method.datos) return '';
  if (method.tipo === 'tarjeta') {
    return `Expira ${method.datos.fechaVencimiento || 'N/A'}`;
  } else if (method.tipo === 'banco') {
    return `Titular: ${method.datos.nombreTitular || 'N/A'}`;
  } else if (method.tipo === 'cheque') {
    const amt = method.montoDisponible ?? method.datos.montoDisponible ?? 0;
    const mon = method.moneda ?? method.datos.moneda ?? 'USD';
    return `Monto disponible: ${mon} ${parseFloat(amt).toFixed(2)}`;
  }
  return '';
};


const isMethodAllowed = (method, subastaMoneda) => {
  if (!method) return false;
  if (!subastaMoneda) return true;
  if (subastaMoneda === 'USD') {
    if (method.tipo === 'banco') {
      return !!(method.extranjero ?? method.datos?.extranjero);
    }
    if (method.tipo === 'tarjeta') {
      return !!(method.internacional ?? method.datos?.internacional);
    }
    if (method.tipo === 'cheque') {
      return (method.moneda ?? method.datos?.moneda) === 'USD';
    }
    return false;
  }
  if (subastaMoneda === 'ARS') {
    if (method.tipo === 'cheque') {
      return (method.moneda ?? method.datos?.moneda) === 'ARS';
    }
    return true;
  }
  return true;
};

export default function PaymentScreen({ navigation, route }) {
  const { colors, radius } = useAppTheme();

  const { subasta, winningBid, image, comision, isProposal, costoEnvio, costoVerificacion, tituloProducto, productoId, opcion } = route.params || {};
  const subastaMoneda = subasta ? (subasta.moneda || 'USD') : null;
  const monedaSimbolo = subastaMoneda || 'USD';

  const [metodosPago, setMetodosPago] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMethodsModal, setShowMethodsModal] = useState(false);
  const [completingPayment, setCompletingPayment] = useState(false);

  const [retirarEnPersona, setRetirarEnPersona] = useState(false);

  const precioGanador = winningBid || subasta?.precioBase || 0;
  const envio = 45;
  const costoVerif = costoVerificacion ? parseFloat(costoVerificacion) : 0;
  const costoEnv = (isProposal && opcion === 'envio') ? (costoEnvio ? parseFloat(costoEnvio) : 0) : 0;

  const envioActual = retirarEnPersona ? 0 : envio;
  const costoEnvActual = retirarEnPersona ? 0 : costoEnv;
  const total = isProposal ? (costoVerif + costoEnvActual) : (precioGanador + comision + envioActual);
  const currentUser = getUser();
  const paymentCompletedRef = useRef(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    if (selectedMethod && selectedMethod.tipo === 'cheque') {
      const amt = parseFloat(selectedMethod.montoDisponible ?? selectedMethod.datos?.montoDisponible ?? 0);
      const chequeMoneda = selectedMethod.moneda ?? selectedMethod.datos?.moneda ?? 'USD';
      if (amt < total) {
        Alert.alert(
          'Fondos Insuficientes',
          `El cheque seleccionado tiene un saldo disponible de ${chequeMoneda} ${amt.toFixed(2)}, el cual es insuficiente para cubrir el total de ${monedaSimbolo} ${total.toFixed(2)}. Se ha deseleccionado el método.`
        );
        setSelectedMethod(null);
      }
    }
  }, [total, selectedMethod, monedaSimbolo]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (paymentCompletedRef.current) {
        return;
      }
      e.preventDefault();
      Alert.alert(
        'Pago Obligatorio',
        isProposal
          ? 'Debe completar el pago de la devolución para poder salir de esta pantalla.'
          : 'Debe completar el pago de la subasta ganada para poder salir de esta pantalla.',
        [{ text: 'Entendido', style: 'cancel' }]
      );
    });
    return unsubscribe;
  }, [navigation, isProposal]);

  const loadPaymentMethods = async () => {
    try {
      const methods = await fetchMetodosPago(currentUser?.id);

      const approved =
        methods?.filter(
          (m) => m.estado?.toLowerCase() === 'aprobado'
        ) || [];

      const allowed = approved.filter(m => isMethodAllowed(m, subastaMoneda));
      setMetodosPago(allowed);

      if (allowed.length > 0) {
        const price = winningBid || subasta?.precioBase || 0;
        const currentTotal = isProposal ? (costoVerif + (retirarEnPersona ? 0 : costoEnv)) : (price + comision + (retirarEnPersona ? 0 : 45));
        const firstValid = allowed.find(m => {
          if (m.tipo !== 'cheque') return true;
          const amt = parseFloat(m.montoDisponible ?? m.datos?.montoDisponible ?? 0);
          return amt >= currentTotal;
        });
        setSelectedMethod(firstValid || null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!selectedMethod) return;
    try {
      setCompletingPayment(true);
      if (isProposal) {
        await completarPagoDevolucion(productoId);
      } else {
        await completarPago(subasta?.id, selectedMethod.id, selectedMethod.tipo, retirarEnPersona);
      }
      paymentCompletedRef.current = true;
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }, 10000);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo completar el pago. Por favor intente nuevamente.');
    } finally {
      setCompletingPayment(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { backgroundColor: colors.background }
      ]}
    >
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.primary, flex: 1, marginLeft: 40 },
            ]}
          >
            Revisa tu compra
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <Text
          style={[
            styles.headerSubtitle,
            { color: colors.muted },
          ]}
        >
          {isProposal 
            ? 'Por favor verifique los costos finales de la devolución de su artículo antes de completar el pago.'
            : '¡Falta poco! Por favor verifique los costos finales antes de completar su pedido.'}
        </Text>

        <View
          style={[
            styles.productCard,
            {
              backgroundColor: colors.metricsBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <Image
            source={{
              uri: image
                ? (image.startsWith('http') || image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`)
                : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
            }}
            style={styles.productImage}
          />

          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.productTitle,
                { color: colors.primary },
              ]}
            >
              {isProposal ? tituloProducto : subasta?.titulo}
            </Text>

            <Text
              style={[
                styles.productSub,
                { color: colors.muted },
              ]}
            >
              SERIAL #{isProposal ? productoId : subasta?.id}
            </Text>

            <View style={[styles.winnerBadge, isProposal && { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.winnerText, isProposal && { color: '#475569' }]}>
                {isProposal ? 'DEVOLUCIÓN DE PROPUESTA' : 'SUBASTA GANADA'}
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          OPCION DE ENTREGA
        </Text>

        <View
          style={[
            styles.deliveryCard,
            {
              backgroundColor: colors.metricsBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.deliveryRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.deliveryLabel, { color: colors.text }]}>
                Retirar en persona
              </Text>
              <Text style={[styles.deliverySubtitle, { color: colors.muted }]}>
                Retira tu articulo directamente sin costos de envio.
              </Text>
            </View>
            <Switch
              value={retirarEnPersona}
              onValueChange={setRetirarEnPersona}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={retirarEnPersona ? '#FFF' : '#f4f3f4'}
            />
          </View>

          {retirarEnPersona && (
            <View style={styles.warningContainer}>
              <Icon name="warning-outline" size={18} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={styles.warningText}>
                Al retirar el producto en persona pierde la cobertura del seguro.
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          RESUMEN DEL PAGO
        </Text>

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.metricsBackground,
              borderColor: colors.border,
            },
          ]}
        >
          {isProposal ? (
            <>
              {costoVerif > 0 && (
                <View style={styles.row}>
                  <Text style={styles.label}>Costo de Verificación</Text>
                  <Text style={styles.value}>{monedaSimbolo} {costoVerif.toFixed(2)}</Text>
                </View>
              )}
              {opcion === 'envio' && costoEnv > 0 && (
                <View style={styles.row}>
                  <Text style={styles.label}>Costo de Envío / Traslado</Text>
                  <Text style={styles.value}>
                    {retirarEnPersona ? 'Gratis (Retiro)' : `${monedaSimbolo} ${costoEnv.toFixed(2)}`}
                  </Text>
                </View>
              )}
              {total === 0 && (
                <View style={styles.row}>
                  <Text style={styles.label}>Costos Asociados</Text>
                  <Text style={[styles.value, { color: '#0F8A5F', fontWeight: '700' }]}>Sin costo de retorno</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>
                  Oferta Ganadora
                </Text>

                <Text style={styles.value}>
                  {monedaSimbolo} {precioGanador.toFixed(2)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Comisión
                </Text>

                <Text style={styles.value}>
                  {monedaSimbolo} {(comision || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Envío</Text>

                <Text style={styles.value}>
                  {retirarEnPersona ? 'Gratis (Retiro)' : `${monedaSimbolo} ${envio.toFixed(2)}`}
                </Text>
              </View>
            </>
          )}

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>
              Precio Total
            </Text>

            <Text
              style={[
                styles.totalValue,
                { color: colors.primary },
              ]}
            >
              {monedaSimbolo} {total.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.paymentHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            MÉTODO DE PAGO
          </Text>

          <TouchableOpacity
            onPress={() => setShowMethodsModal(true)}
          >
            <Text
              style={{
                color: colors.primary,
                fontWeight: '600',
              }}
            >
              Editar
            </Text>
          </TouchableOpacity>
        </View>

        {selectedMethod && (
          <View
            style={[
              styles.selectedPaymentCard,
              {
                backgroundColor: colors.metricsBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                name="card-outline"
                size={24}
                color={colors.primary}
              />

              <View style={{ marginLeft: 12 }}>
                <Text style={styles.selectedCardTitle}>
                  {getMethodTitle(selectedMethod)}
                </Text>

                <Text style={styles.selectedCardSubtitle}>
                  {getMethodSubtitle(selectedMethod)}
                </Text>
              </View>
            </View>

            <Icon
              name="checkmark-circle"
              size={22}
              color="#00D084"
            />
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.completeButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={handleCompletePayment}
          disabled={!selectedMethod || completingPayment}
        >
          {completingPayment ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.completeButtonText}>
                Completar Pago
              </Text>

              <Icon
                name="arrow-forward"
                size={20}
                color="#FFF"
              />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent
        visible={showSuccess}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Pago realizado
            </Text>

            <Text style={styles.modalText}>
              {isProposal 
                ? 'El pago de los costos de devolucion se ha efectuado con exito.'
                : retirarEnPersona 
                  ? 'La compra se ha efectuado con exito. Nos contactaremos para organizar el retiro.'
                  : 'La compra se ha efectuado con exito. Nos contactaremos para organizar la entrega.'}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSuccess(false);

                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }}
            >
              <Text style={{ color: '#FFF' }}>
                Aceptar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
  visible={showMethodsModal}
  transparent
  animationType="fade"
>
  <View style={styles.modalOverlay}>
    <View style={styles.methodsModal}>
      <Text style={styles.methodsTitle}>
        Seleccionar método de pago
      </Text>

      {metodosPago.map((method) => (
        <TouchableOpacity
          key={`${method.tipo}-${method.id}`}
          style={[
            styles.methodOption,
            selectedMethod?.id === method.id && {
              borderColor: colors.primary,
              borderWidth: 2,
            },
          ]}
          onPress={() => {
            if (method.tipo === 'cheque') {
              const amt = parseFloat(method.montoDisponible ?? method.datos?.montoDisponible ?? 0);
              const chequeMoneda = method.moneda ?? method.datos?.moneda ?? 'USD';
              if (amt < total) {
                Alert.alert(
                  'Fondos Insuficientes',
                  `El cheque seleccionado tiene un saldo disponible de ${chequeMoneda} ${amt.toFixed(2)}, el cual es insuficiente para cubrir el total de ${monedaSimbolo} ${total.toFixed(2)}.`
                );
                return;
              }
            }
            setSelectedMethod(method);
            setShowMethodsModal(false);
          }}
        >
          <View>
            <Text style={styles.methodTitle}>
              {getMethodTitle(method)}
            </Text>

            <Text style={styles.methodSubtitle}>
              {getMethodSubtitle(method)}
            </Text>
          </View>

          {selectedMethod?.id === method.id && (
            <Icon
              name="checkmark-circle"
              size={24}
              color="#00D084"
            />
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => setShowMethodsModal(false)}
      >
        <Text>Cerrar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    marginTop: 40,
  },

  container: {
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },

  headerSubtitle: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },

  productCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginBottom: 24,
  },

  productImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 12,
  },

  productTitle: {
    fontWeight: '700',
    fontSize: 15,
  },

  productSub: {
    fontSize: 12,
    marginTop: 4,
  },

  winnerBadge: {
    backgroundColor: '#BEE8D2',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },

  winnerText: {
    color: '#0F8A5F',
    fontSize: 10,
    fontWeight: '700',
  },

  sectionTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 12,
  },

  summaryCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  label: {
    color: '#777',
  },

  value: {
    color: '#777',
  },

  separator: {
    height: 1,
    backgroundColor: '#000000',
    marginVertical: 12,
  },

  totalLabel: {
    fontWeight: '700',
    fontSize: 16,
  },

  totalValue: {
    fontWeight: '800',
    fontSize: 18,
  },

  paymentHeader: {
    marginBottom: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  paymentMethod: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardName: {
    color: '#FFF',
    fontWeight: '700',
  },

  cardExpiry: {
    color: '#DDD',
    marginTop: 4,
  },

  completeButton: {
    marginTop: 20,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  completeButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    width: '85%',
    backgroundColor: '#E3DED6',
    borderRadius: 16,
    padding: 24,
  },

  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },

  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },

  modalButton: {
    backgroundColor: '#153B8A',
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectedPaymentCard: {
  borderWidth: 1,
  borderRadius: 16,
  padding: 16,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 24,
},

selectedCardTitle: {
  fontWeight: '700',
  fontSize: 14,
},

selectedCardSubtitle: {
  color: '#888',
  fontSize: 12,
  marginTop: 4,
},

methodsModal: {
  width: '90%',
  backgroundColor: '#E3DED6',
  borderRadius: 20,
  padding: 20,
},

methodsTitle: {
  fontSize: 20,
  fontWeight: '700',
  marginBottom: 20,
},

methodOption: {
  backgroundColor: '#00144D',
  borderRadius: 18,
  padding: 18,
  marginBottom: 12,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

methodTitle: {
  color: '#FFF',
  fontSize: 15,
  fontWeight: '700',
},

methodSubtitle: {
  color: '#C8D0E7',
  marginTop: 4,
},

cancelButton: {
  alignSelf: 'center',
  marginTop: 12,
},
deliveryCard: {
  borderWidth: 1,
  borderRadius: 18,
  padding: 16,
  marginBottom: 24,
},
deliveryRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
deliveryLabel: {
  fontWeight: '700',
  fontSize: 15,
},
deliverySubtitle: {
  fontSize: 12,
  marginTop: 4,
},
warningContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 12,
  backgroundColor: '#FEF3C7',
  padding: 10,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#FCD34D',
},
warningText: {
  color: '#D97706',
  fontSize: 11,
  fontWeight: '600',
  flex: 1,
},
});