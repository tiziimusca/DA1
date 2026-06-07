import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { useAppTheme } from '../theme/AppTheme';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import countries from '../data/countries';

export default function RegisterScreen({ navigation }) {
  const { colors, spacing, radius, typography } = useAppTheme();
  const isWeb = Platform.OS === 'web';
  const placeholderPhotoBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO3Z2XcAAAAASUVORK5CYII=';

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [documento, setDocumento] = useState('');
  const [pais, setPais] = useState('');
  const [email, setEmail] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [declaracion, setDeclaracion] = useState(false);
  const [frontUri, setFrontUri] = useState(null);
  const [backUri, setBackUri] = useState(null);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  async function handleContinue() {
    console.log('[RegisterScreen] Continuar a la verificación pressed');
    await submitRegistration();
  }

  async function submitRegistration() {
    if (isSubmitting) {
      return;
    }

    // basic client-side validation
    const missingRequiredFields = !documento || !nombre || !domicilio || !pais || !email || !declaracion;
    const missingPhotos = !frontUri || !backUri;

    if (missingRequiredFields || missingPhotos) {
      console.log('[RegisterScreen] Validation failed', {
        documento: !!documento,
        nombre: !!nombre,
        domicilio: !!domicilio,
        pais: !!pais,
        email: !!email,
        frontUri: !!frontUri,
        backUri: !!backUri,
        declaracion: !!declaracion,
      });
      const missingMsg = !declaracion
        ? 'Debe aceptar la declaración sobre el origen de los fondos.'
        : 'Complete todos los campos obligatorios y cargue las fotos del frente y dorso del documento.';

      Alert.alert('Faltan datos', missingMsg);
      return;
    }

    try {
      setIsSubmitting(true);

      const API_BASE = isWeb
        ? 'http://localhost:8080/api'
        : 'http://192.168.0.181:8080/api';

      const formData = new FormData();
      formData.append('documento', documento);
      formData.append('nombre', `${nombre} ${apellido}`.trim());
      formData.append('direccion', domicilio);
      formData.append('numeroPais', String(Math.max(1, countries.findIndex(c => c.name === pais) + 1)));
      formData.append('email', email);

      const frontFile = fileInfo(frontUri, 'frente');
      const backFile = fileInfo(backUri, 'dorso');

      if (frontFile) {
        formData.append('fotoDocumentoFrente', frontFile);
      }
      if (backFile) {
        formData.append('fotoDocumentoDorso', backFile);
      }

      console.log('[RegisterScreen] formData ->', {
        documento,
        nombre: `${nombre} ${apellido}`.trim(),
        direccion: domicilio,
        numeroPais: Math.max(1, countries.findIndex(c => c.name === pais) + 1),
        email,
        frontSelected: !!frontUri,
        backSelected: !!backUri,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      let resp;
      try {
        resp = await fetch(`${API_BASE}/auth/registrar`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
      } catch (err) {
        if (err.name === 'AbortError') {
          console.error('[RegisterScreen] request aborted (timeout)');
          throw new Error('Tiempo de conexión agotado al enviar el registro. Intente nuevamente.');
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }

      console.log('[RegisterScreen] registrar response status ->', resp.status);

      if (resp.status === 201) {
        const userName = `${nombre} ${apellido}`.trim() || 'Usuario';
        Alert.alert('Registro recibido', 'Tu registro fue enviado correctamente. Te redirigimos al Home.', [
          {
            text: 'Aceptar',
            onPress: () => navigation.replace('Home', { accessMode: 'guest', userName }),
          },
        ], { cancelable: false });
        return;
      } else {
        const rawBody = await resp.text();
        let msg = `Error ${resp.status}`;

        try {
          const err = rawBody ? JSON.parse(rawBody) : null;
          msg = err && err.message ? err.message : msg;
        } catch {
          if (rawBody) {
            msg = rawBody;
          }
        }

        console.log('[RegisterScreen] Backend error response', {
          status: resp.status,
          body: rawBody,
        });
        Alert.alert('Registro fallido', msg);
      }
    } catch (e) {
      console.error('Registration error', e);
      Alert.alert('Error', 'No se pudo completar el registro. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleUpload(side) {
    Alert.alert('Subir documento', 'Elige una opción', [
      { text: 'Tomar foto', onPress: () => pickFromCamera(side) },
      { text: 'Galería', onPress: () => pickFromGallery(side) },
      { text: 'Seleccionar archivo', onPress: () => pickDocument(side) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function pickFromCamera(side) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'No se pudo acceder a la cámara.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.3, allowsEditing: true, aspect: [4, 3] });
    let uri = null;
    if (result && result.cancelled === false && result.uri) {
      uri = result.uri;
    } else if (result && result.assets && result.assets.length > 0 && result.assets[0].uri) {
      uri = result.assets[0].uri;
    }

    if (uri) {
      if (side === 'frente') setFrontUri(uri);
      else setBackUri(uri);
    }
  }

  async function pickFromGallery(side) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'No se pudo acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.3,
      allowsEditing: true,
      aspect: [4, 3],
    });
    let uri = null;
    if (result && result.cancelled === false && result.uri) {
      uri = result.uri;
    } else if (result && result.assets && result.assets.length > 0 && result.assets[0].uri) {
      uri = result.assets[0].uri;
    }

    if (uri) {
      if (side === 'frente') setFrontUri(uri);
      else setBackUri(uri);
    }
  }

  function fileInfo(uri, side) {
    if (!uri) return null;
    const fileName = uri.split('/').pop() || `${side}-${Date.now()}.jpg`;
    const lowerName = fileName.toLowerCase();
    let type = 'image/jpeg';
    if (lowerName.endsWith('.png')) type = 'image/png';
    else if (lowerName.endsWith('.pdf')) type = 'application/pdf';
    else if (lowerName.endsWith('.heic')) type = 'image/heic';
    else if (lowerName.endsWith('.heif')) type = 'image/heif';

    return {
      uri: uri.startsWith('file://') ? uri : uri,
      name: fileName,
      type,
    };
  }

  async function pickDocument(side) {
    const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'] });
    if (res.type === 'success') {
      if (side === 'frente') setFrontUri(res.uri);
      else setBackUri(res.uri);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={[styles.header, { color: colors.text }]}>Registro</Text>
          <Text style={[styles.helpText, { color: colors.muted }]}>Ingrese su información exactamente como aparece en su documento de identidad</Text>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={[styles.label, { color: colors.text }]}>Nombre *</Text>
              <TextInput value={nombre} onChangeText={setNombre} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]} />
            </View>
            <View style={styles.half}>
              <Text style={[styles.label, { color: colors.text }]}>Apellido *</Text>
              <TextInput value={apellido} onChangeText={setApellido} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]} />
            </View>
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Pais de nacimiento *</Text>
          <TouchableOpacity
            style={[styles.select, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setCountryModalVisible(true)}
          >
            <Text style={{ color: pais ? colors.text : colors.muted }}>{pais || 'Selecciona'}</Text>
          </TouchableOpacity>

          <Modal visible={countryModalVisible} animationType="slide">
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
              <View style={{ padding: 12 }}>
                <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 8 }}>Selecciona un país</Text>
                <FlatList
                  data={countries}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}
                      onPress={() => {
                        setPais(item.name);
                        setCountryModalVisible(false);
                      }}
                    >
                      <Text>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity onPress={() => setCountryModalVisible(false)} style={{ marginTop: 12 }}>
                  <Text style={{ color: colors.primary }}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Modal>

          <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
          <TextInput value={email} onChangeText={setEmail} placeholder="Name@example.com" placeholderTextColor={colors.muted} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]} keyboardType="email-address" />

          <Text style={[styles.helpText, { color: colors.muted, marginBottom: 10 }]}>No se solicita contraseña en este paso. Recibirás un código por correo para definirla después.</Text>

          <Text style={[styles.label, { color: colors.text }]}>Domicilio *</Text>
          <TextInput value={domicilio} onChangeText={setDomicilio} placeholder="Ingrese su domicilio" placeholderTextColor={colors.muted} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]} />

          <Text style={[styles.label, { color: colors.text }]}>Número de documento *</Text>
          <TextInput value={documento} onChangeText={setDocumento} placeholder="Solo dígitos" placeholderTextColor={colors.muted} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]} keyboardType="numeric" />

          <Text style={[styles.label, { color: colors.text }]}>Fotos del documento (Frente / Dorso) *</Text>
          <View style={styles.uploadRow}>
            <TouchableOpacity style={[styles.uploadBox, { borderColor: colors.border }]} onPress={() => handleUpload('frente')}>
              {frontUri ? (
                <>
                  <Image source={{ uri: frontUri }} style={styles.uploadImage} />
                  <View style={styles.uploadedOverlay}>
                    <Text style={styles.uploadedText}>Agregado</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 28 }}>📷</Text>
                  <Text style={{ marginTop: 8 }}>Frente</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.uploadBox, { borderColor: colors.border }]} onPress={() => handleUpload('dorso')}>
              {backUri ? (
                <>
                  <Image source={{ uri: backUri }} style={styles.uploadImage} />
                  <View style={styles.uploadedOverlay}>
                    <Text style={styles.uploadedText}>Agregado</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 28 }}>📷</Text>
                  <Text style={{ marginTop: 8 }}>Dorso</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <Text style={[styles.small, { color: colors.muted }]}>Tamaño máximo de archivo 6MB. Formatos: JPG, PNG, PDF.</Text>

          <TouchableOpacity style={styles.declarationRow} onPress={() => setDeclaracion(!declaracion)}>
            <View style={[styles.checkbox, { borderColor: declaracion ? colors.primary : colors.border, backgroundColor: declaracion ? colors.primary : 'transparent' }]}>
              {declaracion ? <Text style={{ color: '#fff' }}>✓</Text> : null}
            </View>
            <Text style={{ color: colors.muted, flex: 1, marginLeft: 8 }}>Declaro que todos los fondos utilizados para las subastas son de origen lícito</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.9}
            disabled={isSubmitting}
            style={[
              styles.cta,
              { backgroundColor: isSubmitting ? colors.border : colors.primary },
            ]}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {isSubmitting ? 'Enviando...' : 'Continuar a la verificación'}
            </Text>
          </TouchableOpacity>

          <Modal visible={verifyModalVisible} transparent animationType="fade" onRequestClose={() => setVerifyModalVisible(false)}>
            <View style={styles.verifyOverlay}>
              <View style={[styles.verifyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                <Text style={[styles.verifyTitle, { color: colors.text }]}>Verificando</Text>
                <Text style={[styles.verifyText, { color: colors.muted }]}>Tu registro fue recibido. Recibirás un correo de confirmación y otro con el código para definir tu contraseña cuando la cuenta esté aprobada.</Text>
                <TouchableOpacity style={[styles.verifyBtn, { backgroundColor: colors.primary }]} onPress={() => { setVerifyModalVisible(false); navigation.navigate('Home', { accessMode: 'authenticated', userName: nombre ? `${nombre} ${apellido}`.trim() : 'Laura Gomez' }); }}>
                  <Text style={{ color: '#fff' }}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Text style={[styles.privacy, { color: colors.muted }]}>Su información está encriptada y es procesada de forma segura.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TermsAndConditions')}>
            <Text style={[styles.privacyLink, { color: colors.accent }]}>Política de privacidad</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  container: { padding: 20, alignItems: 'stretch' },
  logo: { width: 72, height: 72, alignSelf: 'center', marginBottom: 10 },
  header: { textAlign: 'center', fontSize: 22, fontWeight: '700', marginBottom: 6 },
  helpText: { textAlign: 'center', fontSize: 13, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  half: { flex: 1 },
  label: { marginBottom: 6, fontSize: 12 },
  input: { height: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12 },
  select: { height: 44, borderWidth: 1, borderRadius: 8, justifyContent: 'center', paddingHorizontal: 12, marginBottom: 12 },
  uploadRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  uploadBox: { width: '48%', height: 120, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  uploadImage: { width: '100%', height: 120, borderRadius: 12 },
  uploadedOverlay: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  uploadedText: { color: '#FFF', fontSize: 12 },
  small: { fontSize: 12, marginTop: 8 },
  declarationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  cta: { marginTop: 16, paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  privacy: { textAlign: 'center', marginTop: 12, fontSize: 12 },
  privacyLink: { textAlign: 'center', marginTop: 2, fontSize: 12, textDecorationLine: 'underline' },
  verifyOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  verifyCard: { width: '84%', padding: 18, borderRadius: 12, borderWidth: 1 },
  verifyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  verifyText: { fontSize: 14, marginBottom: 12 },
  verifyBtn: { alignSelf: 'flex-end', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
});
