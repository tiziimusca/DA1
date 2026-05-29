import React from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../theme/AppTheme';

const featuredAuctions = [
  {
    id: '1',
    title: 'Reloj Rolex',
    subtitle: 'Empieza: 20 de Abril, 18:00',
    price: 'USD 4.500',
    category: 'PLATINO',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
    cta: 'Ingresar',
  },
  {
    id: '2',
    title: 'Televisor 115"',
    subtitle: 'Empieza: 20 de Abril, 18:00',
    price: 'USD 1.000',
    category: 'ORO',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80',
    cta: 'Ingresar',
  },
  {
    id: '3',
    title: 'Nike Air Max',
    subtitle: 'Empieza: 12 de Abril, 18:30',
    price: 'ARS 80.000',
    category: 'COMUN',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    cta: 'Ingresar',
  },
  {
    id: '4',
    title: 'Radio antigua',
    subtitle: 'Empieza mañana, 22:00',
    price: 'ARS 300.000',
    category: 'ESPECIAL',
    image: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=900&q=80',
    cta: 'Ingresar',
  },
];

const guestAuctions = [
  {
    id: '1',
    title: 'Reloj Rolex',
    subtitle: 'Termina hoy, 20:00',
    description: 'Pieza de coleccionista excepcional en perfecto estado.',
    category: 'PLATINO',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
    cta: 'Ver catálogo',
  },
  {
    id: '2',
    title: 'Televisor 115"',
    subtitle: 'Termina el 20 Abril, 18:00',
    description: 'Pantalla premium con imagen de alta definición y gran formato.',
    category: 'ORO',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80',
    cta: 'Ver catálogo',
  },
  {
    id: '3',
    title: 'Nike Air Max',
    subtitle: 'Termina 12 de Abril, 18:30',
    description: 'Zapatillas deportivas de edición moderna y gran comodidad.',
    category: 'COMUN',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    cta: 'Ver catálogo',
  },
  {
    id: '4',
    title: 'Radio antigua',
    subtitle: 'Termina mañana, 22:00',
    description: 'Objeto vintage restaurado con diseño y sonido clásico.',
    category: 'ESPECIAL',
    image: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=900&q=80',
    cta: 'Ver catálogo',
  },
];

const quickActions = [
  { id: 'metrics', title: 'Métricas', icon: '◔' },
  { id: 'item', title: 'Proponer Item', icon: '+' },
  { id: 'payments', title: 'Métodos de pago', icon: '▤' },
  { id: 'profile', title: 'Perfil', icon: '◉' },
];

export default function HomeScreen({ navigation, route }) {
  const { colors, radius } = useAppTheme();
  const accessMode = route?.params?.accessMode || 'authenticated';
  const isGuest = accessMode === 'guest';
  const auctions = isGuest ? guestAuctions : featuredAuctions;
  const userName = route?.params?.userName || 'Laura Gomez';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <FlatList
        data={auctions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.topRow}>
              <View style={styles.profileRow}>
                <View style={[styles.avatar, { backgroundColor: colors.primarySoft }]}>
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>{isGuest ? 'i' : 'LG'}</Text>
                </View>
                <Text style={[styles.userName, { color: colors.text }]}>{isGuest ? 'Inicie Sesión' : userName}</Text>
              </View>
            </View>

            {!isGuest ? (
              <>
                <View style={styles.statsRow}>
                  <StatCard title="Subastas Activas" value="12" colors={colors} radius={radius} />
                  <StatCard title="Subastas Ganadas" value="4" colors={colors} radius={radius} />
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Acceso rápido</Text>
                <View style={styles.quickGrid}>
                  {quickActions.map((action) => (
                    <TouchableOpacity key={action.id} style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
                      <Text style={styles.quickIcon}>{action.icon}</Text>
                      <Text style={[styles.quickText, { color: colors.text }]}>{action.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <View style={[styles.guestBanner, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
                <Text style={[styles.guestBannerText, { color: colors.text }]}>Inicie sesión para acceder a todas las funcionalidades</Text>
                <TouchableOpacity style={[styles.guestBannerBtn, { backgroundColor: colors.primary, borderRadius: radius.round }]} onPress={() => navigation.navigate('Login')}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Iniciar sesión</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Subastas activas</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Auctions')}>
                <Text style={{ color: colors.primary, fontSize: 12 }}>Ver todas</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <AuctionCard
            item={item}
            colors={colors}
            radius={radius}
            onPress={() => (isGuest ? navigation.navigate('Catalog', { product: item }) : navigation.navigate('Auctions'))}
            isGuest={isGuest}
          />
        )}
        ListFooterComponent={<View style={{ height: 16 }} />}
      />
    </SafeAreaView>
  );
}

function StatCard({ title, value, colors, radius }) {
  return (
    <View style={[styles.statCard, { backgroundColor: '#9FC7EB', borderColor: colors.text, borderRadius: radius.md }]}>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

function AuctionCard({ item, colors, radius, onPress, isGuest }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTextRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.muted }]}>{item.subtitle}</Text>
            {isGuest ? <Text style={[styles.cardDescription, { color: colors.text }]}>{item.description}</Text> : null}
          </View>
          {!isGuest ? <Text style={[styles.cardPrice, { color: colors.primary }]}>{item.price}</Text> : null}
        </View>

        <TouchableOpacity style={[styles.cardBtn, { backgroundColor: colors.primary, borderRadius: radius.round }]} onPress={onPress}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>{item.cta}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  listContent: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 18 },
  headerWrap: { marginBottom: 8 },
  topRow: { marginBottom: 12 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 16, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  statCard: { flex: 1, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 22, fontWeight: '400', marginBottom: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 12 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  quickCard: { width: '48.5%', minHeight: 74, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  quickIcon: { fontSize: 24, marginBottom: 4 },
  quickText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  guestBanner: { borderWidth: 1, padding: 16, marginBottom: 14, alignItems: 'center' },
  guestBannerText: { textAlign: 'center', fontSize: 13, marginBottom: 10 },
  guestBannerBtn: { paddingHorizontal: 18, paddingVertical: 10 },
  card: { borderWidth: 1, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  imageWrap: { height: 128, position: 'relative', backgroundColor: '#ddd' },
  image: { width: '100%', height: '100%' },
  tag: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 18, backgroundColor: '#111' },
  tagText: { color: '#F8D66D', fontSize: 11, fontWeight: '700' },
  cardBody: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 },
  cardTextRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '500' },
  cardSubtitle: { fontSize: 11, marginTop: 2 },
  cardDescription: { fontSize: 12, lineHeight: 17, marginTop: 10 },
  cardPrice: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  cardBtn: { alignSelf: 'center', minWidth: 140, alignItems: 'center', justifyContent: 'center', paddingVertical: 11, paddingHorizontal: 18 },
});
