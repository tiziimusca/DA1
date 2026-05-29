import React from 'react';
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../theme/AppTheme';

export default function CatalogScreen({ route, navigation }) {
  const { colors, radius } = useAppTheme();
  const product = route?.params?.product;

  if (!product) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Catalogo no encontrado</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.primary, borderRadius: radius.round }]}>
            <Text style={{ color: '#fff' }}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.header, { color: colors.text }]}>Catalogo</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
          <View style={styles.imageWrap}>
            <Image source={{ uri: product.image }} style={styles.image} />
            <View style={styles.tag}>
              <Text style={styles.tagText}>{product.category}</Text>
            </View>
          </View>

          <View style={styles.body}>
            <Text style={[styles.title, { color: colors.text }]}>{product.title}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{product.subtitle}</Text>
            <Text style={[styles.description, { color: colors.text }]}>{product.description}</Text>

            <View style={styles.divider} />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Descripcion del producto</Text>
            <Text style={[styles.bodyText, { color: colors.text }]}>Pieza destacada del catalogo disponible para consulta sin iniciar sesion. Puedes explorar sus detalles, imágenes y estado de publicación antes de registrarte.</Text>

            <TouchableOpacity style={[styles.cta, { backgroundColor: colors.primary, borderRadius: radius.round }]} onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Inicie sesión para acceder a todas las funcionalidades</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  header: { textAlign: 'center', fontSize: 28, fontWeight: '500', marginBottom: 14 },
  card: { borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  imageWrap: { height: 220, position: 'relative', backgroundColor: '#ddd' },
  image: { width: '100%', height: '100%' },
  tag: { position: 'absolute', top: 10, right: 10, backgroundColor: '#111', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 18 },
  tagText: { color: '#F8D66D', fontSize: 11, fontWeight: '700' },
  body: { padding: 14 },
  title: { fontSize: 22, fontWeight: '500' },
  subtitle: { fontSize: 12, marginTop: 2 },
  description: { fontSize: 14, lineHeight: 20, marginTop: 12 },
  divider: { height: 1, backgroundColor: '#D8E1EE', marginVertical: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  bodyText: { fontSize: 13, lineHeight: 19 },
  cta: { marginTop: 18, alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { fontSize: 20, marginBottom: 12 },
  backBtn: { paddingHorizontal: 18, paddingVertical: 10 },
});
