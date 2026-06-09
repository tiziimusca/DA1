import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
  Image,
  ActionSheetIOS,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../theme/AppTheme';
import { useMetodosPagoViewModel } from '../hooks/useMetodoPagoViewModel';
import { SafeAreaView } from 'react-native-safe-area-context';
 
// ─── Helpers de imagen ────────────────────────────────────────────────────────
async function seleccionarImagen(fuente) {
  // Centralizamos las opciones para no repetir código
  const opcionesBase = {
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.85,
    base64: true, // El picker hace la conversión a Base64
  };

  let result;

  if (fuente === 'camara') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara.');
      return null;
    }
    result = await ImagePicker.launchCameraAsync(opcionesBase);
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
      return null;
    }
    result = await ImagePicker.launchImageLibraryAsync(opcionesBase);
  }

  // Si el usuario canceló, devolvemos null
  if (result.canceled) return null;

  // Retornamos el string Base64 formateado. 
  // Esto sirve tanto para el <Image source={{ uri: ... }} /> como para enviarlo al backend.
  return `data:image/jpeg;base64,${result.assets[0].base64}`;
}
 
function abrirSelector(onUri) {
  const opciones = ['Tomar foto', 'Elegir de la galería', 'Cancelar'];
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      { options: opciones, cancelButtonIndex: 2 },
      async (idx) => {
        if (idx === 2) return;
        const uri = await seleccionarImagen(idx === 0 ? 'camara' : 'galeria');
        if (uri) onUri(uri);
      }
    );
  } else {
    Alert.alert('Imagen del cheque', '', [
      { text: 'Tomar foto',           onPress: async () => { const uri = await seleccionarImagen('camara');  if (uri) onUri(uri); } },
      { text: 'Elegir de la galería', onPress: async () => { const uri = await seleccionarImagen('galeria'); if (uri) onUri(uri); } },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }
}
 
// ─── Validaciones por campo ───────────────────────────────────────────────────
// Devuelve un objeto { campo: 'mensaje de error' } con todos los errores presentes.
function validarCampos({ metodo, formData, modoEdicion }) {
  const errores = {};
 
  if (metodo === 'Banco') {
    if (!formData.titular?.trim())
      errores.titular = 'El nombre del titular es obligatorio.';
    if (!modoEdicion) {
      if (!formData.dni)
        errores.dni = 'El DNI es obligatorio.';
      else if (Number(formData.dni) < 1000000)
        errores.dni = 'El DNI debe ser mayor a 1.000.000.';
      if (!formData.cuenta?.trim())
        errores.cuenta = 'El número de cuenta es obligatorio.';
    }
    if (!formData.banco?.trim())
      errores.banco = 'El nombre del banco es obligatorio.';
  }
 
  if (metodo === 'Tarjeta') {
    if (!formData.titular?.trim())
      errores.titular = 'El nombre del titular es obligatorio.';
    if (!formData.tipoTarjeta)
      errores.tipoTarjeta = 'Seleccioná el tipo de tarjeta.';
    if (!modoEdicion) {
      if (!formData.numeroTarjeta)
        errores.numeroTarjeta = 'El número de tarjeta es obligatorio.';
      else if (formData.numeroTarjeta.length < 13 || formData.numeroTarjeta.length > 19)
        errores.numeroTarjeta = 'Debe tener entre 13 y 19 dígitos.';
      if (!formData.cvv)
        errores.cvv = 'El CVV es obligatorio.';
      else if (formData.cvv.length < 3 || formData.cvv.length > 4)
        errores.cvv = 'El CVV debe tener 3 o 4 dígitos.';
    }
    // Fecha — siempre requerida en creación y edición
    const mes = parseInt(formData.vencimientoMes, 10);
    let anio  = parseInt(formData.vencimientoAnio, 10);
    if (!formData.vencimientoMes || !formData.vencimientoAnio) {
      errores.vencimiento = 'La fecha de vencimiento es obligatoria (MM/YY).';
    } else if (isNaN(mes) || mes < 1 || mes > 12) {
      errores.vencimiento = 'El mes debe estar entre 01 y 12.';
    } else if (isNaN(anio) || formData.vencimientoAnio.length !== 2) {
      errores.vencimiento = 'El año debe tener 2 dígitos (ej: 28).';
    } else {
      // Comparar con fecha actual en formato YY
      const anioCompleto = anio + 2000;
      const hoy = new Date();
      const vencimiento = new Date(anioCompleto, mes - 1, 1);
      const primerDiaMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      if (vencimiento < primerDiaMesActual)
        errores.vencimiento = 'La tarjeta ya está vencida.';
    }
  }
 
  if (metodo === 'Cheque') {
    if (!formData.numeroCheque)
      errores.numeroCheque = 'El número de cheque es obligatorio.';
    else if (parseInt(formData.numeroCheque, 10) > 2147483647)
      errores.numeroCheque = 'El número es demasiado largo (máx. 2.147.483.647).';
  }
 
  return errores;
}
 
// ─── Selector de método ───────────────────────────────────────────────────────
const METODOS = ['Banco', 'Tarjeta', 'Cheque'];
 
function MetodoSelector({ activo, onChange, theme, bloqueado = false }) {
  const { colors, radius, spacing } = theme;
  return (
    <View style={[sel.wrap, { backgroundColor: colors.primarySoft, borderRadius: radius.round, padding: 4 }]}>
      {METODOS.map(m => {
        const isActive = activo === m;
        const deshabilitado = bloqueado && !isActive;
        return (
          <TouchableOpacity
            key={m}
            onPress={() => !deshabilitado && onChange(m)}
            activeOpacity={deshabilitado ? 1 : 0.8}
            style={[sel.btn, {
              borderRadius: radius.round,
              backgroundColor: isActive ? colors.primary : 'transparent',
              paddingVertical: spacing.xs + 2,
              paddingHorizontal: spacing.md,
              opacity: deshabilitado ? 0.35 : 1,
            }]}
          >
            <Text style={[sel.label, { color: isActive ? '#FFFFFF' : colors.muted, fontWeight: isActive ? '700' : '500' }]}>
              {m}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
 
const sel = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center' },
  btn:   { flex: 1, alignItems: 'center' },
  label: { fontSize: 14 },
});
 
// ─── Campo con error inline ───────────────────────────────────────────────────
function Campo({ label, placeholder, keyboardType, maxLength, theme, value, onChangeText, error }) {
  const { colors, spacing, radius } = theme;
  const tieneError = !!error;
  return (
    <View style={{ marginBottom: tieneError ? spacing.xs : spacing.md }}>
      <Text style={[cmp.label, { color: colors.text, marginBottom: spacing.xs }]}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType || 'default'}
        maxLength={maxLength}
        value={value}
        onChangeText={onChangeText}
        style={[cmp.input, {
          backgroundColor: colors.surface,
          borderColor: tieneError ? '#C62828' : colors.border,
          borderRadius: radius.sm,
          color: colors.text,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + 2,
          fontSize: 14,
        }]}
      />
      {tieneError && <Text style={cmp.error}>{error}</Text>}
    </View>
  );
}
 
const cmp = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '500' },
  input: { borderWidth: 1, height: 48 },
  error: { fontSize: 11, color: '#C62828', marginTop: 4, marginBottom: 8 },
});
 
// ─── FormBanco ────────────────────────────────────────────────────────────────
function FormBanco({ theme, formData, onChange, errores }) {
  return (
    <View>
      <Campo label="Nombre del titular" placeholder="Juan Perez" theme={theme}
        value={formData.titular} onChangeText={t => onChange('titular', t)} error={errores.titular} />
      <Campo label="Numero de DNI" placeholder="30123456" keyboardType="numeric" maxLength={9} theme={theme}
        value={formData.dni} onChangeText={t => onChange('dni', t.replace(/\D/g, ''))} error={errores.dni} />
      <Campo label="Nombre del banco" placeholder="Galicia" theme={theme}
        value={formData.banco} onChangeText={t => onChange('banco', t)} error={errores.banco} />
      <Campo label="Numero de cuenta" placeholder="123-4519582/1" theme={theme}
        value={formData.cuenta} onChangeText={t => onChange('cuenta', t)} error={errores.cuenta} />
    </View>
  );
}
 
// ─── FormTarjeta ──────────────────────────────────────────────────────────────
function FormTarjeta({ theme, formData, onChange, modoEdicion = false, errores }) {
  const { colors, spacing, radius } = theme;
  const tipos = ['Visa', 'Mastercard', 'American Express'];
  const [open, setOpen] = useState(false);
 
  return (
    <View>
      {/* Tipo de tarjeta */}
      <View style={{ marginBottom: errores.tipoTarjeta ? 4 : spacing.md }}>
        <Text style={[cmp.label, { color: colors.text, marginBottom: spacing.xs }]}>Tipo de tarjeta</Text>
        <TouchableOpacity
          onPress={() => setOpen(o => !o)}
          style={[cmp.input, {
            backgroundColor: colors.surface,
            borderColor: errores.tipoTarjeta ? '#C62828' : colors.border,
            borderRadius: radius.sm,
            paddingHorizontal: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }]}
        >
          <Text style={{ color: formData.tipoTarjeta ? colors.text : colors.muted, fontSize: 14 }}>
            {formData.tipoTarjeta || 'Selecciona'}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>▼</Text>
        </TouchableOpacity>
        {errores.tipoTarjeta && <Text style={cmp.error}>{errores.tipoTarjeta}</Text>}
        {open && (
          <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, marginTop: 2, overflow: 'hidden' }}>
            {tipos.map(t => (
              <TouchableOpacity key={t} onPress={() => { onChange('tipoTarjeta', t); setOpen(false); }}
                style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.text, fontSize: 14 }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
 
      <Campo label="Nombre del titular" placeholder="Juan Perez" theme={theme}
        value={formData.titular} onChangeText={t => onChange('titular', t)} error={errores.titular} />
 
      <Campo
        label="Numero de tarjeta"
        placeholder={modoEdicion ? 'Dejá vacío para mantener el actual' : '4564154645645481'}
        keyboardType="numeric" maxLength={19} theme={theme}
        value={formData.numeroTarjeta}
        onChangeText={t => onChange('numeroTarjeta', t.replace(/\D/g, ''))}
        error={errores.numeroTarjeta}
      />
 
      {/* Fecha MM/YY + CVV */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text style={[cmp.label, { color: colors.text, marginBottom: spacing.xs }]}>Fecha de vencimiento</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TextInput
              placeholder="MM" placeholderTextColor={colors.muted}
              keyboardType="numeric" maxLength={2}
              value={formData.vencimientoMes}
              onChangeText={t => {
                const n = t.replace(/\D/g, '');
                if (n.length === 2 && parseInt(n, 10) > 12) return;
                onChange('vencimientoMes', n);
              }}
              style={[cmp.input, {
                flex: 1,
                backgroundColor: colors.surface,
                borderColor: errores.vencimiento ? '#C62828' : colors.border,
                borderRadius: radius.sm,
                color: colors.text,
                paddingHorizontal: 6,
                fontSize: 14,
                textAlign: 'center',
              }]}
            />
            <TextInput
              placeholder="YY" placeholderTextColor={colors.muted}
              keyboardType="numeric" maxLength={2}
              value={formData.vencimientoAnio}
              onChangeText={t => onChange('vencimientoAnio', t.replace(/\D/g, ''))}
              style={[cmp.input, {
                flex: 1,
                backgroundColor: colors.surface,
                borderColor: errores.vencimiento ? '#C62828' : colors.border,
                borderRadius: radius.sm,
                color: colors.text,
                paddingHorizontal: 6,
                fontSize: 14,
                textAlign: 'center',
              }]}
            />
          </View>
          {errores.vencimiento && <Text style={cmp.error}>{errores.vencimiento}</Text>}
        </View>
 
        <View style={{ flex: 0.8 }}>
          <Campo label="CVV" placeholder="123" keyboardType="numeric" maxLength={4} theme={theme}
            value={formData.cvv} onChangeText={t => onChange('cvv', t.replace(/\D/g, ''))} error={errores.cvv} />
        </View>
      </View>
    </View>
  );
}
 
// ─── FormCheque ───────────────────────────────────────────────────────────────
function CameraIcon({ color = '#667085', size = 28 }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.75, color }}>📷</Text>
    </View>
  );
}
 
function UploadBox({ label, theme, value, onChangeUri }) {
  const { colors, spacing, radius } = theme;
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => abrirSelector(onChangeUri)}
      style={{
        flex: 1, aspectRatio: 1.2,
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: value ? colors.primary : colors.border,
        borderRadius: radius.sm,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
      }}
    >
      {value
        ? <Image source={{ uri: value }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
        : <><CameraIcon color={colors.muted} size={30} /><Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{label}</Text></>
      }
    </TouchableOpacity>
  );
}
 
