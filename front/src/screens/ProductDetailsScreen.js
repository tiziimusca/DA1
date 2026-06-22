import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity, Image, Alert } from 'react-native';
import { fetchSeguimientoProducto, devolverProductoApi, confirmarProductoApi } from '../api/auctionApi';
import { getToken } from '../auth/authManager';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Modal } from 'react-native';

export default function ProductDetailsScreen({ route, navigation }) {
  const { subasta, isPropuesto, productoId } = route.params || {};
  
  const [seguimiento, setSeguimiento] = useState(null);
  const [loading, setLoading] = useState(isPropuesto || false);
  const [error, setError] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [confirmPublishModalVisible, setConfirmPublishModalVisible] = useState(false);
  const [confirmingPublish, setConfirmingPublish] = useState(false);

  const idActual = productoId || subasta?.id || subasta?.identificador;

  useEffect(() => {
    if (isPropuesto) {
      if (!idActual) {
        setLoading(false);
        setError("ID de producto no válido");
        return;
      }
      let mounted = true;
      const loadSeguimiento = async () => {
        try {
          const token = getToken();
          const authHeader = token ? `Bearer ${token}` : null;
          const data = await fetchSeguimientoProducto(idActual, authHeader);
          if (mounted) setSeguimiento(data);
        } catch (err) {
          console.error('[ProductDetails] Error al obtener seguimiento:', err.message);
          if (mounted) setError(err.message);
        } finally {
          if (mounted) setLoading(false);
        }
      };
      loadSeguimiento();
      return () => { mounted = false; };
    }
  }, [isPropuesto, productoId, subasta]);

  const handleDevolver = async (opcion) => {
    setIsSubmittingCancel(true);
    try {
      const token = getToken();
      const authHeader = token ? `Bearer ${token}` : null;
      const responseData = await devolverProductoApi(idActual, opcion, authHeader);
      setCancelModalVisible(false);
      
      const estadoNorm = (seguimiento?.estadoActual || '').toLowerCase().replace('_', '');
      if (estadoNorm === 'enviado' || estadoNorm === 'revision' || estadoNorm === 'enrevision') {
        navigation.navigate('MisPropuestas');
      } else {
        navigation.navigate('Payment', {
          isProposal: true,
          productoId: idActual,
          opcion: responseData.opcion,
          costoEnvio: responseData.costoEnvio,
          costoVerificacion: seguimiento?.costoVerificacion,
          tituloProducto: seguimiento?.tituloProducto,
          image: seguimiento?.imagenUrl
        });
      }
    } catch (err) {
      console.error('[ProductDetails] Error al cancelar/devolver:', err.message);
      Alert.alert('Error', err.message);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleConfirmarPublicacion = async () => {
    setConfirmingPublish(true);
    try {
      const token = getToken();
      const authHeader = token ? `Bearer ${token}` : null;
      await confirmarProductoApi(idActual, authHeader);
      setConfirmPublishModalVisible(false);
      navigation.navigate('MisPropuestas');
    } catch (err) {
      console.error('[ProductDetails] Error al confirmar publicación:', err.message);
      Alert.alert('Error', err.message);
    } finally {
      setConfirmingPublish(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0B2A6B" />
      </View>
    );
  }

  if (isPropuesto) {
    if (error || !seguimiento) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Error: {error || 'No se encontró información'}</Text>
          <Text style={styles.property}>Buscando Producto ID: {idActual}</Text>
          <TouchableOpacity style={styles.btnConfirm} onPress={() => navigation.goBack()}>
            <Text style={styles.btnConfirmText}>Volver</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '---';
      let d;
      const parts = dateStr.split(' ');
      if (parts.length === 2 && parts[0].includes('-') && parts[1].includes(':')) {
        const [day, month, year] = parts[0].split('-');
        const [hour, minute] = parts[1].split(':');
        d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10));
      } else {
        d = new Date(dateStr);
      }
      if (isNaN(d.getTime())) return dateStr;
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const hours = d.getHours().toString().padStart(2, '0');
      return `${months[d.getMonth()]} ${d.getDate()}, ${hours}:${minutes}`;
    };

    const resolveImageUri = (imagenUrl) => {
      if (!imagenUrl || typeof imagenUrl !== 'string') return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80';
      if (imagenUrl.startsWith('http') || imagenUrl.startsWith('data:')) return imagenUrl;
      return `data:image/jpeg;base64,${imagenUrl.replace(/[\r\n]+/g, '')}`;
    };

    const estadoNorm = (seguimiento.estadoActual || '').toLowerCase().replace('_', '');
    let currentStepIndex = 0;
    let isRechazado = false;
    let isAceptado = false;
    let isCancelado = false;

    if (estadoNorm === 'enviado') currentStepIndex = 0;
    else if (estadoNorm === 'revision' || estadoNorm === 'enrevision') currentStepIndex = 1;
    else if (estadoNorm === 'inspecciontecnica' || estadoNorm === 'eninspeccion') currentStepIndex = 2;
    else if (estadoNorm === 'aceptado' || estadoNorm === 'confirmado' || estadoNorm === 'publicado') {
      currentStepIndex = 3;
      isAceptado = true;
    }
    else if (estadoNorm === 'rechazado') {
      currentStepIndex = 3;
      isRechazado = true;
    }
    else if (estadoNorm === 'cancelado') {
      currentStepIndex = 3;
      isCancelado = true;
    }

    const steps = [
      { title: 'Artículo Enviado', date: seguimiento.fechaEnviado },
      { 
        title: 'En revisión', 
        date: seguimiento.fechaRevision,
        description: (estadoNorm === 'revision' || estadoNorm === 'enrevision') ? seguimiento.comentario : null
      },
      { 
        title: 'Inspección técnica', 
        date: seguimiento.fechaInspeccionTecnica, 
        description: seguimiento.deposito ? `El artículo se encuentra en el depósito ${seguimiento.deposito}.${seguimiento.seguro ? ` Se le ha asignado un seguro a cargo de ${seguimiento.seguro.compania}.` : ''}` : null 
      },
      {
        title: isCancelado
          ? 'Cancelado'
          : isRechazado
          ? 'Rechazado'
          : 'Aceptado',

        date:
          isCancelado
            ? (seguimiento.fechaCancelado || seguimiento.fechaRevision)
            : isRechazado
            ? (seguimiento.fechaRechazado || seguimiento.fechaRevision)
            : seguimiento.fechaAceptado,

        isFinal: true,
        isRechazadoNode: isRechazado,
        isCanceladoNode: isCancelado
      }
    ];

    const TimelineItem = ({ title, date, index, isFinal, description, isRechazadoNode,isCanceladoNode }) => {
      const isAchieved = index <= currentStepIndex;
      const isLastNode = index === steps.length - 1;

      let iconContainerStyle = styles.iconContainerGray;
      let iconContent = null;

      if (isAchieved) {
        if (isFinal && isCanceladoNode) {
          iconContainerStyle = styles.iconContainerCanceled;
          iconContent = <Icon name="close" size={18} color="#6B7280" />;
        }
        else if (isFinal && isRechazadoNode) {
          iconContainerStyle = styles.iconContainerRejected;
          iconContent = <Icon name="close" size={18} color="#701A34" />;
        }
        else if (isFinal) {
          iconContainerStyle = styles.iconContainerSuccess;
          iconContent = <Icon name="checkmark" size={16} color="#FFFFFF" />;
        }
        else {
          iconContainerStyle = styles.iconContainerBlue;
          iconContent = <Icon name="checkmark" size={16} color="#FFFFFF" />;
        }
      }

      const lineStyle = (index < currentStepIndex) ? styles.lineBlue : styles.lineGray;

      return (
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={iconContainerStyle}>{iconContent}</View>
            {!isLastNode && <View style={lineStyle} />}
          </View>
          <View style={styles.timelineRight}>
            <Text style={[styles.timelineTitle, isAchieved ? styles.textAchieved : styles.textPending]}>{title}</Text>
            <Text style={styles.timelineDate}>
              {date ? formatDate(date) : (isAchieved ? 'Justo Ahora' : 'Pendiente')}
            </Text>
            {description && isAchieved ? <Text style={styles.timelineDesc}>{description}</Text> : null}
          </View>
        </View>
      );
    };

    const precioBase = seguimiento.precioBase ? parseFloat(seguimiento.precioBase) : 240.00;
    const comision = precioBase * 0.08;
    const costoVerif = seguimiento.costoVerificacion ? parseFloat(seguimiento.costoVerificacion) : 5.00;
    
    const showBasePrice = isAceptado;
    const comisionSign = showBasePrice ? '-' : '';
    const costoVerifSign = showBasePrice ? '-' : '';
    const labelTotal = showBasePrice ? 'Pago estimado' : 'Total costos';
    const totalValor = showBasePrice ? (precioBase - comision - costoVerif) : (comision + costoVerif);
    const showBilling = isAceptado || (estadoNorm === 'inspecciontecnica' || estadoNorm === 'eninspeccion');

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verificación del artículo</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.timelineContainer}>
            {steps.map((step, index) => (
              <TimelineItem 
                key={index} 
                title={step.title} 
                date={step.date} 
                index={index} 
                isFinal={step.isFinal}
                description={step.description}
                isRechazadoNode={step.isRechazadoNode}
                isCanceladoNode={step.isCanceladoNode}
              />
            ))}
          </View>

          <View style={styles.productCard}>
            <Image source={{ uri: resolveImageUri(seguimiento.imagenUrl) }} style={styles.productImage} />
            <View style={styles.productInfo}>
              {isAceptado && (
              <Text style={styles.successBadge}>
                VERIFICACIÓN EXITOSA
              </Text>
            )}

            {isRechazado && (
              <Text style={styles.failedBadge}>
                VERIFICACIÓN FALLIDA
              </Text>
            )}

            <Text style={styles.productTitle}>
              {seguimiento.tituloProducto || 'Producto en revisión'}
            </Text>
              {isAceptado && (
                <Text style={styles.productSubtitle}>Superó todos los puntos de control correctamente.</Text>
              )}
              {isRechazado && (
              <Text style={styles.productSubtitle}>
                {seguimiento.comentario || 'La verificación falló debido a daños en el artículo.'}
              </Text>
            )}
            </View>

            {(isAceptado || estadoNorm === 'revision' || estadoNorm === 'enrevision') && seguimiento.comentario && (
              <View style={styles.pubInfoBox}>
                <Text style={styles.pubInfoText}>
                  {seguimiento.comentario}
                </Text>
              </View>
            )}

            {showBilling && (
              <>
                <View style={styles.billingContainer}>
                  {showBasePrice && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Precio base</Text>
                      <Text style={styles.summaryValue}>${precioBase.toFixed(2)}</Text>
                    </View>
                  )}
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Comisión de la plataforma (8%)</Text>
                    <Text style={styles.summaryValueDiscount}>{comisionSign}${comision.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Costo de verificación</Text>
                    <Text style={styles.summaryValueDiscount}>{costoVerifSign}${costoVerif.toFixed(2)}</Text>
                  </View>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={[styles.summaryRow, { marginBottom: 8 }]}>
                  <Text style={styles.summaryTotalLabel}>{labelTotal}</Text>
                  <Text style={styles.summaryTotalValue}>${totalValor.toFixed(2)}</Text>
                </View>
              </>
            )}

            {isRechazado && (
              <View style={styles.billingContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTotalLabel}>Costo de devolución</Text>
                  <Text style={styles.summaryValueDiscount}>${(seguimiento.costoVerificacion ? parseFloat(seguimiento.costoVerificacion) +50 : 50.00).toFixed(2)}</Text>
                </View>
              </View>
            )}
          </View>

          {!(isCancelado) && (
          <View style={styles.buttonsContainer}>
            {isAceptado && (
              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={() => setConfirmPublishModalVisible(true)}
              >
                <Text style={styles.btnConfirmText}>Confirmar Publicación</Text>
              </TouchableOpacity>
            )}

            {isRechazado ? (
              <>
                <TouchableOpacity
                  style={styles.btnConfirm}
                  onPress={() => handleDevolver('envio')}
                >
                  <Text style={styles.btnConfirmText}>
                    Confirmar Devolución
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnRetiro}
                  onPress={() => handleDevolver('retiro')}
                >
                  <Text style={styles.btnRetiroText}>
                    Retirar en persona
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setCancelModalVisible(true)}
              >
                <Text style={styles.btnCancelText}>
                  Cancelar Publicación
                </Text>
              </TouchableOpacity>
            )}
          </View>
          )} 
          <Modal
            visible={cancelModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setCancelModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.returnModal}>
                
                 {!(estadoNorm === 'enviado' || estadoNorm === 'revision' || estadoNorm === 'enrevision') && (
                  <TouchableOpacity
                    style={styles.closeModal}
                    onPress={() => setCancelModalVisible(false)}
                  >
                    <Icon name="close" size={20} color="#444" />
                  </TouchableOpacity>
                )}

                <Text style={styles.returnTitle}>
                  Devolución artículo
                </Text>

                <Text style={styles.returnText}>
                  {(estadoNorm === 'enviado' || estadoNorm === 'revision' || estadoNorm === 'enrevision')
                    ? "Lamentamos tu decisión. Estamos a disposición para cualquier duda."
                    : "Lamentamos tu decisión. Recuerda que de haber pasado por la instancia de inspección técnica, los costos de verificación y traslados del producto deben ser abonados antes de finalizar el proceso. ¿Estás seguro?"
                  }
                </Text>

                <View style={styles.returnButtons}>
                  {(estadoNorm === 'enviado' || estadoNorm === 'revision' || estadoNorm === 'enrevision') ? (
                    <TouchableOpacity
                      style={styles.modalAcceptBtn}
                      onPress={() => handleDevolver(null)}
                    >
                      <Text style={styles.modalAcceptText}>
                        Aceptar
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.modalRetiroBtn}
                        onPress={() => handleDevolver('retiro')}
                      >
                        <Text style={styles.modalRetiroText}>
                          Retirar en persona
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modalAcceptBtn}
                        onPress={() => handleDevolver('envio')}
                      >
                        <Text style={styles.modalAcceptText}>
                          Confirmar Devolución
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={confirmPublishModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setConfirmPublishModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.returnModal}>
                <Text style={[styles.returnTitle, { fontSize: 20 }]}>
                  ¡Muchas gracias por publicar con nosotros!
                </Text>

                <Text style={styles.returnText}>
                  En breve recibirá su comprobante con el detalle de la operación, donde se desglosará el precio del producto junto con la comisión y los costos de gestión.
                </Text>

                <View style={styles.returnButtons}>
                  <TouchableOpacity
                    style={styles.modalAcceptBtn}
                    onPress={handleConfirmarPublicacion}
                    disabled={confirmingPublish}
                  >
                    <Text style={styles.modalAcceptText}>
                      {confirmingPublish ? 'Confirmando...' : 'Aceptar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Subasta #{subasta?.identificador}</Text>
      <Text style={styles.property}>Estado: {subasta?.estado}</Text>
      <Button title="Ir a pujar" onPress={() => navigation.navigate('Bid', { subasta })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EFECE6', marginTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#EFECE6' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1B2E58', textAlign: 'center', flex: 1 },
  headerRight: { width: 32 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  
  timelineContainer: { marginTop: 16, marginBottom: 8, paddingHorizontal: 8 },
  timelineItem: { flexDirection: 'row', minHeight: 75 },
  timelineLeft: { width: 40, alignItems: 'center' },
  iconContainerBlue: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0B2A6B', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  iconContainerSuccess: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1AAE6F', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  iconContainerRejected: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#D6C5CB', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  iconContainerGray: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#D1D5DB', zIndex: 2 },
  lineBlue: { width: 3, flex: 1, backgroundColor: '#0B2A6B', position: 'absolute', top: 30, bottom: 0 },
  lineGray: { width: 3, flex: 1, backgroundColor: '#D1D5DB', position: 'absolute', top: 30, bottom: 0 },
  timelineRight: { flex: 1, paddingLeft: 12, marginTop: 2 },
  timelineTitle: { fontSize: 15, fontWeight: '700' },
  textAchieved: { color: '#2C3A4E' },
  textPending: { color: '#9CA3AF' },
  timelineDate: { fontSize: 13, color: '#6A768A', marginTop: 1 },
  timelineDesc: { fontSize: 12, color: '#556175', marginTop: 4, lineHeight: 16 },

  productCard: { backgroundColor: '#EDEBE6', borderRadius: 24, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E0DDD7' },
  productImage: { width: '100%', height: 140, borderRadius: 20, marginBottom: 12, resizeMode: 'cover' },
  productInfo: { paddingHorizontal: 4, marginBottom: 16 },
  successBadge: { fontSize: 11, fontWeight: '700', color: '#555', letterSpacing: 0.5, marginBottom: 2 },
  productTitle: { fontSize: 19, fontWeight: '700', color: '#1F2937' },
  productSubtitle: { fontSize: 14, color: '#556175', marginTop: 4 },
  
  pubInfoBox: { borderTopWidth: 1, borderTopColor: '#DDDCD6', paddingVertical: 14, paddingHorizontal: 4 },
  pubInfoText: { fontSize: 14, color: '#444', lineHeight: 20 },
  boldText: { fontWeight: '700', color: '#000' },

  billingContainer: { borderTopWidth: 1, borderTopColor: '#DDDCD6', paddingTop: 14, paddingHorizontal: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#555' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: '#000' },
  summaryValueDiscount: { fontSize: 14, fontWeight: '700', color: '#A62649' },
  summaryDivider: { height: 1, backgroundColor: '#DDDCD6', marginVertical: 4 },
  summaryTotalLabel: { fontSize: 16, fontWeight: '700', color: '#222' },
  summaryTotalValue: { fontSize: 18, fontWeight: '700', color: '#1AAE6F' },

  buttonsContainer: { gap: 12, paddingHorizontal: 4 },
  btnConfirm: { backgroundColor: '#0B2A6B', borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  btnConfirmText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  btnCancel: { backgroundColor: '#D6C5CB', borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  btnCancelText: { color: '#701A34', fontSize: 15, fontWeight: '700' },
  
  container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  property: { fontSize: 16, marginBottom: 10, color: '#333' },
  failedBadge: {
  fontSize: 11,
  fontWeight: '700',
  color: '#6B7280',
  letterSpacing: 0.5,
  marginBottom: 2
},

btnRetiro: {
  backgroundColor: '#D9E6F7',
  borderRadius: 24,
  paddingVertical: 14,
  alignItems: 'center'
},

btnRetiroText: {
  color: '#0B2A6B',
  fontSize: 15,
  fontWeight: '700'
},

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.35)',
  justifyContent: 'center',
  alignItems: 'center'
},

returnModal: {
  width: '90%',
  backgroundColor: '#F3F0EA',
  borderRadius: 14,
  padding: 24,
  position: 'relative'
},

closeModal: {
  position: 'absolute',
  right: 12,
  top: 12,
  zIndex: 10
},

returnTitle: {
  fontSize: 24,
  fontWeight: '600',
  marginBottom: 14,
  color: '#222'
},

returnText: {
  fontSize: 16,
  color: '#555',
  lineHeight: 22,
  marginBottom: 24
},

returnButtons: {
  flexDirection: 'column',
  gap: 10,
  width: '100%'
},

modalRetiroBtn: {
  backgroundColor: '#E5E7EB',
  paddingVertical: 14,
  borderRadius: 24,
  alignItems: 'center',
  width: '100%'
},

modalRetiroText: {
  color: '#374151',
  fontWeight: '700',
  fontSize: 15
},

iconContainerCanceled: {
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: '#E5E7EB',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2
},

modalAcceptBtn: {
  backgroundColor: '#0B2A6B',
  paddingVertical: 14,
  borderRadius: 24,
  alignItems: 'center',
  width: '100%'
},

modalAcceptText: {
  color: 'white',
  fontWeight: '700',
  fontSize: 15
}
});