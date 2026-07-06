import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../theme/AppTheme';
import { fetchMetodosPago } from '../api/paymentApi';
import { API_BASE_URL } from '../config/apiConfig';
import { getToken } from '../auth/authManager';

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
    return `Monto disponible: USD ${parseFloat(amt).toFixed(2)}`;
  }
  return '';
};

export default function CuentaBloqueadaScreen({ navigation, route }) {
  const { colors, radius } = useAppTheme();
  const { monto: initialMonto, subastaId } = route.params || {};

  const [monto, setMonto] = useState(initialMonto || 280.00);
  const [metodosPago, setMetodosPago] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMethodsModal, setShowMethodsModal] = useState(false);
  const [completingPayment, setCompletingPayment] = useState(false);

  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: '',
    message: '',
    iconName: 'information-circle-outline',
    iconColor: '#00D084',
    buttons: []
  });

  const showAlert = (title, message, type = 'info', buttons = null) => {
    let iconName = 'information-circle-outline';
    let iconColor = colors.primary || '#153B8A';

    if (type === 'error') {
      iconName = 'alert-circle-outline';
      iconColor = colors.danger || '#E45B5B';
    } else if (type === 'success') {
      iconName = 'checkmark-circle-outline';
      iconColor = colors.success || '#5BE486';
    } else if (type === 'warning') {
      iconName = 'warning-outline';
      iconColor = colors.warning || '#E4C15B';
    }

    const defaultButtons = [{ text: 'Entendido', onPress: () => setAlertModal(prev => ({ ...prev, visible: false })) }];
    const modalButtons = buttons ? buttons.map(btn => ({
      text: btn.text,
      onPress: () => {
        setAlertModal(prev => ({ ...prev, visible: false }));
        if (btn.onPress) btn.onPress();
      },
      style: btn.style
    })) : defaultButtons;

    setAlertModal({
      visible: true,
      title,
      message,
      iconName,
      iconColor,
      buttons: modalButtons
    });
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    if (selectedMethod && selectedMethod.tipo === 'cheque') {
      const amt = parseFloat(selectedMethod.montoDisponible ?? selectedMethod.datos?.montoDisponible ?? 0);
      if (amt < monto) {
        showAlert(
          'Fondos Insuficientes',
          `El cheque seleccionado tiene un saldo disponible de USD ${amt.toFixed(2)}, el cual es insuficiente para cubrir la deuda de USD ${monto.toFixed(2)}. Se ha deseleccionado el método.`,
          'warning'
        );
        setSelectedMethod(null);
      }
    }
  }, [monto, selectedMethod]);

  const loadPaymentMethods = async () => {
    try {
      const methods = await fetchMetodosPago();
      const approved =
        methods?.filter(
          (m) => m.estado?.toLowerCase() === 'aprobado'
        ) || [];

      setMetodosPago(approved);

      if (approved.length > 0) {
        const firstValid = approved.find(m => {
          if (m.tipo !== 'cheque') return true;
          const amt = parseFloat(m.montoDisponible ?? m.datos?.montoDisponible ?? 0);
          return amt >= monto;
        });
        setSelectedMethod(firstValid || null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePagarDeuda = async () => {
    if (!selectedMethod) {
      showAlert(
        'Método de pago requerido',
        'Debe seleccionar o registrar un método de pago para completar el pago.',
        'warning',
        [
          { text: 'Registrar Método', onPress: () => navigation.navigate('AgregarMetodoPago') },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
      return;
    }

    try {
      setCompletingPayment(true);
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/deudores/me/pagar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          metodoPagoId: selectedMethod.id,
          tipo: selectedMethod.tipo
        })
      });

      if (!response.ok) {
        throw new Error('Error al procesar el pago de la deuda');
      }

      showAlert(
        'Pago Exitoso',
        'Tu pago ha sido procesado correctamente. Tu cuenta ha sido desbloqueada.',
        'success',
        [
          {
            text: 'Aceptar',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home', params: { accessMode: 'authenticated' } }],
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error(error);
      showAlert('Error', 'No se pudo completar el pago de la deuda. Intente nuevamente.', 'error');
    } finally {
      setCompletingPayment(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.iconContainer}>
          <View style={[styles.redSquare]}>
            <Icon name="hammer" size={48} color="#FFF" />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Cuenta Bloqueada
        </Text>
        <Text style={[styles.description, { color: colors.muted }]}>
          El acceso a su cuenta ha sido restringido debido a infracciones pendientes y multas impagas. Complete el pago para restaurar su acceso.
        </Text>

        <View style={[styles.amountCard, { backgroundColor: '#9FC7EB' }]}>
          <Text style={[styles.amountLabel, { color: colors.primary }]}>
            Total a pagar
          </Text>
          <Text style={[styles.amountValue, { color: colors.primary }]}>
            ${Number(monto).toFixed(2)} usd
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Razones de bloqueo
        </Text>

        <View style={styles.reasonCard}>
          <Icon name="alert-circle" size={24} color="#EF4444" style={styles.reasonIcon} />
          <View style={styles.reasonTextWrap}>
            <Text style={styles.reasonTitle}>Multiples penalidades impagas</Text>
            <Text style={styles.reasonSubtitle}>No se pagaron cargos por mora de periodos anteriores</Text>
          </View>
        </View>

        <View style={styles.reasonCard}>
          <Icon name="shield-half" size={24} color="#EF4444" style={styles.reasonIcon} />
          <View style={styles.reasonTextWrap}>
            <Text style={styles.reasonTitle}>Violacion de politicas</Text>
            <Text style={styles.reasonSubtitle}>Seccion 4.2: incumplimiento de los terminos de servicio.</Text>
          </View>
        </View>

        <View style={styles.paymentHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
            METODO DE PAGO
          </Text>
          <TouchableOpacity onPress={() => setShowMethodsModal(true)}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              {selectedMethod ? 'Editar' : 'Registrar'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 10 }} />
        ) : selectedMethod ? (
          <View style={[styles.selectedPaymentCard, { backgroundColor: colors.metricsBackground, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="card-outline" size={24} color={colors.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.selectedCardTitle}>
                  {getMethodTitle(selectedMethod)}
                </Text>
                <Text style={styles.selectedCardSubtitle}>
                  {getMethodSubtitle(selectedMethod)}
                </Text>
              </View>
            </View>
            <Icon name="checkmark-circle" size={22} color="#00D084" />
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addPaymentCard, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('AgregarMetodoPago')}
          >
            <Icon name="add-circle-outline" size={24} color={colors.muted} />
            <Text style={[styles.addPaymentText, { color: colors.muted }]}>
              Agregar metodo de pago
            </Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>
          Como restaurar el acceso
        </Text>

        <View style={styles.stepRow}>
          <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={[styles.stepText, { color: colors.muted }]}>
            Revise las razones de bloqueo para asegurarse de que sea correcto.
          </Text>
        </View>

        <View style={styles.stepRow}>
          <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={[styles.stepText, { color: colors.muted }]}>
            Seleccione "Pagar ahora" para regular su balance con el metodo de pago guardado.
          </Text>
        </View>

        <View style={styles.stepRow}>
          <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={[styles.stepText, { color: colors.muted }]}>
            Su cuenta sera habilitada nuevamente luego de 30 minutos completado el pago.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: colors.primary }]}
          onPress={handlePagarDeuda}
          disabled={completingPayment}
        >
          {completingPayment ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payButtonText}>
              Pagar ahora
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            ¿Necesita ayuda?{' '}
          </Text>
          <TouchableOpacity onPress={() => showAlert('Soporte', 'Soporte técnico contactado. Nos comunicaremos a la brevedad.', 'info')}>
            <Text style={[styles.footerLink, { color: '#C2410C' }]}>
              Contacte a soporte
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <Modal
        visible={showMethodsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMethodsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.methodsModal}>
            <Text style={styles.methodsTitle}>
              Seleccionar método de pago
            </Text>

            {metodosPago.length === 0 ? (
              <Text style={{ textAlign: 'center', marginVertical: 20, color: colors.muted }}>
                No tienes métodos de pago aprobados.
              </Text>
            ) : (
              metodosPago.map((method) => (
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
                      if (amt < monto) {
                        showAlert(
                          'Fondos Insuficientes',
                          `El cheque seleccionado tiene un saldo disponible de USD ${amt.toFixed(2)}, el cual es insuficiente para cubrir la deuda de USD ${monto.toFixed(2)}.`,
                          'warning'
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
                    <Icon name="checkmark-circle" size={24} color="#00D084" />
                  )}
                </TouchableOpacity>
              ))
            )}

            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowMethodsModal(false)}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={alertModal.visible}
        animationType="fade"
        onRequestClose={() => setAlertModal(prev => ({ ...prev, visible: false }))}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCardAlert, { backgroundColor: colors.metricsBackground || colors.surface || '#FFF' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 }}>
              <Icon name={alertModal.iconName} size={28} color={alertModal.iconColor} />
              <Text style={[styles.modalTitleAlert, { color: colors.text }]}>
                {alertModal.title}
              </Text>
            </View>

            <Text style={[styles.modalTextAlert, { color: colors.text }]}>
              {alertModal.message}
            </Text>

            <View style={styles.modalButtonsRow}>
              {alertModal.buttons.map((btn, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.modalButtonAlert,
                    {
                      backgroundColor: btn.style === 'cancel' ? '#EEE' : colors.primary,
                      borderRadius: radius.sm || 8
                    }
                  ]}
                  onPress={btn.onPress}
                >
                  <Text style={{ color: btn.style === 'cancel' ? '#333' : '#FFF', fontWeight: '700' }}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    marginTop: 40
  },
  container: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  redSquare: {
    width: 80,
    height: 80,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  amountCard: {
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  sectionTitle: {
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonCard: {
    flexDirection: 'row',
    backgroundColor: '#3E4659',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  reasonIcon: {
    marginRight: 14,
  },
  reasonTextWrap: {
    flex: 1,
  },
  reasonTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  reasonSubtitle: {
    color: '#C8D0E7',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  selectedPaymentCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  addPaymentCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  addPaymentText: {
    fontWeight: '600',
    fontSize: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingRight: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  payButton: {
    marginTop: 24,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  payButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 12,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodsModal: {
    width: '90%',
    backgroundColor: '#E3DED6',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  methodsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
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
  cancelBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  modalCardAlert: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  modalTitleAlert: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalTextAlert: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButtonAlert: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
