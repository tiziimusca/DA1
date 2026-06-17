import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../theme/AppTheme';
import { login, solicitarCodigo } from '../api/authApi';
import { setSession } from '../auth/authManager';
import { isValidEmail } from '../utils/validation';

export default function LoginScreen({ navigation }) {
  const { colors, spacing, radius, typography } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pwModalVisible, setPwModalVisible] = useState(false);
  const [pwEmail, setPwEmail] = useState('');
  const [pwEmailError, setPwEmailError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setEmailError('');
    setPasswordError('');

    const trimmedEmail = email.trim();
    let hasError = false;

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setEmailError('Email invalido');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Contraseña obligatoria');
      hasError = true;
    }
    if (hasError) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await login(email.trim(), password);
      setSession({
        token: response.token,
        user: {
          id: response.usuarioId,
          nombre: response.nombre,
          categoria: response.categoria,
          email: email.trim(),
        },
      });
      navigation.replace('Home', { accessMode: 'authenticated' });
    } catch (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('email inexistente') || msg.includes('email no registrado')) {
        setEmailError('Email inexistente');
      } else if (msg.includes('401') || msg.includes('credenciales') || msg.includes('incorrecta')) {
        setPasswordError('Contraseña incorrecta');
      } else {
        Alert.alert('Error de inicio de sesión', error.message || 'No se pudo iniciar sesión.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleContinueAnon() {
    navigation.replace('Home', { accessMode: 'guest' });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />

            <Text style={[styles.title, { color: colors.text, fontSize: typography.subtitle }]}>Bienvenido! Inicie sesión</Text>

            <View style={styles.form}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (emailError) setEmailError('');
                }}
                placeholder="Name@example.com"
                placeholderTextColor={colors.muted}
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, color: colors.text },
                  emailError ? styles.errorInput : { borderColor: colors.border },
                ]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              <Text style={[styles.label, { color: colors.text }]}>Contraseña</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="******"
                  placeholderTextColor={colors.muted}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    { backgroundColor: colors.surface, color: colors.text },
                    passwordError ? styles.errorInput : { borderColor: colors.border },
                  ]}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

              <TouchableOpacity onPress={() => setPwModalVisible(true)} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                <Text style={{ color: colors.primary }}>Generar una nueva contraseña</Text>
              </TouchableOpacity>

              <Modal visible={pwModalVisible} transparent animationType="fade" onRequestClose={() => setPwModalVisible(false)}>
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                    <Pressable style={styles.modalClose} onPress={() => setPwModalVisible(false)}>
                      <Text style={{ fontSize: 18 }}>✕</Text>
                    </Pressable>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Generar Contraseña</Text>
                    <Text style={[styles.modalText, { color: colors.muted }]}>¿Desea generar una nueva contraseña?</Text>

                    <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
                    <TextInput
                      value={pwEmail}
                      onChangeText={(value) => {
                        setPwEmail(value);
                        if (pwEmailError) setPwEmailError('');
                      }}
                      placeholder="Name@example.com"
                      placeholderTextColor={colors.muted}
                      style={[
                        styles.modalInput,
                        { backgroundColor: colors.surface, color: colors.text },
                        pwEmailError ? styles.errorInput : { borderColor: colors.border },
                      ]}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {pwEmailError ? <Text style={styles.errorText}>{pwEmailError}</Text> : null}

                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                        onPress={async () => {
                          const targetEmail = (pwEmail || email).trim();
                          console.log('[LoginScreen] solicitarCodigo button pressed for', targetEmail);
                          if (!targetEmail || !isValidEmail(targetEmail)) {
                            setPwEmailError('Email inválido o inexistente');
                            return;
                          }

                          try {
                            await solicitarCodigo(targetEmail);
                            setPwEmailError('');
                            setPwModalVisible(false);
                            navigation.navigate('ResetPassword', { email: targetEmail });
                          } catch (error) {
                            console.log('[LoginScreen] Error al solicitar código:', error.message);
                            setPwEmailError('Email inexistente');
                          }
                        }}
                      >
                        <Text style={{ color: '#fff' }}>Aceptar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#333' }]} onPress={() => setPwModalVisible(false)}>
                        <Text style={{ color: '#fff' }}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>

              <TouchableOpacity
                onPress={handleLogin}
                activeOpacity={0.9}
                style={[styles.button, { backgroundColor: colors.primary, borderRadius: radius.round, paddingVertical: spacing.md }]}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText]}>{isLoading ? 'Ingresando...' : 'Iniciar sesion'}</Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={[styles.line, { backgroundColor: colors.border }]} />
                <View style={styles.circle} />
                <View style={[styles.line, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity onPress={handleContinueAnon} style={styles.anonBtn}>
                <Text style={{ color: '#fff' }}>Continuar sin iniciar sesión</Text>
              </TouchableOpacity>

              <View style={styles.footerTextRow}>
                <Text style={{ color: colors.muted }}>¿Todavia no tienes una cuenta? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={{ color: colors.accent }}>Registrate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 24, marginTop: 50 },
  logo: { width: 96, height: 96, marginBottom: 16 },
  title: { fontWeight: '600', fontSize: 20, marginBottom: 12 },
  form: { width: '100%', marginTop: 8 },
  label: { fontSize: 12, marginBottom: 6 },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  passwordInput: { flex: 1, paddingRight: 44 },
  iconButton: { position: 'absolute', right: 12, padding: 8 },
  button: { marginTop: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  line: { flex: 1, height: 1 },
  circle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDD', marginHorizontal: 12 },
  anonBtn: { alignSelf: 'center', backgroundColor: '#3E4148', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  footerTextRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '86%', padding: 18, borderRadius: 12, borderWidth: 1 },
  modalClose: { position: 'absolute', right: 10, top: 8, padding: 6 },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  modalText: { textAlign: 'center', marginTop: 8 },
  modalInput: { height: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginTop: 8, marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 6 },
  errorInput: { borderColor: '#D32F2F' },
  errorText: { color: '#D32F2F', fontSize: 12, marginTop: -8, marginBottom: 8 },
});
