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
import { useAppTheme } from '../theme/AppTheme';
import { login, solicitarCodigo } from '../api/authApi';
import { setSession } from '../auth/authManager';

export default function LoginScreen({ navigation }) {
  const { colors, spacing, radius, typography } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pwModalVisible, setPwModalVisible] = useState(false);
  const [pwEmail, setPwEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Datos incompletos', 'Ingrese email y contraseña.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await login(email.trim(), password);
      setSession({
        token: response.token,
        user: {
          nombre: response.nombre,
          categoria: response.categoria,
          email: email.trim(),
        },
      });
      navigation.replace('Home', { accessMode: 'authenticated' });
    } catch (error) {
      Alert.alert('Error de inicio de sesión', error.message || 'No se pudo iniciar sesión.');
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
                onChangeText={setEmail}
                placeholder="Name@example.com"
                placeholderTextColor={colors.muted}
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[styles.label, { color: colors.text }]}>Contraseña</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="******"
                placeholderTextColor={colors.muted}
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                secureTextEntry
              />

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
                      onChangeText={setPwEmail}
                      placeholder="Name@example.com"
                      placeholderTextColor={colors.muted}
                      style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                        onPress={async () => {
                          const targetEmail = (pwEmail || email).trim();
                          console.log('[LoginScreen] solicitarCodigo button pressed for', targetEmail);
                          if (!targetEmail) {
                            Alert.alert('Error', 'Ingrese un email válido.');
                            return;
                          }

                          try {
                            await solicitarCodigo(targetEmail);
                            Alert.alert(
                              'Código enviado',
                              'Si el email existe, recibirás un código para generar la nueva contraseña.'
                            );
                            setPwModalVisible(false);
                            navigation.navigate('ResetPassword', { email: targetEmail });
                          } catch (error) {
                            Alert.alert('Error', error.message || 'No se pudo enviar el código.');
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
                <Text style={{ color: colors.text }}>Continuar sin iniciar sesión</Text>
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
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 24 },
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
  button: { marginTop: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  line: { flex: 1, height: 1 },
  circle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDD', marginHorizontal: 12 },
  anonBtn: { alignSelf: 'center', backgroundColor: '#EFEFEF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  footerTextRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '86%', padding: 18, borderRadius: 12, borderWidth: 1 },
  modalClose: { position: 'absolute', right: 10, top: 8, padding: 6 },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  modalText: { textAlign: 'center', marginTop: 8 },
  modalInput: { height: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginTop: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 6 },
});

