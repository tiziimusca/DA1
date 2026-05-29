import React from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/AppTheme';

export default function LoadingScreen() {
  const { colors, radius, spacing, typography } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" backgroundColor={colors.background} />

      <View style={[styles.backdrop, { backgroundColor: colors.primarySoft }]} />
      <View style={styles.topAccent} />

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.xl,
          },
        ]}
      >
        <View style={styles.logoFrame}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={[styles.brand, { color: colors.text, fontSize: typography.title }]}>ABAST</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Subastas con estilo y control centralizado</Text>

        <View style={styles.loaderRow}>
          <View style={[styles.loaderDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.loaderDot, { backgroundColor: colors.accent }]} />
          <View style={[styles.loaderDot, { backgroundColor: colors.primary }]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backdrop: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    top: -120,
    right: -120,
    opacity: 0.75,
  },
  topAccent: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: -80,
    left: -70,
    backgroundColor: '#E8EEF9',
    opacity: 0.85,
  },
  card: {
    width: '84%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  logoFrame: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 168,
    height: 168,
  },
  brand: {
    fontWeight: '700',
    letterSpacing: 2,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loaderRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  loaderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.9,
  },
});