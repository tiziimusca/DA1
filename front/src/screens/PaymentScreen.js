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
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../theme/AppTheme';
import { fetchMetodosPago, completarPago } from '../api/paymentApi';
import { getUser } from '../auth/authManager';


export default function PaymentScreen({ navigation, route }) {
  const { colors, radius } = useAppTheme();

  const { subasta, winningBid, image, comision } = route.params || {};

  const [metodosPago, setMetodosPago] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMethodsModal, setShowMethodsModal] = useState(false);
  const [completingPayment, setCompletingPayment] = useState(false);

  const precioGanador = winningBid || subasta?.precioBase || 0;
  const envio = 45;
  const total = precioGanador + comision + envio;
  const currentUser = getUser();
  const paymentCompletedRef = useRef(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (paymentCompletedRef.current) {
        return;
      }
      e.preventDefault();
      Alert.alert(
        'Pago Obligatorio',
        'Debe completar el pago de la subasta ganada para poder salir de esta pantalla.',
        [{ text: 'Entendido', style: 'cancel' }]
      );
    });
    return unsubscribe;
  }, [navigation]);

  const loadPaymentMethods = async () => {
    try {
      const methods = await fetchMetodosPago(currentUser?.id);

      const approved =
        methods?.filter(
          (m) => m.estado?.toLowerCase() === 'aprobado'
        ) || [];

      setMetodosPago(approved);

      if (approved.length > 0) {
        setSelectedMethod(approved[0]);
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
      await completarPago(subasta?.id);
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
        {/* Header */}

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
          ¡Falta poco! Por favor verifique los costos finales antes
          de completar su pedido.
        </Text>

        {/* Producto */}

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
              uri:
                image?.startsWith('http')
                  ? image
                  : `data:image/jpeg;base64,${image}`,
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
              {subasta?.titulo}
            </Text>

            <Text
              style={[
                styles.productSub,
                { color: colors.muted },
              ]}
            >
              SERIAL #{subasta?.id}
            </Text>

            <View style={styles.winnerBadge}>
              <Text style={styles.winnerText}>
                SUBASTA GANADA
              </Text>
            </View>
          </View>
        </View>

        {/* Resumen */}

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
          <View style={styles.row}>
            <Text style={styles.label}>
              Oferta Ganadora
            </Text>

            <Text style={styles.value}>
              USD {precioGanador.toFixed(2)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Comisión
            </Text>

            <Text style={styles.value}>
              USD {comision.toFixed(2)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Envío</Text>

            <Text style={styles.value}>
              USD {envio.toFixed(2)}
            </Text>
          </View>

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
              USD {total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Métodos */}

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
                  Visa terminada en{' '}
                  {selectedMethod.datos.numeroTarjeta.slice(-4)}
                </Text>

                <Text style={styles.selectedCardSubtitle}>
                  Expira {selectedMethod.datos.fechaVencimiento}
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

        {/* Botón */}

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

      {/* Modal */}

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
              La compra se ha efectuado con éxito.
              Nos contactaremos para organizar la
              entrega.
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
          key={method.id}
          style={[
            styles.methodOption,
            selectedMethod?.id === method.id && {
              borderColor: colors.primary,
              borderWidth: 2,
            },
          ]}
          onPress={() => {
            setSelectedMethod(method);
            setShowMethodsModal(false);
          }}
        >
          <View>
            <Text style={styles.methodTitle}>
              Visa terminada en{' '}
              {method.datos.numeroTarjeta.slice(-4)}
            </Text>

            <Text style={styles.methodSubtitle}>
              Expira {method.datos.fechaVencimiento}
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
});