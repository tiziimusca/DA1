import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/AppTheme';
import { fetchHomeDashboard, fetchPujas, fetchRegistrosSubasta } from '../api/auctionApi';
import { getToken } from '../auth/authManager';

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

function getItemTitle(puja) {
  return (
    puja?.item?.producto?.descripcionCompleta ||
    puja?.item?.producto?.descripcionCatalogo ||
    puja?.item?.catalogo?.descripcion ||
    puja?.item?.descripcion ||
    'Subasta'
  );
}

export default function MetricsScreen() {
  const { colors, radius } = useAppTheme();
  const token = getToken();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [home, setHome] = useState(null);
  const [pujas, setPujas] = useState([]);
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [homeData, pujasData, registrosData] = await Promise.all([
          fetchHomeDashboard(token),
          fetchPujas(),
          fetchRegistrosSubasta(),
        ]);

        if (!mounted) return;

        setHome(homeData);
        setPujas(Array.isArray(pujasData) ? pujasData : []);
        setRegistros(Array.isArray(registrosData) ? registrosData : []);
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

  const assisted = home?.metricas?.subastasActivas ?? home?.subastasActivas?.length ?? 0;
  const wins = home?.metricas?.subastasGanadas ?? 0;
  const totalOffered = useMemo(() => pujas.reduce((sum, puja) => sum + Number(puja?.importe || 0), 0), [pujas]);
  const totalSpent = useMemo(() => registros.reduce((sum, registro) => sum + Number(registro?.importe || 0), 0), [registros]);
  const winRate = '-';
  const assistedDelta = '-';
  const winsDelta = '-';
  const offeredDelta = '-';
  const spentDelta = '-';
  const winInsight = 'Tu eficiencia de victoria ha mejorado un - comparado con el trimestre anterior.';

  const participatedItems = useMemo(() => {
    const seen = new Map();

    pujas.forEach((puja, index) => {
      const key = puja?.item?.identificador ?? puja?.item?.id ?? `${getItemTitle(puja)}-${index}`;
      if (seen.has(key)) return;

      seen.set(key, {
        id: String(key),
        title: getItemTitle(puja),
        category: puja?.item?.catalogo?.descripcion || puja?.item?.categoria || 'General',
        amount: puja?.importe,
        status: String(puja?.ganador || '').toLowerCase() === 'si' ? 'Ganada' : 'Perdida',
      });
    });

    return Array.from(seen.values()).slice(0, 3);
  }, [pujas]);

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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Métricas de Subastas</Text>

        <View style={styles.grid}>
          <MetricCard title="Subastas asistidas" value={assisted} delta={assistedDelta} note="vs último período" colors={colors} radius={radius} />
          <MetricCard title="Subastas ganadas" value={wins} delta={winsDelta} note="verificación de eficiencia" colors={colors} radius={radius} />
          <MetricCard title="Monto total ofertado" value={compactMoney(totalOffered)} delta={offeredDelta} note="tasa de ejecución" colors={colors} radius={radius} />
          <MetricCard title="Total gastado" value={compactMoney(totalSpent)} delta={spentDelta} note="capital utilizado" colors={colors} radius={radius} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Tasa de victorias general</Text>
          <View style={styles.ringOuter}>
            <View style={[styles.ringInner, { borderColor: colors.primarySoft }]}>
              <Text style={[styles.ringValue, { color: colors.text }]}>{winRate}</Text>
            </View>
          </View>
          <Text style={[styles.insight, { color: colors.muted }]}>{winInsight}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Subastas participadas</Text>
          <View style={styles.participatedList}>
            {participatedItems.map((item) => (
              <View key={item.id} style={styles.participatedRow}>
                <View style={styles.participatedLeft}>
                  <View style={[styles.thumb, { backgroundColor: colors.primarySoft }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.participatedTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.participatedSubtitle, { color: colors.muted }]}>{item.category}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.participatedAmount, { color: colors.primary }]}>{compactMoney(item.amount)}</Text>
                  <Text style={[styles.participatedStatus, { color: colors.text }]}>{item.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ title, value, delta, note, colors, radius }) {
  const deltaColor = delta === '-' ? colors.muted : colors.success;

  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
      <Text style={[styles.metricTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.metricRow}>
        <Text style={[styles.metricValue, { color: colors.primary }]}>{value}</Text>
        <Text style={[styles.metricDelta, { color: deltaColor }]}>{delta}</Text>
      </View>
      <Text style={[styles.metricNote, { color: colors.muted }]}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: '500', marginBottom: 14 },
  grid: { gap: 12, marginBottom: 14 },
  metricCard: { borderWidth: 1, padding: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  metricTitle: { fontSize: 14, marginBottom: 8 },
  metricRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  metricValue: { fontSize: 34, fontWeight: '800' },
  metricDelta: { fontSize: 12, marginBottom: 6 },
  metricNote: { fontSize: 12, marginTop: 2 },
  card: { borderWidth: 1, padding: 14, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  ringOuter: { alignItems: 'center', marginBottom: 12 },
  ringInner: { width: 132, height: 132, borderRadius: 66, borderWidth: 10, alignItems: 'center', justifyContent: 'center' },
  ringValue: { fontSize: 24, fontWeight: '700' },
  insight: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  participatedList: { gap: 10 },
  participatedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  participatedLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  thumb: { width: 42, height: 42, borderRadius: 10 },
  participatedTitle: { fontSize: 13, fontWeight: '600' },
  participatedSubtitle: { fontSize: 11, marginTop: 2 },
  participatedAmount: { fontSize: 13, fontWeight: '700' },
  participatedStatus: { fontSize: 12, marginTop: 2 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { fontSize: 16, textAlign: 'center' },
});