function FormCheque({ theme, formData, onChange, errores }) {
  const { colors, spacing } = theme;
  return (
    <View>
      <Campo label="Nombre del banco" placeholder="Galicia" theme={theme}
        value={formData.banco} onChangeText={t => onChange('banco', t)} error={errores.banco} />
      <Campo label="Numero de cheque" placeholder="12345678" keyboardType="numeric" maxLength={9} theme={theme}
        value={formData.numeroCheque} onChangeText={t => onChange('numeroCheque', t.replace(/\D/g, ''))} error={errores.numeroCheque} />
 
      <Text style={[cmp.label, { color: colors.text, marginBottom: spacing.sm }]}>Imágenes del cheque</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs }}>
        <UploadBox label="Frente" theme={theme} value={formData.imagenFrente} onChangeUri={uri => onChange('imagenFrente', uri)} />
        <UploadBox label="Dorso"  theme={theme} value={formData.imagenDorso}  onChangeUri={uri => onChange('imagenDorso', uri)} />
      </View>
      <Text style={{ fontSize: 11, color: colors.muted, marginTop: spacing.xs }}>
        Tamaño máximo del archivo 5MB. Formatos JPG, PNG, PDF.
      </Text>
    </View>
  );
}
 
// ─── Modal verificación ───────────────────────────────────────────────────────
function ModalVerificacion({ visible, onAceptar, theme }) {
  const { colors, radius } = theme;
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onAceptar}>
      <View style={mdl.overlay}>
        <View style={[mdl.box, { backgroundColor: colors.surface, borderRadius: radius.md }]}>
          <TouchableOpacity onPress={onAceptar} style={mdl.closeBtn}>
            <Text style={{ color: colors.muted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
          <Text style={[mdl.titulo, { color: colors.text }]}>Verificacion Pendiente</Text>
          <Text style={[mdl.cuerpo, { color: colors.muted }]}>
            Luego de guardar el metodo de pago tardaremos entre 1-2 dias en confirmar el metodo de pago.
          </Text>
          <TouchableOpacity onPress={onAceptar} style={[mdl.btn, { backgroundColor: colors.primary, borderRadius: radius.round }]}>
            <Text style={mdl.btnLabel}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
 
const mdl = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  box:      { width: '100%', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  closeBtn: { position: 'absolute', top: 12, right: 14, zIndex: 1 },
  titulo:   { fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  cuerpo:   { fontSize: 13, lineHeight: 19, marginBottom: 18 },
  btn:      { alignSelf: 'flex-end', paddingHorizontal: 20, paddingVertical: 9 },
  btnLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
 
// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function AgregarMetodoPago() {
  const theme = useAppTheme();
  const { colors, spacing, radius } = theme;
  const navigation = useNavigation();
  const route = useRoute();
 
  const { agregarMetodoPago, editarMetodoPago, loading } = useMetodosPagoViewModel();
 
  const metodoExistente = route.params?.metodoExistente ?? null;
  const modoEdicion = !!metodoExistente;
 
  const tipoATab = { banco: 'Banco', tarjeta: 'Tarjeta', cheque: 'Cheque' };
  const tabInicial = modoEdicion ? (tipoATab[metodoExistente.tipo] ?? 'Banco') : 'Banco';
 
  const [metodo, setMetodo] = useState(tabInicial);
  const [modalVisible, setModalVisible] = useState(false);
  const [errores, setErrores] = useState({});         // ← errores inline por campo
  const [intentoGuardar, setIntentoGuardar] = useState(false); // ← muestra errores solo tras primer intento
 
  const datosExistente = metodoExistente?.datos ?? {};
 
  const [formData, setFormData] = useState({
    titular:         datosExistente.nombreTitular || '',
    dni:             '',
    banco:           datosExistente.nombreBanco   || '',
    cuenta:          '',
    tipoTarjeta:     datosExistente.tipoTarjeta   || '',
    numeroTarjeta:   '',
    vencimientoMes:  datosExistente.fechaVencimiento?.split('/')?.[0] || '',
    vencimientoAnio: datosExistente.fechaVencimiento?.split('/')?.[1] || '',
    cvv:             '',
    numeroCheque:    '',
    imagenFrente:    null,
    imagenDorso:     null,
  });
 
  const handleChange = (campo, valor) => {
    const nuevoFormData = { ...formData, [campo]: valor };
    setFormData(nuevoFormData);
    // Revalidar en tiempo real solo si ya intentó guardar
    if (intentoGuardar) {
      setErrores(validarCampos({ metodo, formData: nuevoFormData, modoEdicion }));
    }
  };
 
  const idDelCliente = 11; // TODO: reemplazar con auth
 
  const handleGuardar = async () => {
    setIntentoGuardar(true);
    const erroresActuales = validarCampos({ metodo, formData, modoEdicion });
    setErrores(erroresActuales);
 
    if (Object.keys(erroresActuales).length > 0) return; // hay errores, no continuar
 
    let datosLimpios = {};
 
    try {
      if (metodo === 'Banco') {
        datosLimpios = {
          nombreTitular: formData.titular,
          ...(formData.dni    ? { dniTitular: Number(formData.dni) } : {}),
          nombreBanco:   formData.banco,
          ...(formData.cuenta ? { numeroCuenta: formData.cuenta }   : {}),
        };
      } else if (metodo === 'Tarjeta') {
        // El backend espera MM/YY (2 dígitos de año)
        datosLimpios = {
          nombreTitular:    formData.titular,
          ...(formData.numeroTarjeta ? { numeroTarjeta: Number(formData.numeroTarjeta) } : {}),
          fechaVencimiento: `${formData.vencimientoMes}/${formData.vencimientoAnio}`,
          ...(formData.cvv          ? { cvv: formData.cvv }                            : {}),
          ...(formData.tipoTarjeta  ? { tipoTarjeta: formData.tipoTarjeta }            : {}),
        };
      } else if (metodo === 'Cheque') {
        // Sacamos el prefijo "data:image/jpeg;base64," que el backend no acepta
        const limpiarBase64 = (str) => str?.replace(/^data:image\/\w+;base64,/, '') ?? null;
        
        datosLimpios = {
          numeroCheque: parseInt(formData.numeroCheque, 10),
          fotoFrente:   limpiarBase64(formData.imagenFrente),
          fotoDorso:    limpiarBase64(formData.imagenDorso),
        };
      }
    } catch (e) {
      Alert.alert('Error al procesar imágenes', 'No se pudieron preparar las fotos. Intentá de nuevo.');
      return;
    }
 
    const payload = { tipo: metodo.toLowerCase(), datos: datosLimpios };
 
    try {
      let resultado;
      if (modoEdicion) {
        resultado = await editarMetodoPago(metodoExistente.id, payload);
      } else {
        resultado = await agregarMetodoPago({ data: payload, clienteId: idDelCliente });
      }
 
      if (resultado?.type?.endsWith('/rejected')) {
        Alert.alert('Error del servidor', String(resultado.payload ?? 'No se pudo guardar.'));
        return;
      }
 
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error inesperado', error?.message ?? 'Intentá de nuevo.');
    }
  };
 
  const handleAceptar = () => {
    setModalVisible(false);
    navigation.navigate('MetodosDePago', { refresh: Date.now() });
  };
 
  const erroresActivos = intentoGuardar ? errores : {};
  const hayErrores = Object.keys(errores).length > 0;
 
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ModalVerificacion visible={modalVisible} onAceptar={handleAceptar} theme={theme} />
 
      {/* Header */}
      <View style={[hdr.wrap, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[hdr.back, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[hdr.arrow, { color: colors.text }]}>‹</Text>
        </TouchableOpacity>
      </View>
 
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 13, fontWeight: '500', color: colors.muted, marginBottom: spacing.sm }}>
          Seleccionar metodo de pago
        </Text>
 
        <MetodoSelector activo={metodo} onChange={m => { setMetodo(m); setErrores({}); setIntentoGuardar(false); }} theme={theme} bloqueado={modoEdicion} />
 
        <View style={{ marginTop: spacing.lg }}>
          {metodo === 'Banco'   && <FormBanco   theme={theme} formData={formData} onChange={handleChange} errores={erroresActivos} />}
          {metodo === 'Tarjeta' && <FormTarjeta theme={theme} formData={formData} onChange={handleChange} errores={erroresActivos} modoEdicion={modoEdicion} />}
          {metodo === 'Cheque'  && <FormCheque  theme={theme} formData={formData} onChange={handleChange} errores={erroresActivos} />}
        </View>
      </ScrollView>
 
      {/* Botón guardar */}
      <View style={[bot.wrap, { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, backgroundColor: colors.background }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleGuardar}
          disabled={loading}
          style={[bot.btn, { backgroundColor: colors.primary, borderRadius: radius.lg, opacity: loading ? 0.7 : 1 }]}
        >
          <Text style={bot.btnIcon}>💾</Text>
          <Text style={bot.btnLabel}>{loading ? 'Guardando...' : 'Guardar metodo de pago'}</Text>
        </TouchableOpacity>
 
        <Text style={{ fontSize: 11, textAlign: 'center', lineHeight: 16, color: colors.muted }}>
          Los datos estaran cifrados. Al agregar un nuevo metodo de pago aceptas nuestros{' '}
          <Text style={{ color: colors.primary, fontWeight: '600' }}>terminos y condiciones</Text>.
        </Text>
      </View>
    </SafeAreaView>
  );
}
 
const hdr = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center' },
  back:  { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  arrow: { fontSize: 22, lineHeight: 26, marginTop: -1 },
});
 
const bot = StyleSheet.create({
  wrap:    { position: 'absolute', bottom: 56, left: 0, right: 0, paddingTop: 8 },
  btn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10, marginBottom: 10, shadowColor: '#183B70', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 6 },
  btnIcon: { fontSize: 16 },
  btnLabel:{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
});