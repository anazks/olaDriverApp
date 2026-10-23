import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, ViewStyle } from 'react-native';
import { OLA_LOGO_PNG_BASE64 } from '../constants/logoPngData';
import { OLA_LOGO_BASE64 } from '../constants/logoData';

interface OlaLogoProps {
  size?: number;
  showText?: boolean;
  subtext?: string;
  darkText?: boolean;
  style?: ViewStyle;
}

interface OlaBannerLogoProps {
  width?: number;
  height?: number;
  transparentBg?: boolean;
  style?: ViewStyle;
}

/**
 * Official Arrendadora OLA CARS banner logo using base64 data URI
 * (bypasses Metro bundler asset-cache issues for instant display)
 */
export const OlaBannerLogo: React.FC<OlaBannerLogoProps> = ({
  width = 160,
  height,
  transparentBg = false,
  style,
}) => {
  const calculatedHeight = height || Math.round(width / 4.74);
  const [loadError, setLoadError] = useState(false);

  return (
    <View
      style={[
        styles.bannerContainer,
        transparentBg && styles.bannerContainerTransparent,
        { width, height: calculatedHeight },
        style,
      ]}
    >
      <Image
        source={loadError ? { uri: OLA_LOGO_BASE64 } : { uri: OLA_LOGO_PNG_BASE64 }}
        style={styles.bannerImage}
        resizeMode="contain"
        accessibilityLabel="Arrendadora Ola Cars"
        onError={() => setLoadError(true)}
      />
    </View>
  );
};

/**
 * Pure code implementation of the official Ola emblem:
 * Lime squircle badge with concentric white, black, and lime circular rings.
 */
export const OlaEmblem: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size = 40,
  style,
}) => {
  const borderRadius = Math.round(size * 0.28);
  const ring1Size = Math.round(size * 0.64);
  const ring2Size = Math.round(size * 0.44);
  const ring3Size = Math.round(size * 0.22);

  return (
    <View
      style={[
        styles.squircle,
        {
          width: size,
          height: size,
          borderRadius,
        },
        style,
      ]}
    >
      {/* 1. OUTER WHITE RING */}
      <View
        style={[
          styles.circle,
          {
            width: ring1Size,
            height: ring1Size,
            borderRadius: ring1Size / 2,
            backgroundColor: '#FFFFFF',
          },
        ]}
      >
        {/* 2. MIDDLE BLACK RING */}
        <View
          style={[
            styles.circle,
            {
              width: ring2Size,
              height: ring2Size,
              borderRadius: ring2Size / 2,
              backgroundColor: '#000000',
            },
          ]}
        >
          {/* 3. CENTER LIME BULLSEYE */}
          <View
            style={[
              styles.circle,
              {
                width: ring3Size,
                height: ring3Size,
                borderRadius: ring3Size / 2,
                backgroundColor: 'rgb(200, 230, 0)',
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export const OlaLogo: React.FC<OlaLogoProps> = ({
  size = 40,
  showText = true,
  subtext,
  darkText = true,
  style,
}) => {
  const textColor = darkText ? '#000000' : '#FFFFFF';
  const subtextColor = darkText ? '#687386' : '#94A3B8';
  const fontSize = Math.round(size * 0.72);

  return (
    <View style={[styles.container, style]}>
      <OlaEmblem size={size} />

      {showText && (
        <View style={styles.textWrap}>
          <View style={styles.brandRow}>
            <Text style={[styles.brandOla, { fontSize, color: textColor }]}>Ola</Text>
            <Text style={[styles.brandCars, { fontSize, color: textColor }]}>Cars</Text>
          </View>
          {subtext && (
            <Text style={[styles.subtext, { color: subtextColor }]}>
              {subtext.toUpperCase()}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#000000',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bannerContainerTransparent: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  squircle: {
    backgroundColor: 'rgb(200, 230, 0)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandOla: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandCars: {
    fontWeight: '800',
    letterSpacing: -0.5,
    marginLeft: 2,
  },
  subtext: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 1,
  },
});
