import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAppTheme } from '../theme/AppTheme';
import { verificarCodigo, resetPassword } from '../api/authApi';

export default function ResetPasswordScreen({ navigation, route }) {
  const { colors, radius, spacing, typography } = useAppTheme();
  const prefillEmail = route?.params?.email || '';

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function showError(title, message) {
    try {
      Alert.alert(title, message);
    } catch (e) {
      // ignore
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.alert) {
      window.alert(`${title}: ${message}`);
    }
  }

  async function handleSubmit() {
    console.log('[ResetPasswordScreen] handleSubmit start', { code, password, confirm });
    if (!code.trim()) {
      console.log('[ResetPasswordScreen] no code');
      showError('Error', 'Ingrese el código recibido por correo.');
      return;
    }
    if (password.length < 8) {
      showError('Error', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      showError('Error', 'Las contraseñas no coinciden.');
      return;
    }
    const specialRe = /[!@#$%^&*()_+\-={}\[\]:;"'<>.,?/\\|]/;
    if (!specialRe.test(password)) {
      showError('Error', 'La contraseña debe incluir al menos un carácter especial (por ejemplo: !@#$%).');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await verificarCodigo(code.trim());
      console.log('[ResetPasswordScreen] verificarCodigo returned', data);
      await resetPassword(data.tokenReseteo, password, confirm);
      Alert.alert('Contraseña generada', 'Su nueva contraseña ha sido guardada. Ahora puede iniciar sesión.');
      navigation.replace('Login');
    } catch (error) {
      console.error('[ResetPasswordScreen] error in submit', error);
      const message = error?.message || 'No se pudo actualizar la contraseña.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}> 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={[styles.title, { color: colors.text }]}>Generar Nueva Contraseña</Text>
          <Text style={[styles.help, { color: colors.muted }]}>Para finalizar el registro de su cuenta o reestablecer su contraseña, debe generar una nueva a partir del código que le fue enviado.</Text>

          <Text style={[styles.label, { color: colors.text }]}>Código recibido por correo:</Text>
          <TextInput value={code} onChangeText={setCode} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]} placeholder="Código (ej: ABC123)" />

          <Text style={[styles.label, { color: colors.text }]}>Nueva Contraseña</Text>
          <TextInput value={password} onChangeText={setPassword} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]} secureTextEntry />

          <Text style={[styles.label, { color: colors.text }]}>Repita la Contraseña</Text>
          <TextInput value={confirm} onChangeText={setConfirm} style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]} secureTextEntry />

          <TouchableOpacity onPress={handleSubmit} style={[styles.cta, { backgroundColor: colors.primary }]}> 
            <Text style={{ color: '#fff', fontWeight: '600' }}>Generar Nueva Contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.replace('Home', { accessMode: 'guest' })} style={styles.secondary}> 
            <Text style={{ color: colors.text }}>Continuar sin iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  help: { fontSize: 14, marginBottom: 12 },
  label: { fontSize: 13, marginTop: 8, marginBottom: 6 },
  input: { height: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12 },
  cta: { marginTop: 18, paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  secondary: { marginTop: 12, alignItems: 'center', paddingVertical: 10, backgroundColor: '#EFEFEF', borderRadius: 20 },
});
