import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../theme/AppTheme';
import AppFooterNav from '../components/AppFooterNav';
import { SERVER_BASE_URL } from '../config/apiConfig';
import { getToken } from '../auth/authManager';

const MIN_IMAGES = 6;

export default function ProponerProductoScreen({ navigation }) {
  const { colors } = useAppTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [relevance, setRelevance] = useState('');
  const [images, setImages] = useState([]);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [permissionError, setPermissionError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setPermissionError(true);
      }
    })();
  }, []);

  const handleSelectImage = async (index) => {
    if (permissionError) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería para seleccionar imágenes.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImages((current) => {
        const next = [...current];
        if (index >= next.length) {
          result.assets.forEach(asset => next.push({ uri: asset.uri, base64: asset.base64 }));
        } else {
          next[index] = { uri: result.assets[0].uri, base64: result.assets[0].base64 };
          let insertIdx = index + 1;
          for (let i = 1; i < result.assets.length; i++) {
            next.splice(insertIdx++, 0, { uri: result.assets[i].uri, base64: result.assets[i].base64 });
          }
        }
        return next;
      });
    }
  };

  const handleRemoveImage = (index) => {
    setImages((current) => {
      const next = [...current];
      next.splice(index, 1);
      return next;
    });
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Título obligatorio';
    if (!description.trim()) nextErrors.description = 'Descripción obligatoria';
    if (!relevance.trim()) nextErrors.relevance = 'Relevancia obligatoria';
    if (images.filter(Boolean).length < MIN_IMAGES) nextErrors.images = `Sube al menos ${MIN_IMAGES} imágenes`;
    if (!legalAccepted) nextErrors.legal = 'Debes aceptar la declaración de propiedad legal';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getToken();
      const payload = {
        titulo: title,
        descripcionCompleta: description,
        historia: relevance,
        declaracionPropiedad: legalAccepted,
        fotos: images.filter(Boolean).map(img => img.base64)
      };

      const response = await fetch(`${SERVER_BASE_URL}/api/productos/proponer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Error al enviar la propuesta.');
      }

      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageSlots = Array.from({ length: Math.max(MIN_IMAGES, images.length + 1) }, (_, index) => ({ index, image: images[index] }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}> 
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Proponer producto</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Título del producto</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="ej. Pintura al óleo renacentista"
          placeholderTextColor={colors.muted}
        />
        {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

        <Text style={[styles.label, { color: colors.text }]}>Descripción detallada</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.textArea, { borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="Describa el estado del objeto, materiales, y características clave..."
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
        />
        {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

        <Text style={[styles.label, { color: colors.text }]}>Relevancia histórica o artística</Text>
        <TextInput
          value={relevance}
          onChangeText={setRelevance}
          style={[styles.textArea, { borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder="Indique la procedencia, detalles del artista, o contexto histórico..."
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
        />
        {errors.relevance ? <Text style={styles.errorText}>{errors.relevance}</Text> : null}

        <View style={styles.imagesHeader}>
          <Text style={[styles.label, { color: colors.text }]}>Imágenes del artículo</Text>
          <Text style={styles.hintText}>Mínimo 6 imágenes</Text>
        </View>

        <FlatList
          data={imageSlots}
          keyExtractor={(item) => item.index.toString()}
          numColumns={3}
          scrollEnabled={false}
          style={{ marginBottom: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.imageCell, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleSelectImage(item.index)}
              activeOpacity={0.8}
            >
              {item.image?.uri ? (
                <>
                  <Image source={{ uri: item.image.uri }} style={styles.thumbnail} />
                  <TouchableOpacity
                    style={styles.removeImage}
                    onPress={() => handleRemoveImage(item.index)}
                  >
                    <Icon name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.emptyImageContent}>
                  <Icon name="camera" size={24} color={colors.primary} />
                  <Text style={[styles.addText, { color: colors.muted }]}>Agregar imagen</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
        {errors.images ? <Text style={styles.errorText}>{errors.images}</Text> : null}

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setLegalAccepted((current) => !current)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, { borderColor: legalAccepted ? colors.primary : colors.border, backgroundColor: legalAccepted ? colors.primary : colors.surface }]}> 
            {legalAccepted ? <Icon name="checkmark" size={16} color="#fff" /> : null}
          </View>
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>Certifico que soy el propietario legal o representante autorizado de este producto y que tengo el derecho de venderlo.</Text>
        </TouchableOpacity>
        {errors.legal ? <Text style={styles.errorText}>{errors.legal}</Text> : null}

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: isSubmitting ? colors.border : colors.primary }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitText}>{isSubmitting ? 'Enviando...' : 'Enviar propuesta para revisión'}</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>Nuestros curadores revisarán su propuesta y se pondrán en contacto con usted en un plazo de 2 a 3 días hábiles.</Text>

      </ScrollView>
      <View style={{ backgroundColor: colors.surface }}>
        <AppFooterNav navigation={navigation} colors={colors} activeRouteName="Home" />
      </View>
      
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => { setModalVisible(false); navigation.goBack(); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>El artículo se estará verificando</Text>
            <Text style={[styles.modalText, { color: colors.muted }]}>Le notificaremos a medida que se actualice la información.</Text>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setModalVisible(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
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
  },
  container: {
    padding: 20,
    paddingBottom: 64,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 120,
    padding: 14,
    marginBottom: 16,
  },
  imagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hintText: {
    fontSize: 12,
    color: '#667085',
  },
  imageCell: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    marginRight: '3.333%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyImageContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    textAlign: 'center',
  },
  addText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginVertical: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    width: '100%',
    alignSelf: 'center',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 24,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
  footerText: {
    fontSize: 13,
    color: '#667085',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    color: '#D00000',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButton: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
