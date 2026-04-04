/**
 * SEED — Componentes personales: H270M BAZOOKA + i7-7700 + RX 5500 XT
 * Ejecutar: node prisma/seed-personal.js
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📦 Cargando categorías...')

  const cats = await prisma.category.findMany()
  if (cats.length === 0) throw new Error('No hay categorías. Ejecuta primero: npm run db:seed')

  const cat = (name) => {
    const found = cats.find(c => c.name === name)
    if (!found) throw new Error(`Categoría no encontrada: ${name}`)
    return found.id
  }

  const IMG = {
    gpu:  'https://lh3.googleusercontent.com/aida-public/AB6AXuDez2cTH504ZbedIP89OX4kvSjiKG0j8CvP5mWF4lveEHDNs9FpMyDVDG6yz29EFDDysAvKNPPy5M_aSz7D2Q9wqYH4x3ixPlP2LFMEXwg3Zl6PCNBCOkmWbbWrtqbvE_PWJi4Kni1FHbQA0yCqYLahsBJ2MVe2OuJhwiUOiitnpnEmBM9H4jzVv23N0K96KvnPzztUt8APu-FkKMcNtBEtRu_O5ZO60SQJmPVsdkGOSDJY0nPHV48yG40DTbEpWyChUq8NNM',
    cpu:  'https://lh3.googleusercontent.com/aida-public/AB6AXuCfpPqUS-VWtNeLj-pHqEcY627y8fGKamQLzObjM4nss6W37692bIeT7ykVR5n39B8p8QY1b1wdqDxbpkYZxBa6_DJBGAHcb9aGbNrfqEv5waB25xTXfXNiQjpyTqifr1R-XQjOTB50lwiaTKnbIXp98JerqmzrSaKaZLLHrpAz1Wn_L7B06ZtGBlVVIXD8JK1v1pVVs4Bzk12SKebpuwL55F5MBEAIv5C544Ce3v-2ygPfzPMk8W6j9RrgrckhsEXi9WDr4bayf2A',
    mobo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr9nLtS3NaylNrqxHCCU2Bj9cXq7_jDTYnMaftRF-9_R6BG2s325xiUdNL_qauDMYrsp7MvQ8jRHFM8dDqL1mOAvdim1Z37J6OMbGQhljL7gf5RzFslhHseRXHn21_TQE2DMZPH6625uhD2-mXdgkjpxT9vBG18Tkp0tlK-b5cOvICtVWqt65NlqC-HiO2_W7jnCCc760okea9UJTuQ4SVdVbb7zApt8fYHBaHMrTfynQIxhPnsFmr7Nf9su5VeCMxnLvK2t12j4I',
  }

  const productos = [

    // ══════════════════════════════════════════════════════════════════════
    // 1. MSI H270M BAZOOKA (MS-7A70)
    // ══════════════════════════════════════════════════════════════════════
    {
      name:       'MSI H270M BAZOOKA (MS-7A70)',
      brand:      'MSI',
      price:      89.99,
      oldPrice:   119.99,
      stock:      12,
      badge:      '-25%',
      badgeColor: 'bg-red-500',
      rating:     4.4,
      reviews:    178,
      categoryId: cat('Placas Madre'),
      image:      IMG.mobo,
      description:
        'La MSI H270M BAZOOKA es una placa madre Micro-ATX de la línea Arsenal Gaming, diseñada para procesadores Intel de 6ª y 7ª generación (Kaby Lake / Skylake) con socket LGA1151. ' +
        'Incluye componentes Military Class 5 para mayor durabilidad y estabilidad, junto con iluminación LED gaming y soporte para hasta 64GB de RAM DDR4. ' +
        'Cuenta con tres ranuras M.2, seis puertos SATA III y conectividad USB 3.1 Gen1 Tipo-C. Ideal para builds compactos de gaming o productividad con buen precio.',
      specs: [
        'Socket LGA1151 (6ª/7ª Gen Intel)',
        'Chipset Intel H270',
        'Formato Micro-ATX',
        '4x DDR4 — hasta 64GB DDR4-2400',
        '3x Ranuras M.2 (PCIe / SATA)',
        '6x SATA III 6Gb/s',
        '1x PCIe 3.0 x16 + 2x PCIe 3.0 x1',
        'Audio Realtek ALC887 7.1 HD',
        'LAN Realtek 8111H Gigabit',
        'USB 3.1 Gen1 Tipo-C + 4x USB 3.0 + 4x USB 2.0',
        'Salidas video: HDMI + DVI-D',
        'Iluminación LED Gaming',
      ],
    },

    // ══════════════════════════════════════════════════════════════════════
    // 2. Intel Core i7-7700
    // ══════════════════════════════════════════════════════════════════════
    {
      name:       'Intel Core i7-7700 3.6GHz Kaby Lake',
      brand:      'Intel',
      price:      109.99,
      oldPrice:   139.99,
      stock:      18,
      badge:      '-21%',
      badgeColor: 'bg-red-500',
      rating:     4.5,
      reviews:    312,
      categoryId: cat('Procesadores'),
      image:      IMG.cpu,
      description:
        'El Intel Core i7-7700 es un procesador quad-core de 7ª generación (Kaby Lake) para socket LGA1151, lanzado en Q1 2017. ' +
        'Ofrece 4 núcleos y 8 hilos con frecuencia base de 3.6 GHz y turbo de hasta 4.2 GHz, siendo uno de los mejores procesadores de su generación para gaming y productividad. ' +
        'Incluye gráficos integrados Intel HD Graphics 630, soporte para memoria DDR4 y DDR3L, y tecnologías Intel Turbo Boost 2.0 e Hyper-Threading. ' +
        'Compatible con placas H270, Z270, B250 y chipsets 100/200 Series. Excelente opción para upgrades de sistemas LGA1151.',
      specs: [
        '4 Núcleos / 8 Hilos (Hyper-Threading)',
        'Frecuencia base: 3.60 GHz',
        'Frecuencia Turbo Boost 2.0: 4.20 GHz',
        'Caché L3: 8MB Intel Smart Cache',
        'Socket: LGA1151 (Series 100/200)',
        'Arquitectura: Kaby Lake — 14nm',
        'TDP: 65W',
        'RAM soportada: DDR4-2133/2400 · DDR3L-1333/1600',
        'RAM máxima: 64GB',
        'GPU integrada: Intel HD Graphics 630',
        'Bus: 8 GT/s DMI3',
        'Instrucciones: SSE4.1/4.2 · AVX 2.0 · AES-NI',
      ],
    },

    // ══════════════════════════════════════════════════════════════════════
    // 3. AMD Radeon RX 5500 XT 8GB
    // ══════════════════════════════════════════════════════════════════════
    {
      name:       'AMD Radeon RX 5500 XT 8GB GDDR6',
      brand:      'AMD',
      price:      129.99,
      oldPrice:   169.99,
      stock:      9,
      badge:      '-24%',
      badgeColor: 'bg-red-500',
      rating:     4.3,
      reviews:    245,
      categoryId: cat('Tarjetas de Video'),
      image:      IMG.gpu,
      description:
        'La AMD Radeon RX 5500 XT 8GB es una tarjeta gráfica de gama media-baja basada en la arquitectura RDNA 1.0 con proceso de 7nm, lanzada en diciembre de 2019. ' +
        'Diseñada para gaming 1080p, ofrece hasta 60 FPS en juegos AAA y más de 90 FPS en títulos esports. Sus 8GB de GDDR6 la hacen más longeva que versiones de 4GB. ' +
        'Incluye soporte para PCIe 4.0, AMD FreeSync, Radeon Image Sharpening (RIS) y FidelityFX para mejorar la imagen sin impacto significativo en rendimiento. ' +
        'Compite directamente con la NVIDIA GeForce GTX 1660 en rendimiento, con menor precio en el mercado de segunda mano.',
      specs: [
        '1,408 Stream Processors (22 CUs)',
        'Arquitectura: RDNA 1.0 — Navi 14 — 7nm',
        '8GB GDDR6 — Bus 128-bit',
        'Ancho de banda: 224 GB/s',
        'Frecuencia Game Clock: 1.717 GHz',
        'Frecuencia Boost: hasta 1.845 GHz',
        'Rendimiento: hasta 5.2 TFLOPS',
        'Interfaz: PCIe 4.0 x8',
        'TGP: 130W — Conector: 1x 8-pin',
        'Salidas: 1x HDMI 2.0b + 3x DisplayPort 1.4',
        'AMD FreeSync + RIS + FidelityFX',
        'DirectX 12 Ultimate · Vulkan · OpenGL 4.6',
      ],
    },
  ]

  const result = await prisma.product.createMany({ data: productos })
  console.log(`\n✅ ${result.count} productos insertados:`)
  console.log('   • MSI H270M BAZOOKA (MS-7A70)')
  console.log('   • Intel Core i7-7700 3.6GHz Kaby Lake')
  console.log('   • AMD Radeon RX 5500 XT 8GB GDDR6')
  console.log('\n🎉 Seed completado.')
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
