import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../theme/AppTheme';
import { fetchClienteEstadisticas } from '../api/auctionApi';
import { getToken } from '../auth/authManager';
import AppFooterNav from '../components/AppFooterNav';
import { Ionicons as Icon } from '@expo/vector-icons';

function compactMoney(value) {
  const amount = Number(value || 0);
  if (!amount) return '$0';
  if (Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `$${Math.round(amount / 1000)}k`;
  }
  return `$${amount.toFixed(0)}`;
}

function formatCurrency(amount, currency) {
  const value = Number(amount || 0);
  const formatted = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${currency || 'USD'} ${formatted}`;
}

export default function MetricsScreen() {
  const { colors, radius } = useAppTheme();
  const navigation = useNavigation();
  const token = getToken();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const authHeader = token ? `Bearer ${token}` : null;
        const data = await fetchClienteEstadisticas(authHeader);
        if (!mounted) return;
        setStats(data);
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'No se pudieron cargar las métricas.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [token]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.error, { color: colors.text }]}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const participatedItems = stats?.participadas || [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header matching the style */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Métricas de Subastas</Text>
      </View>
      <View style={[styles.headerDivider, { backgroundColor: colors.border }]} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Grid cards */}
        <View style={styles.grid}>
          <MetricCard 
            title="Subastas asistidas" 
            value={stats?.subastasAsistidas ?? 0} 
            delta={stats?.subastasAsistidasDelta} 
            note={stats?.subastasAsistidasPeriodo} 
            iconName="calendar" 
            colors={colors} 
            radius={radius} 
          />
          <MetricCard 
            title="Subastas ganadas" 
            value={stats?.subastasGanadas ?? 0} 
            delta={stats?.subastasGanadasDelta} 
            note={stats?.subastasGanadasPeriodo} 
            iconName="trophy" 
            colors={colors} 
            radius={radius} 
          />
          <MetricCard 
            title="Monto total ofertado" 
            value={compactMoney(stats?.montoTotalOfertado)} 
            delta={stats?.montoTotalOfertadoDelta} 
            note={stats?.montoTotalOfertadoPeriodo} 
            iconName="wallet" 
            colors={colors} 
            radius={radius} 
          />
          <MetricCard 
            title="Total gastado" 
            value={compactMoney(stats?.totalGastado)} 
            delta={stats?.totalGastadoDelta} 
            note={stats?.totalGastadoPeriodo} 
            iconName="cash" 
            colors={colors} 
            radius={radius} 
          />
        </View>

        {/* General Win Rate card with Ring chart */}
        <View style={[styles.card, { backgroundColor: colors.metricsBackground, borderRadius: radius.lg }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Tasa de victorias general</Text>
          
          <View style={styles.ringOuter}>
            <View style={[
              styles.ringInner, 
              { 
                borderColor: colors.primarySoft, 
                borderRightColor: (stats?.tasaVictorias ?? 0) >= 25 ? colors.primary : colors.primarySoft,
                borderBottomColor: (stats?.tasaVictorias ?? 0) >= 50 ? colors.primary : colors.primarySoft,
                borderLeftColor: (stats?.tasaVictorias ?? 0) >= 75 ? colors.primary : colors.primarySoft,
                borderTopColor: (stats?.tasaVictorias ?? 0) >= 99 ? colors.primary : colors.primarySoft,
              }
            ]}>
              <View style={styles.ringValueContainer}>
                <Text style={[styles.ringValue, { color: colors.text }]}>{stats?.tasaVictorias ?? 0}%</Text>
              </View>
            </View>
          </View>
          
          <Text style={[styles.insight, { color: colors.text }]}>{stats?.tasaVictoriasInsight}</Text>
        </View>

        {/* Participated auctions list */}
        <View style={[styles.card, { backgroundColor: colors.metricsBackground, borderRadius: radius.lg, marginBottom: 24 }]}>
          <Text style={[styles.listTitle, { color: colors.text }]}>Subastas participadas</Text>
          <View style={[styles.listDivider, { backgroundColor: colors.text }]} />
          
          <View style={styles.participatedList}>
            {participatedItems.map((item) => (
              <View key={item.identificador} style={[styles.participatedRow, { backgroundColor: colors.surface }]}>
                <View style={styles.participatedLeft}>
                  {item.imagenUrl ? (
                    <Image source={{ uri: item.imagenUrl }} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumb, { backgroundColor: colors.primarySoft }]} />
                  )}
                  <View style={styles.detailsContainer}>
                    <Text style={[styles.participatedTitle, { color: colors.text }]} numberOfLines={1}>{item.titulo}</Text>
                    <Text style={[styles.participatedSubtitle, { color: colors.muted }]}>{item.categoria}</Text>
                  </View>
                </View>
                <View style={styles.participatedRight}>
                  <Text style={[styles.participatedAmount, { color: colors.primary }]}>{formatCurrency(item.monto, item.moneda)}</Text>
                  <View style={[styles.badge, { backgroundColor: colors.metricsBackground }]}>
                    <Text style={[styles.badgeText, { color: colors.primary }]}>{item.estado}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={{ backgroundColor: colors.surface }}>
        <AppFooterNav
          navigation={navigation}
          colors={colors}
          activeRouteName="Profile"
        />
      </View>
    </SafeAreaView>
  );
}

function MetricCard({ title, value, delta, note, iconName, colors, radius }) {
  const isNegative = delta ? delta.startsWith('-') : false;
  const deltaColor = isNegative ? '#D32F2F' : '#176F5B';
  const deltaSymbol = isNegative ? '↓' : '↑';
  const cleanDelta = delta ? delta.replace('+', '').replace('-', '') : '';

  return (
    <View style={[styles.metricCard, { backgroundColor: colors.metricsBackground, borderRadius: radius.lg }]}>
      <View style={styles.metricCardHeader}>
        <Text style={[styles.metricTitle, { color: colors.text }]}>{title}</Text>
        <Icon name={iconName} size={22} color={colors.primary} />
      </View>
      <View style={styles.metricRow}>
        <Text style={[styles.metricValue, { color: colors.primary }]}>{value}</Text>
        {delta && (
          <Text style={[styles.metricDelta, { color: deltaColor }]}>
            {deltaSymbol}{cleanDelta}
          </Text>
        )}
      </View>
      <Text style={[styles.metricNote, { color: colors.muted }]}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, marginTop: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: 16, textAlign: 'center' },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 14,
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerDivider: {
    height: 1,
    width: '100%',
  },

  content: { padding: 16, paddingBottom: 24 },
  grid: { gap: 12, marginBottom: 14 },
  
  metricCard: { 
    paddingHorizontal: 18, 
    paddingVertical: 16,
    shadowColor: '#000', 
    shadowOpacity: 0.04, 
    shadowRadius: 3, 
    shadowOffset: { width: 0, height: 1 }, 
    elevation: 1 
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricTitle: { fontSize: 13, fontWeight: '500' },
  metricRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  metricValue: { fontSize: 32, fontWeight: '800' },
  metricDelta: { fontSize: 12, fontWeight: '600', marginLeft: 2 },
  metricNote: { fontSize: 12, marginTop: 4 },
  
  card: { 
    padding: 18, 
    marginBottom: 14, 
    shadowColor: '#000', 
    shadowOpacity: 0.04, 
    shadowRadius: 3, 
    shadowOffset: { width: 0, height: 1 }, 
    elevation: 1 
  },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  listTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8, paddingHorizontal: 4 },
  listDivider: { height: 1, width: '100%', marginBottom: 14, opacity: 0.15 },

  ringOuter: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginVertical: 12 
  },
  ringInner: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    borderWidth: 10, 
    alignItems: 'center', 
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }]
  },
  ringValueContainer: {
    transform: [{ rotate: '45deg' }]
  },
  ringValue: { fontSize: 24, fontWeight: '800' },
  insight: { fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: 12, paddingHorizontal: 12 },
  
  participatedList: { gap: 10 },
  participatedRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 10, 
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1
  },
  participatedLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  thumb: { width: 44, height: 44, borderRadius: 12 },
  detailsContainer: { flex: 1 },
  participatedTitle: { fontSize: 13, fontWeight: '700' },
  participatedSubtitle: { fontSize: 11, marginTop: 2 },
  participatedRight: { alignItems: 'flex-end', gap: 4 },
  participatedAmount: { fontSize: 13, fontWeight: '800' },
  
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  }
});
