import type { Product, Collection } from '@/types';

export const products: Product[] = [
  {
    id: 'opium-black-tee',
    name: 'Opium Black',
    type: 'HOUND Box Tee',
    lore: 'Once only a whisper, Opium Black returns in its second coming. Its myth now made concrete, forged for those who speak only the truth.',
    features: [
      'HOUND **Metal Alloy** Heart Logo',
      'HOUND Fabric Emboss Back Logo',
      'HOUND Sleeve Submark Label',
      'HOUND Wide Cropped Box Fit T-Shirt',
      '330GSM Suede-like Blend',
      'Model is 183cm wearing Size L',
      'Cropped by design — size up for added length or a looser drape.',
    ],
    passive: {
      stat: 'Two mans unlocked',
      value: '',
    },
    careInstructions: [
      'Cold Gentle Wash Only',
      'Do not dry clean',
      'Do not tumble dry',
      'Do not iron on emboss',
      'Do not bleach',
    ],
    images: ['/images/products/opium-black-tee.jpg'],
    price: 89,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'oatmeal-beige-tee',
    name: 'Oatmeal Beige',
    type: 'HOUND Box Tee',
    lore: 'Said to be spun from the oats of the Morningfields, this beige garb comforts the body and quiets the soul. Perfect for slow starts and noble snacks.',
    features: [
      'HOUND **Metal Alloy** Heart Logo',
      'HOUND Fabric Emboss Back Logo',
      'HOUND Sleeve Submark Label',
      'HOUND Wide Cropped Box Fit T-Shirt',
      '330GSM Suede-like Blend',
      'Cropped by design — size up for added length or a regular fit.',
    ],
    passive: {
      stat: 'Chance of fit eating',
      value: '+25%',
    },
    careInstructions: [
      'Cold Gentle Wash Only',
      'Do not dry clean',
      'Do not tumble dry',
      'Do not iron on emboss',
      'Do not bleach',
    ],
    images: ['/images/products/oatmeal-tee.jpg'],
    price: 89,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'verdant-hunt-tee',
    name: 'Verdant Hunt',
    type: 'HOUND Box Tee',
    lore: 'Favored by scouts who run the ridge lines of the kingdom, its cropped cut lets the wind pass freely. And with it, the secrets of Verdant\'s wild heart.',
    features: [
      'HOUND **Metal Alloy** Heart Logo',
      'HOUND Fabric Emboss Back Logo',
      'HOUND Sleeve Submark Label',
      'HOUND Wide Cropped Box Fit T-Shirt',
      '330GSM Suede-like Blend',
      'Model is 179cm wearing Size M',
      'Cropped by design — size up for added length or a regular fit.',
    ],
    passive: {
      stat: 'Clavicles',
      value: '+6%',
    },
    careInstructions: [
      'Cold Gentle Wash Only',
      'Do not dry clean',
      'Do not tumble dry',
      'Do not iron on emboss',
      'Do not bleach',
    ],
    images: ['/images/products/verdant-tee.jpg'],
    price: 89,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'opium-black-hoodie',
    name: 'Opium Black',
    type: 'HOUND Hoodie',
    lore: 'The cloak of wanderers who vanish into the night. Soft, shadowed, and steadfast. It remembers every path once taken, even when you do not.',
    features: [
      'HOUND Puff Print Heart Logo',
      'HOUND Puff Print Back Logo',
      'HOUND Puff Print Sleeve & Hood Logos',
      'HOUND Heavyweight Snatch Fit Hoodie',
      '330GSM Blend',
      'Model is 179cm wearing Size L',
      'Cropped by design — size up for added length or a regular fit.',
    ],
    passive: {
      stat: 'Night Vision',
      value: '+12%',
    },
    careInstructions: [
      'Cold Gentle Wash Only',
      'Do not dry clean',
      'Do not tumble dry',
      'Do not iron on puff print',
      'Do not bleach',
    ],
    images: ['/images/products/opium-black-hoodie.jpg'],
    price: 149,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'maya-pink-hoodie',
    name: 'Maya Pink',
    type: 'HOUND Hoodie',
    lore: 'A Celestehaven relic dyed in Maya\'s favourite bloom. Light as cloudglass, soft as promise. It appears only when the city remembers love.',
    features: [
      'HOUND Puff Print Heart Logo',
      'HOUND Puff Print Back Logo',
      'HOUND Puff Print Sleeve & Hood Logos',
      'HOUND Heavyweight Snatch Fit Hoodie',
      '330GSM Blend',
      'Cropped by design — size up for added length or a regular fit.',
    ],
    passive: {
      stat: 'Waist Diff',
      value: '+5%',
    },
    careInstructions: [
      'Cold Gentle Wash Only',
      'Do not dry clean',
      'Do not tumble dry',
      'Do not iron on puff print',
      'Do not bleach',
    ],
    images: ['/images/products/maya-pink-hoodie.jpg'],
    price: 149,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
];

export const collections: Collection[] = [
  {
    id: 'all',
    name: 'all',
    itemCount: 8,
    image: '/images/collection-thumb.jpg',
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};
