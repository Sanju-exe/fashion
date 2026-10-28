/**
 * Authentic Garment Collection provided by user
 * Real photographic textures with extracted cutouts and precise anatomical anchors.
 */

export const REAL_GARMENTS = [
  {
    id: 'shirt1',
    name: 'Zara Riviera Cream Striped Shirt',
    price: '$380.00',
    category: 'Overshirt',
    tagline: 'Pure Flax Linen Blend // Classic Riviera Stripes',
    badge: 'Pure Linen',
    accentColor: '#c5bfb4',
    description: 'Breezy luxury flax linen shirt in clean ivory cream featuring subtle slate-grey vertical pinstripes, soft point collar, and relaxed sleeve drape.',
    fabric: '100% Normandy Flax Linen Blend (185 GSM)',
    fit: 'Relaxed Tailored Resort Fit',
    image: '/clothes/real/01_cream_striped.png',
    cutout: '/clothes/real/01_cream_striped.png',
    anchor: {
      shoulderSpanRatio: 0.50,
      shoulderYRatio: 0.172,
      collarOffsetY: 0.172,
      aspectRatio: 1240 / 1269,
      scaleMultiplier: 0.96,
      verticalAdjustment: 0.05
    }
  },
  {
    id: 'shirt2',
    name: 'Midnight Navy Pinstripe Overshirt',
    price: '$420.00',
    category: 'Overshirt',
    tagline: 'Deep Indigo Slub // Vertical Micro-Stripe',
    badge: 'Artisan Dye',
    accentColor: '#2b334a',
    description: 'Deep midnight navy cotton-linen shirt accented with delicate crisp white vertical stripes. Structured yet breathable with polished buttoned cuffs.',
    fabric: '85% Cotton, 15% Linen Slub',
    fit: 'Contemporary Modern Fit',
    image: '/clothes/real/02_navy_striped.png',
    cutout: '/clothes/real/02_navy_striped.png',
    anchor: {
      shoulderSpanRatio: 0.50,
      shoulderYRatio: 0.172,
      collarOffsetY: 0.172,
      aspectRatio: 1240 / 1269,
      scaleMultiplier: 0.96,
      verticalAdjustment: 0.05
    }
  },
  {
    id: 'shirt3',
    name: 'Heritage Rust & Indigo Shadow Plaid',
    price: '$450.00',
    category: 'Flannel',
    tagline: 'Heavy Brushed Twill // Dual-Tone Shadow Plaid',
    badge: 'Heritage Cut',
    accentColor: '#5e4b47',
    description: 'Heavyweight brushed twill flannel woven in warm chestnut brown and dusky slate-blue plaid. Features chest patch pocket and reinforced seams.',
    fabric: '100% Heavy Brushed Cotton Twill (320 GSM)',
    fit: 'Classic Overshirt Fit',
    image: '/clothes/real/03_brown_blue_plaid.png',
    cutout: '/clothes/real/03_brown_blue_plaid.png',
    anchor: {
      shoulderSpanRatio: 0.52,
      shoulderYRatio: 0.171,
      collarOffsetY: 0.171,
      aspectRatio: 1085 / 1254,
      scaleMultiplier: 0.98,
      verticalAdjustment: 0.05
    }
  },
  {
    id: 'shirt4',
    name: 'Urban Espresso Buffalo Check Flannel',
    price: '$490.00',
    category: 'Flannel',
    tagline: '340 GSM Heavyweight Twill // Dark Espresso Plaid',
    badge: 'Cold Season',
    accentColor: '#3c322e',
    description: 'Substantial dark espresso and charcoal Buffalo plaid overshirt. Exceptional warmth and drape with brushed texture inside and out.',
    fabric: '100% Combed Heavy Cotton (340 GSM)',
    fit: 'Tailored Relaxed Fit',
    image: '/clothes/real/04_dark_brown_plaid.png',
    cutout: '/clothes/real/04_dark_brown_plaid.png',
    anchor: {
      shoulderSpanRatio: 0.48,
      shoulderYRatio: 0.172,
      collarOffsetY: 0.172,
      aspectRatio: 1236 / 1265,
      scaleMultiplier: 0.96,
      verticalAdjustment: 0.05
    }
  },
  {
    id: 'shirt5',
    name: 'Nordic Forest Green Buffalo Overshirt',
    price: '$520.00',
    category: 'Overshirt',
    tagline: 'Alpine Wool & Cotton // Forest Green & Sand Plaid',
    badge: 'Winter Essential',
    accentColor: '#4f5951',
    description: 'Bold geometric check pattern in deep pine green and natural oat beige. Crafted with wool blend for structured layering.',
    fabric: '70% Cotton, 30% Fine Wool',
    fit: 'Structured Boxy Layering Fit',
    image: '/clothes/real/05_green_beige_plaid.png',
    cutout: '/clothes/real/05_green_beige_plaid.png',
    anchor: {
      shoulderSpanRatio: 0.48,
      shoulderYRatio: 0.171,
      collarOffsetY: 0.171,
      aspectRatio: 1226 / 1185,
      scaleMultiplier: 0.96,
      verticalAdjustment: 0.05
    }
  }
];

export const REAL_HUMAN_MODELS = [
  {
    id: 'real-male',
    name: 'Marcus',
    label: 'Real Studio Portrait (Male 184 cm)',
    image: '/models/real/real_model_male.jpg',
    description: 'Genuine photographic human model with real skin texture and natural studio lighting.'
  },
  {
    id: 'real-female',
    name: 'Elena',
    label: 'Real Studio Portrait (Female 175 cm)',
    image: '/models/real/real_model_female.jpg',
    description: 'Genuine photographic human model with real facial features and natural posture.'
  }
];
