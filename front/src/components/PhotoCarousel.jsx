import React, { useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Text, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * Carrusel de fotos reutilizable.
 *
 * Props:
 *  - uris        string[]   URIs ya decodificadas listas para <Image>
 *  - width       number     ancho de cada imagen (default: ancho de pantalla - 32)
 *  - height      number     alto del carrusel (default: 220)
 *  - tag         string     texto del badge esquina superior derecha (ej: categoría)
 */
export default function PhotoCarousel({
  uris = [],
  width = SCREEN_WIDTH - 32,
  height = 220,
  tag,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeUris = uris.length > 0 ? uris : [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  ];

  return (
    <View style={[styles.wrap, { height }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
          );
          setActiveIndex(index);
        }}
      >
        {safeUris.map((uri, idx) => (
          <Image
            key={idx}
            source={{ uri }}
            style={{ width, height }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Badge categoría */}
      {tag ? (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ) : null}

      {/* Contador top-left */}
      {safeUris.length > 1 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>{activeIndex + 1}/{safeUris.length}</Text>
        </View>
      )}

      {/* Dots bottom-center */}
      {safeUris.length > 1 && (
        <View style={styles.dotsWrap}>
          {safeUris.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor: idx === activeIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                  width: idx === activeIndex ? 18 : 7,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', backgroundColor: '#ddd', overflow: 'hidden' },
  tag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 18,
  },
  tagText: { color: '#F8D66D', fontSize: 11, fontWeight: '700' },
  counter: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  counterText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  dotsWrap: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: { height: 7, borderRadius: 4 },
});