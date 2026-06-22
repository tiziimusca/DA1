import React, { useState } from 'react';
import { View, Image, ScrollView, StyleSheet, Text } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';

function CategoryBadgeIcon({ category }) {
  if (!category) return null;
  const name = category.trim().toUpperCase();

  if (name.includes('COMUN') || name.includes('COMÚN')) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path
          d="M12,3 L21,10.5 L21,20.5 L12,16 L3,20.5 L3,10.5 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (name.includes('ESPECIAL')) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path
          d="M12,3 L21,10.5 L21,20.5 L12,16 L3,20.5 L3,10.5 Z"
          fill="#F8D66D"
          stroke="#F8D66D"
          strokeWidth={1}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (name.includes('PLATA')) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path
          d="M7,2.5 L8.2,5.2 L11.1,5.5 L8.9,7.5 L9.5,10.3 L7,8.8 L4.5,10.3 L5.1,7.5 L2.9,5.5 L5.8,5.2 Z"
          fill="none"
          stroke="#C0C0C0"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        <Path
          d="M17,2.5 L18.2,5.2 L21.1,5.5 L18.9,7.5 L19.5,10.3 L17,8.8 L14.5,10.3 L15.1,7.5 L12.9,5.5 L15.8,5.2 Z"
          fill="none"
          stroke="#C0C0C0"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        <Path
          d="M4,13 L12,19 L20,13"
          fill="none"
          stroke="#C0C0C0"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M4,17 L12,23 L20,17"
          fill="none"
          stroke="#C0C0C0"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (name.includes('ORO')) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path
          d="M7,2.5 L8.2,5.2 L11.1,5.5 L8.9,7.5 L9.5,10.3 L7,8.8 L4.5,10.3 L5.1,7.5 L2.9,5.5 L5.8,5.2 Z"
          fill="#F8D66D"
          stroke="#F8D66D"
          strokeWidth={1}
          strokeLinejoin="round"
        />
        <Path
          d="M17,2.5 L18.2,5.2 L21.1,5.5 L18.9,7.5 L19.5,10.3 L17,8.8 L14.5,10.3 L15.1,7.5 L12.9,5.5 L15.8,5.2 Z"
          fill="#F8D66D"
          stroke="#F8D66D"
          strokeWidth={1}
          strokeLinejoin="round"
        />
        <Path
          d="M4,13 L12,19 L20,13"
          fill="none"
          stroke="#F8D66D"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M4,17 L12,23 L20,17"
          fill="none"
          stroke="#F8D66D"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (name.includes('PLATINO')) {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24">
        <Path
          d="M4,3 L20,3 L20,18 L12,23 L4,18 Z"
          fill="#F8D66D"
        />
        <Line
          x1={4}
          y1={5.5}
          x2={20}
          y2={5.5}
          stroke="#111"
          strokeWidth={1}
        />
        <Path
          d="M12,7 L12.8,8.8 L14.8,9 L13.3,10.3 L13.7,12.2 L12,11.2 L10.3,12.2 L10.7,10.3 L9.2,9 L11.2,8.8 Z"
          fill="#111"
        />
        <Path
          d="M8,14.5 L12,17.5 L16,14.5"
          fill="none"
          stroke="#111"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8,17 L12,20 L16,17"
          fill="none"
          stroke="#111"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8,19.5 L12,22.5 L16,19.5"
          fill="none"
          stroke="#111"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return null;
}

export default function PhotoCarousel({ uris = [], height = 220, tag }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const safeUris = uris.length > 0 ? uris : [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  ];

  return (
    <View
      style={[styles.wrap, { height }]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={containerWidth}
          snapToAlignment="start"
          disableIntervalMomentum
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
            setActiveIndex(index);
          }}
        >
          {safeUris.map((uri, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              style={{ width: containerWidth, height }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      {tag ? (
        <View style={[styles.tag, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
          <CategoryBadgeIcon category={tag} />
          <Text style={styles.tagText}>{tag.trim().toUpperCase()}</Text>
        </View>
      ) : null}

      {safeUris.length > 1 && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>{activeIndex + 1}/{safeUris.length}</Text>
        </View>
      )}

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
  tagText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
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