import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Modal,
  FlatList,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../theme/AppTheme';
import countries from '../data/countries';
import { getToken } from '../auth/authManager';
import { updateProfile } from '../api/authApi';
import AppFooterNav from '../components/AppFooterNav';

export default function EditProfileScreen({ navigation, route }) {
  const { colors } = useAppTheme();

  const initialProfile = route?.params?.profile || null;

  console.log("LOL",initialProfile)

  const [fullName, setFullName] = useState('');
  const [pais, setPais] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [avatarUri, setAvatarUri] = useState(initialProfile?.avatarUrl);
  // Foto en base64 puro, lista para mandar al backend como byte[] (varbinary).
  // Se completa solo cuando el usuario elige una foto nueva; si queda null,
  // significa que no se tocó el avatar y no se manda ese campo al guardar.
  const [avatarBase64, setAvatarBase64] = useState(null);

  useEffect(() => {
    if (initialProfile) {
      setFullName(initialProfile.nombre || '');
      setPais(initialProfile.pais || '');
      setDireccion(initialProfile.direccion || '');
      if (initialProfile.foto) {
        setAvatarUri(`data:image/jpeg;base64,${initialProfile.foto}`);
      }
    }
  }, [initialProfile]);

  function findCountryIdByName(name) {
    if (!name) return 1;
    const idx = countries.findIndex(c => c.name === name);
    return idx >= 0 ? Math.max(1, idx + 1) : 1;
  }

  // ─── Selector de foto de perfil ────────────────────────────────────────────

  /**
   * A veces (sobre todo en Android con allowsEditing:true) el picker no
   * devuelve el campo base64 del resultado, aunque se haya pedido
   * { base64: true }. Como fallback, leemos el archivo del uri directamente
   * con expo-file-system y lo codificamos a mano.
   */
  const resolveBase64 = async (asset) => {
    if (asset.base64) return asset.base64;
    try {
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding:  'base64',
      });
      return base64;
    } catch (err) {
      console.log('[EditProfileScreen] No se pudo generar base64 de la foto:', err.message);
      return null;
    }
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permiso requerido',
        'Necesitamos acceso a la cámara para tomar una foto. Podés habilitarlo en los ajustes del dispositivo.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setAvatarUri(asset.uri);
      const base64 = await resolveBase64(asset);
      console.log('[EditProfileScreen] avatarBase64 length (cámara):', base64?.length || 0);
      setAvatarBase64(base64);
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permiso requerido',
        'Necesitamos acceso a tus fotos para elegir una imagen. Podés habilitarlo en los ajustes del dispositivo.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setAvatarUri(asset.uri);
      const base64 = await resolveBase64(asset);
      console.log('[EditProfileScreen] avatarBase64 length (galería):', base64?.length || 0);
      setAvatarBase64(base64);
    }
  };

  const handleAvatarPress = () => {
    // En iOS usamos el ActionSheet nativo, más prolijo visualmente.
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tomar foto', 'Elegir de la galería'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickFromCamera();
          if (buttonIndex === 2) pickFromLibrary();
        }
      );
      return;
    }

    // En Android (y web) usamos Alert con botones, que se ve como un diálogo.
    Alert.alert(
      'Foto de perfil',
      '¿Cómo querés actualizar tu foto?',
      [
        { text: 'Tomar foto', onPress: pickFromCamera },
        { text: 'Elegir de la galería', onPress: pickFromLibrary },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  async function handleSave() {
    const errors = {};
    setFormError('');

    const trimmedFullName = fullName.trim();
    if (!trimmedFullName) {
      errors.fullName = 'Nombre completo obligatorio';
    }

    if (!pais) {
      errors.country = 'Seleccione un país';
    }

    if (!direccion.trim()) {
      errors.direccion = 'Domicilio obligatorio';
    }

    if (password) {
      if (password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres.';
      } else if (!/[!@#$%^&*()_+\-={}\[\]:;"'<>.,?/\\|]/.test(password)) {
        errors.password = 'Debe incluir al menos un carácter especial.';
      }
    }

    const nameParts = trimmedFullName.split(' ').filter(Boolean);
    if (nameParts.length < 2) {
      errors.fullName = 'Ingrese nombre y apellido';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError('Corrige los campos marcados en rojo.');
      return;
    }

    const nombre = nameParts.shift();
    const apellido = nameParts.join(' ');
    const payload = {
      nombre,
      apellido,
      idPaisNacimiento: findCountryIdByName(pais),
      direccion: direccion,
    };

    if (password) {
      payload.password = password;
    }

    // Solo mandamos el campo foto si el usuario realmente eligió una nueva imagen.
    // Si avatarBase64 es null significa que no tocó el avatar, y no queremos
    // pisar la foto existente en el backend con un valor vacío.
    if (avatarBase64) {
      payload.foto = avatarBase64;
    }
    console.log('[EditProfileScreen] avatarBase64 al guardar:', avatarBase64 ? `${avatarBase64.length} chars` : 'null/vacío');

    try {
      setIsSaving(true);
      const token = getToken();
      await updateProfile(token, payload);
      Alert.alert('Guardado', 'Perfil actualizado correctamente.');
      navigation.goBack();
    } catch (e) {
      const message = e.message || 'No se pudo actualizar el perfil.';
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-back"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.title,
              { color: colors.text },
            ]}
          >
            Configuración
          </Text>

          <View style={{ width: 24 }} />
        </View>

        <View style={styles.avatarWrapper}>
          <Image
            source={{
                uri:
                  avatarUri ||
                  'https://cdn-icons-png.flaticon.com/512/149/149071.png',
              }}
            style={styles.avatar}
          />

          <TouchableOpacity style={styles.editAvatar} onPress={handleAvatarPress}>
            <Icon
              name="pencil"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <Text>Nombre completo</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          style={[styles.input, fieldErrors.fullName ? styles.errorInput : null]}
          placeholder="Ej. Juan Pérez"
          placeholderTextColor={colors.muted}
        />
        {fieldErrors.fullName ? <Text style={styles.errorText}>{fieldErrors.fullName}</Text> : null}

        <Text>País de nacimiento</Text>
        <TouchableOpacity
          style={[
            styles.select,
            { borderColor: colors.border, backgroundColor: colors.surface },
            fieldErrors.country ? styles.errorInput : null,
          ]}
          onPress={() => setCountryModalVisible(true)}
        >
          <Text style={{ color: pais ? colors.text : colors.muted }}>{pais || 'Selecciona'}</Text>
        </TouchableOpacity>
        {fieldErrors.country ? <Text style={styles.errorText}>{fieldErrors.country}</Text> : null}

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

        <Text>Domicilio</Text>

        <TextInput
          value={direccion}
          onChangeText={setDireccion}
          style={[styles.input, fieldErrors.direccion ? styles.errorInput : null]}
          placeholder="Ej. Calle Falsa 123"
          placeholderTextColor={colors.muted}
        />
        {fieldErrors.direccion ? <Text style={styles.errorText}>{fieldErrors.direccion}</Text> : null}

        <Text>Contraseña</Text>

        <View style={styles.passwordContainer}>
          <TextInput
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
            style={[styles.input, styles.passwordInput, fieldErrors.password ? styles.errorInput : null]}
            placeholder="Nueva contraseña (opcional)"
            placeholderTextColor={colors.muted}
          />
          <TouchableOpacity
            style={styles.passwordToggleInside}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Icon
              name={passwordVisible ? 'eye' : 'eye-off'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
        {fieldErrors.password ? <Text style={styles.errorText}>{fieldErrors.password}</Text> : null}

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
          <Text style={styles.saveText}>
            {isSaving ? 'Guardando...' : 'Guardar los cambios'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={{ backgroundColor: colors.surface }}>
        <AppFooterNav navigation={navigation} colors={colors} activeRouteName="Profile" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  container: {
    padding: 20,
    marginTop: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
  },

  avatarWrapper: {
    alignSelf: 'center',
    marginVertical: 24,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  editAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1D3D91',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  inputHalf: {
    width: '48%',
  },

  select: {
    borderWidth: 1,
    borderRadius: 8,
    height: 46,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    height: 46,
    paddingHorizontal: 12,
    marginTop: 6,
    marginBottom: 16,
  },

  passwordContainer: {
    position: 'relative',
    marginTop: 6,
    marginBottom: 16,
  },

  passwordInput: {
    paddingRight: 45,
  },

  passwordToggleInside: {
    position: 'absolute',
    right: 12,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveBtn: {
    marginTop: 20,
    backgroundColor: '#123A91',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveText: {
    color: '#FFF',
    fontWeight: '600',
  },

  errorInput: {
    borderColor: '#D00000',
    backgroundColor: '#FFF1F1',
  },

  errorText: {
    color: '#D00000',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
  },

  formError: {
    color: '#D00000',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
});