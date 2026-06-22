import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../theme/AppTheme';
import { verificarCodigo, resetPassword } from '../api/authApi';
import { isValidEmail } from '../utils/validation';

export default function ResetPasswordScreen({ navigation, route }) {
  const { colors, radius, spacing, typography } = useAppTheme();
  const prefillEmail = route?.params?.email || '';

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setCodeError('');
    setPasswordError('');
    setConfirmError('');
    if (!code.trim()) {
      setCodeError('Ingrese el código recibido por correo.');
      return;
    }
    if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setConfirmError('Las contraseñas no coinciden.');
      return;
    }
    const specialRe = /[!@#$%^&*()_+\-={}\[\]:;"'<>.,?/\\|]/;
    if (!specialRe.test(password)) {
      setPasswordError('La contraseña debe incluir al menos un carácter especial (por ejemplo: !@#$%).');
      return;
    }
    if (!isValidEmail(prefillEmail.trim())) {
      setCodeError('Email inválido');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await verificarCodigo(code.trim());
      await resetPassword(data.tokenReseteo, password, confirm);
      navigation.replace('Login');
    } catch (error) {
      setCodeError('Código inválido o expirado');
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
          <TextInput
            value={code}
            onChangeText={(value) => {
              setCode(value);
              if (codeError) setCodeError('');
            }}
            style={[
              styles.input,
              { backgroundColor: colors.surface },
              codeError ? styles.errorInput : { borderColor: colors.border },
            ]}
            placeholder="Código (ej: ABC123)"
          />
          {codeError ? <Text style={styles.errorText}>{codeError}</Text> : null}

          <Text style={[styles.label, { color: colors.text }]}>Nueva Contraseña</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (passwordError) setPasswordError('');
              }}
              style={[
                styles.input,
                styles.passwordInput,
                { backgroundColor: colors.surface, color: colors.text },
                passwordError ? styles.errorInput : { borderColor: colors.border },
              ]}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowPassword((prev) => !prev)}>
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <Text style={[styles.label, { color: colors.text }]}>Repita la Contraseña</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              value={confirm}
              onChangeText={(value) => {
                setConfirm(value);
                if (confirmError) setConfirmError('');
              }}
              style={[
                styles.input,
                styles.passwordInput,
                { backgroundColor: colors.surface, color: colors.text },
                confirmError ? styles.errorInput : { borderColor: colors.border },
              ]}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowConfirmPassword((prev) => !prev)}>
              <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}

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
  passwordWrapper: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, paddingRight: 44 },
  iconButton: { position: 'absolute', right: 12, padding: 8 },
  cta: { marginTop: 18, paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  secondary: { marginTop: 12, alignItems: 'center', paddingVertical: 10, backgroundColor: '#EFEFEF', borderRadius: 20 },
  errorInput: { borderColor: '#D32F2F' },
  errorText: { color: '#D32F2F', fontSize: 12, marginTop: 2, marginBottom: 2 },
});
