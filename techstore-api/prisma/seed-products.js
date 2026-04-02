/**
 * SEED ADICIONAL DE PRODUCTOS — Amplía el catálogo sin borrar datos existentes
 * Ejecutar: node prisma/seed-products.js
 *
 * Agrega 60 productos nuevos distribuidos en todas las categorías.
 * Ninguno repite nombres del seed principal.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📦 Cargando categorías...')

  const cats = await prisma.category.findMany()
  if (cats.length === 0) {
    throw new Error('No hay categorías. Ejecuta primero: npm run db:seed')
  }

  const cat = (name) => {
    const found = cats.find(c => c.name === name)
    if (!found) throw new Error(`Categoría no encontrada: ${name}`)
    return found.id
  }

  // ── Imágenes reutilizables por categoría ────────────────────────────────
  const IMG = {
    gpu:     'https://lh3.googleusercontent.com/aida-public/AB6AXuDez2cTH504ZbedIP89OX4kvSjiKG0j8CvP5mWF4lveEHDNs9FpMyDVDG6yz29EFDDysAvKNPPy5M_aSz7D2Q9wqYH4x3ixPlP2LFMEXwg3Zl6PCNBCOkmWbbWrtqbvE_PWJi4Kni1FHbQA0yCqYLahsBJ2MVe2OuJhwiUOiitnpnEmBM9H4jzVv23N0K96KvnPzztUt8APu-FkKMcNtBEtRu_O5ZO60SQJmPVsdkGOSDJY0nPHV48yG40DTbEpWyChUq8NNM',
    cpu:     'https://lh3.googleusercontent.com/aida-public/AB6AXuCfpPqUS-VWtNeLj-pHqEcY627y8fGKamQLzObjM4nss6W37692bIeT7ykVR5n39B8p8QY1b1wdqDxbpkYZxBa6_DJBGAHcb9aGbNrfqEv5waB25xTXfXNiQjpyTqifr1R-XQjOTB50lwiaTKnbIXp98JerqmzrSaKaZLLHrpAz1Wn_L7B06ZtGBlVVIXD8JK1v1pVVs4Bzk12SKebpuwL55F5MBEAIv5C544Ce3v-2ygPfzPMk8W6j9RrgrckhsEXi9WDr4bayf2A',
    ram:     'https://lh3.googleusercontent.com/aida-public/AB6AXuAkgMHofGtDL-ftPuQvkkcjrRrYUPW_Ly7I2b4-2CYMiEVIpU1RR13X-3O_F1HaxFptl913a84xxs2j747KW9HhK-OS6h0kHpbBN5D5OWZO7ixKXwDRnpiSUbcgoo7ExaSpreoFKxl0F2qmUVvit6VVYNpP15WF4DdD21OFU5vRH54BuFQCu-RJNXxU8uY1553QAIWDzyyUlwe508htqWcN5P4NsTTBlJ6MkMPRYl5_8XEQ-JQ8G-Pslh6AvlvbfLLh5vi7XdMw034',
    ssd:     'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoRqE_md72jxMheVEObylFGVhckaq7UAKWCoGeOO0GyWLjsZ_QgIg9XftvbQRaB-3S84HE1eHvlvYiXH3A7zHNsk3jTeHSJUdifbBJa8x4cacGzXOAdeZ9OJv7jSAw1x4EHEdEdTVdTyXYND4E1mv4OiUWoywHAEnKTod6c7IL1IcsV7s0Kb5k7XwV3vTGmkHnaFMqT3rh3ayMR6sS6NmYBZBCw8EV1kyKChd1ktefM5agFe0jBZVpGTwCOcPLtpO-rTKZWMwZB8',
    mobo:    'https://lh3.googleusercontent.com/aida-public/AB6AXuDr9nLtS3NaylNrqxHCCU2Bj9cXq7_jDTYnMaftRF-9_R6BG2s325xiUdNL_qauDMYrsp7MvQ8jRHFM8dDqL1mOAvdim1Z37J6OMbGQhljL7gf5RzFslhHseRXHn21_TQE2DMZPH6625uhD2-mXdgkjpxT9vBG18Tkp0tlK-b5cOvICtVWqt65NlqC-HiO2_W7jnCCc760okea9UJTuQ4SVdVbb7zApt8fYHBaHMrTfynQIxhPnsFmr7Nf9su5VeCMxnLvK2t12j4I',
    case_:   'https://lh3.googleusercontent.com/aida-public/AB6AXuDOFIBxBfcr3WFoBoGgnXKpu5QR5JkzCRRbNjD4evj1oW4Jly6zlLbeZtUPqWSApW3CDUu1-dIRBRVBgp8-anE47qnfaQ_6V65eXL2zzC_JHvJIGC9ZYcvjr9cGks40D6YSz0owimxRmfFAP-KliWHNO6Xdj6icg-0yrWwtADUY4AtalKZ-GrqWcXpKw9s9CeUlJ0tG23iqdcwkAOKIZ9F_-W_bPMYrhIpsARxG5BUpGO8yS4E5A52Adca-srpDJ5VfHthGr2idxvA',
    psu:     'https://lh3.googleusercontent.com/aida-public/AB6AXuBZNISJLM71aWLgsGizZRcVTh5jpc2hgqTz54IbFpSulljY6-dHs9R1Q4Inv-dqJqQ6nXygnuN0pN83PLw9L3nB_uQgp8YtHhFXedrTZD0hY_YTqqbVIFLox6rjij5-dDZvIZDZbiRzENAVa7uDoGbnem-yOOsLskpuhIoSIa-vb-C0DXuPSApUK4E_pGU-cSkBBgMeyu4e-mLsQs4odDBk0IwKllHzDhCxsHzNweSL5ANHbmSGaj3VNfjxRNI4t2FfXGXRhD3Smrw',
    cooling: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZNISJLM71aWLgsGizZRcVTh5jpc2hgqTz54IbFpSulljY6-dHs9R1Q4Inv-dqJqQ6nXygnuN0pN83PLw9L3nB_uQgp8YtHhFXedrTZD0hY_YTqqbVIFLox6rjij5-dDZvIZDZbiRzENAVa7uDoGbnem-yOOsLskpuhIoSIa-vb-C0DXuPSApUK4E_pGU-cSkBBgMeyu4e-mLsQs4odDBk0IwKllHzDhCxsHzNweSL5ANHbmSGaj3VNfjxRNI4t2FfXGXRhD3Smrw',
    peri:    'https://lh3.googleusercontent.com/aida-public/AB6AXuAeuaghldg-UAbRlGLc3Gdt77dhXMKENdIm5kpSh5q3xrFaWeq3fhVe2A9af_Ynm3mfLjaQ2Q8dIkccby2Ej4PiOK4fbJAQaRZqBcrBNeMeyVerEJUzR6ides8zoT8_qZjCUX6USH7RQO80VPMZar030zsgwXOyMTaIXHFWmi9D79b6AN7ipvvUM-peQDKuKxpizqow5FPBfs9TBspT72clSODAy5EdgvOWxxwaLaWuxMrFoFRWtGfJLAw9DNaAHAa96pB2xGpIRCk',
  }

  const newProducts = [

    // ══════════════════════════════════════════════════════════════════════
    // TARJETAS DE VIDEO (10)
    // ══════════════════════════════════════════════════════════════════════
    {
      name: 'AMD Radeon RX 7900 XTX 24GB',
      brand: 'AMD', price: 899.99, stock: 7,
      categoryId: cat('Tarjetas de Video'), image: IMG.gpu,
      rating: 4.7, reviews: 134, badge: 'HOT', badgeColor: 'bg-orange-500',
      description: 'La GPU AMD más potente con 24GB GDDR6 y arquitectura RDNA 3. Ideal para gaming 4K y creación de contenido profesional.',
      specs: ['24GB GDDR6', 'RDNA 3', 'PCIe 4.0', '355W TDP'],
    },
    {
      name: 'NVIDIA GeForce RTX 4070 Super 12GB',
      brand: 'Zotac', price: 599.99, stock: 14,
      categoryId: cat('Tarjetas de Video'), image: IMG.gpu,
      rating: 4.6, reviews: 87,
      description: 'RTX 4070 Super con 12GB GDDR6X. El punto dulce para gaming 1440p con ray tracing activado.',
      specs: ['12GB GDDR6X', 'Ada Lovelace', 'PCIe 4.0', '220W TDP'],
    },
    {
      name: 'AMD Radeon RX 7700 XT 12GB',
      brand: 'PowerColor', price: 379.99, stock: 18,
      categoryId: cat('Tarjetas de Video'), image: IMG.gpu,
      rating: 4.4, reviews: 56,
      description: 'GPU AMD de gama media-alta con 12GB GDDR6. Excelente para 1440p y muy eficiente energéticamente.',
      specs: ['12GB GDDR6', 'RDNA 3', 'PCIe 4.0', '245W TDP'],
    },
    {
      name: 'NVIDIA GeForce RTX 4060 Ti 16GB',
      brand: 'Palit', price: 449.99, stock: 22,
      categoryId: cat('Tarjetas de Video'), image: IMG.gpu,
      rating: 4.3, reviews: 72,
      description: 'RTX 4060 Ti con 16GB de VRAM para gaming 1080p y 1440p con DLSS 3.',
      specs: ['16GB GDDR6', 'Ada Lovelace', 'PCIe 4.0', '165W TDP'],
    },
    {
      name: 'AMD Radeon RX 7600 8GB',
      brand: 'XFX', price: 269.99, stock: 30,
      categoryId: cat('Tarjetas de Video'), image: IMG.gpu,
      rating: 4.2, reviews: 98,
      description: 'GPU entry-level con 8GB GDDR6. La opción más asequible para gaming 1080p con buen rendimiento.',
      specs: ['8GB GDDR6', 'RDNA 3', 'PCIe 4.0', '165W TDP'],
    },
    {
      name: 'NVIDIA GeForce RTX 3060 12GB',
      brand: 'Gigabyte', price: 299.99, oldPrice: 379.99, stock: 16,
      categoryId: cat('Tarjetas de Video'), image: IMG.gpu,
      rating: 4.4, reviews: 215, badge: '-21%', badgeColor: 'bg-red-500',
      description: 'RTX 3060 de generación anterior con 12GB GDDR6. Excelente relación precio/rendimiento para 1080p.',
      specs: ['12GB GDDR6', 'Ampere', 'PCIe 4.0', '170W TDP'],
    },
    {
      name: 'Intel Arc A770 16GB',
      brand: 'Intel', price: 329.99, stock: 11,
      categoryId: cat('Tarjetas de Video'), image: IMG.gpu,
      rating: 4.0, reviews: 44,
      description: 'GPU Intel Arc con 16GB GDDR6 a un precio competitivo. Soporte XeSS para upscaling de IA.',
      specs: ['16GB GDDR6', 'Xe-HPG', 'PCIe 4.0', '225W TDP'],
    },
    {
      name: 'NVIDIA GeForce RTX 4060 8GB',
      brand: 'ASUS', price: 299.99, stock: 25,
      categoryId: cat('Tarjetas de Video'), image: IMG.gpu,
      rating: 4.3, reviews: 103,
      description: 'RTX 4060 compacta con DLSS 3 y Frame Generation. Eficiencia energética de última generación.',
      specs: ['8GB GDDR6', 'Ada Lovelace', 'PCIe 4.0', '115W TDP'],
    },
    {
      name: 'AMD Radeon RX 6700 XT 12GB',
      brand: 'Sapphire', price: 299.99, oldPrice: 349.99, stock: 9,
      categoryId: cat('Tarjetas de Video'), image: IMG.gpu,
      rating: 4.3, reviews: 167, badge: '-14%', badgeColor: 'bg-red-500',
      description: 'RX 6700 XT con 12GB GDDR6. Generación anterior AMD con excelente soporte para 1440p.',
      specs: ['12GB GDDR6', 'RDNA 2', 'PCIe 4.0', '230W TDP'],
    },
    {
      name: 'NVIDIA GeForce RTX 3080 10GB',
      brand: 'MSI', price: 599.99, oldPrice: 799.99, stock: 5,
      categoryId: cat('Tarjetas de Video'), image: IMG.gpu,
      rating: 4.7, reviews: 312, badge: '-25%', badgeColor: 'bg-red-500',
      description: 'RTX 3080 de alto rendimiento Ampere. Excelente para 4K a precio reducido.',
      specs: ['10GB GDDR6X', 'Ampere', 'PCIe 4.0', '320W TDP'],
    },

    // ══════════════════════════════════════════════════════════════════════
    // PROCESADORES (8)
    // ══════════════════════════════════════════════════════════════════════
    {
      name: 'Intel Core i7-14700K',
      brand: 'Intel', price: 409.99, stock: 18,
      categoryId: cat('Procesadores'), image: IMG.cpu,
      rating: 4.8, reviews: 76, badge: 'NEW', badgeColor: 'bg-primary',
      description: 'Core i7 de 20 núcleos con hasta 5.6 GHz de boost. El equilibrio perfecto entre precio y rendimiento para gaming y multitarea.',
      specs: ['20 Núcleos (8P+12E)', '5.6 GHz Boost', 'LGA1700', '125W TDP'],
    },
    {
      name: 'AMD Ryzen 7 7800X3D',
      brand: 'AMD', price: 449.99, stock: 12,
      categoryId: cat('Procesadores'), image: IMG.cpu,
      rating: 5.0, reviews: 198, badge: 'BEST', badgeColor: 'bg-green-500',
      description: 'El mejor procesador gaming del mundo con 3D V-Cache. Bate a CPUs más caras en todos los juegos.',
      specs: ['8 Núcleos / 16 Hilos', '5.0 GHz Boost', 'AM5', '120W TDP'],
    },
    {
      name: 'Intel Core i5-13600K',
      brand: 'Intel', price: 279.99, oldPrice: 319.99, stock: 22,
      categoryId: cat('Procesadores'), image: IMG.cpu,
      rating: 4.7, reviews: 231, badge: '-12%', badgeColor: 'bg-red-500',
      description: 'Core i5 de 14 núcleos de generación anterior. Sigue siendo uno de los mejores mid-range del mercado.',
      specs: ['14 Núcleos (6P+8E)', '5.1 GHz Boost', 'LGA1700', '125W TDP'],
    },
    {
      name: 'AMD Ryzen 5 7500F',
      brand: 'AMD', price: 179.99, stock: 28,
      categoryId: cat('Procesadores'), image: IMG.cpu,
      rating: 4.5, reviews: 89,
      description: 'Ryzen 5 sin gráficos integrados, ideal para builds gaming con GPU dedicada. Excelente precio.',
      specs: ['6 Núcleos / 12 Hilos', '5.0 GHz Boost', 'AM5', '65W TDP'],
    },
    {
      name: 'Intel Core i9-13900K',
      brand: 'Intel', price: 549.99, oldPrice: 699.99, stock: 6,
      categoryId: cat('Procesadores'), image: IMG.cpu,
      rating: 4.8, reviews: 143, badge: '-21%', badgeColor: 'bg-red-500',
      description: 'Core i9 de generación anterior con 24 núcleos. Potencia extrema para workstation y gaming.',
      specs: ['24 Núcleos (8P+16E)', '5.8 GHz Boost', 'LGA1700', '125W TDP'],
    },
    {
      name: 'AMD Ryzen 9 7900X',
      brand: 'AMD', price: 399.99, oldPrice: 499.99, stock: 10,
      categoryId: cat('Procesadores'), image: IMG.cpu,
      rating: 4.6, reviews: 67, badge: '-20%', badgeColor: 'bg-red-500',
      description: 'Ryzen 9 de 12 núcleos con arquitectura Zen 4. Alta frecuencia y eficiencia para contenido creativo.',
      specs: ['12 Núcleos / 24 Hilos', '5.6 GHz Boost', 'AM5', '170W TDP'],
    },
    {
      name: 'AMD Ryzen 5 5600X',
      brand: 'AMD', price: 149.99, oldPrice: 299.99, stock: 35,
      categoryId: cat('Procesadores'), image: IMG.cpu,
      rating: 4.7, reviews: 445, badge: '-50%', badgeColor: 'bg-red-500',
      description: 'El Ryzen 5 5600X sigue siendo una opción sólida para gaming en 2024 gracias a su precio reducido.',
      specs: ['6 Núcleos / 12 Hilos', '4.6 GHz Boost', 'AM4', '65W TDP'],
    },
    {
      name: 'Intel Core i3-14100F',
      brand: 'Intel', price: 109.99, stock: 40,
      categoryId: cat('Procesadores'), image: IMG.cpu,
      rating: 4.3, reviews: 122,
      description: 'Core i3 budget con 4 núcleos. La opción más económica para un PC gaming funcional.',
      specs: ['4 Núcleos / 8 Hilos', '4.7 GHz Boost', 'LGA1700', '58W TDP'],
    },

    // ══════════════════════════════════════════════════════════════════════
    // MEMORIAS RAM (8)
    // ══════════════════════════════════════════════════════════════════════
    {
      name: 'G.Skill Ripjaws S5 64GB DDR5',
      brand: 'G.Skill', price: 219.99, stock: 12,
      categoryId: cat('Memorias RAM'), image: IMG.ram,
      rating: 4.6, reviews: 48,
      description: 'Kit DDR5 de 64GB a 6000MHz con perfil XMP 3.0. Sin RGB para mantener temperaturas bajas.',
      specs: ['64GB (2×32)', 'DDR5-6000', 'CL36', 'Sin RGB'],
    },
    {
      name: 'Corsair Vengeance LPX 32GB DDR4',
      brand: 'Corsair', price: 74.99, stock: 45,
      categoryId: cat('Memorias RAM'), image: IMG.ram,
      rating: 4.8, reviews: 567,
      description: 'El kit DDR4 más vendido. Perfil bajo, compatible con cualquier plataforma DDR4 e ideal para AMD y Intel.',
      specs: ['32GB (2×16)', 'DDR4-3200', 'CL16', 'Sin RGB'],
    },
    {
      name: 'TeamGroup T-Force Delta 32GB DDR5',
      brand: 'TeamGroup', price: 139.99, stock: 20,
      categoryId: cat('Memorias RAM'), image: IMG.ram,
      rating: 4.5, reviews: 34,
      description: 'RAM DDR5 con RGB de gran efecto visual y velocidad DDR5-6400. Perfecto para builds con estética.',
      specs: ['32GB (2×16)', 'DDR5-6400', 'CL40', 'RGB'],
    },
    {
      name: 'Crucial Pro 32GB DDR5',
      brand: 'Crucial', price: 109.99, stock: 30,
      categoryId: cat('Memorias RAM'), image: IMG.ram,
      rating: 4.5, reviews: 78,
      description: 'DDR5 confiable de Crucial con compatibilidad Intel XMP 3.0 y AMD EXPO.',
      specs: ['32GB (2×16)', 'DDR5-5600', 'CL46', 'Sin RGB'],
    },
    {
      name: 'G.Skill Trident Z Neo 32GB DDR4',
      brand: 'G.Skill', price: 89.99, stock: 25,
      categoryId: cat('Memorias RAM'), image: IMG.ram,
      rating: 4.7, reviews: 189,
      description: 'RAM DDR4 optimizada para plataformas AMD Ryzen con velocidades hasta DDR4-3600.',
      specs: ['32GB (2×16)', 'DDR4-3600', 'CL16', 'RGB'],
    },
    {
      name: 'Corsair Dominator Titanium 32GB DDR5',
      brand: 'Corsair', price: 179.99, stock: 8,
      categoryId: cat('Memorias RAM'), image: IMG.ram,
      rating: 4.9, reviews: 22, badge: 'NEW', badgeColor: 'bg-primary',
      description: 'La nueva línea Dominator Titanium con aluminio CNC mecanizado y DDR5-7200 para entusiastas.',
      specs: ['32GB (2×16)', 'DDR5-7200', 'CL34', 'RGB iCUE'],
    },
    {
      name: 'Kingston Fury Beast 32GB DDR5',
      brand: 'Kingston', price: 119.99, stock: 22,
      categoryId: cat('Memorias RAM'), image: IMG.ram,
      rating: 4.5, reviews: 91,
      description: 'RAM DDR5 de Kingston con soporte Intel XMP 3.0. Sencilla, confiable y sin complicaciones.',
      specs: ['32GB (2×16)', 'DDR5-5200', 'CL40', 'Sin RGB'],
    },
    {
      name: 'Patriot Viper Steel 16GB DDR4',
      brand: 'Patriot', price: 44.99, stock: 50,
      categoryId: cat('Memorias RAM'), image: IMG.ram,
      rating: 4.4, reviews: 203,
      description: 'RAM DDR4 budget de 16GB. La opción más económica para actualizar cualquier PC.',
      specs: ['16GB (2×8)', 'DDR4-3200', 'CL16', 'Sin RGB'],
    },

    // ══════════════════════════════════════════════════════════════════════
    // ALMACENAMIENTO (8)
    // ══════════════════════════════════════════════════════════════════════
    {
      name: 'Crucial T700 2TB PCIe 5.0',
      brand: 'Crucial', price: 219.99, stock: 10,
      categoryId: cat('Almacenamiento'), image: IMG.ssd,
      rating: 4.8, reviews: 54, badge: 'NEW', badgeColor: 'bg-primary',
      description: 'SSD PCIe 5.0 con velocidades de hasta 12,400 MB/s. La unidad más rápida disponible para consumidores.',
      specs: ['2TB', 'PCIe 5.0', '12,400 MB/s', 'NVMe M.2'],
    },
    {
      name: 'SK Hynix Platinum P41 2TB',
      brand: 'SK Hynix', price: 149.99, stock: 15,
      categoryId: cat('Almacenamiento'), image: IMG.ssd,
      rating: 4.9, reviews: 87,
      description: 'El SSD PCIe 4.0 con mejor eficiencia energética. Rendimiento constante y baja temperatura de operación.',
      specs: ['2TB', 'PCIe 4.0', '7,000 MB/s', 'NVMe M.2'],
    },
    {
      name: 'WD Blue SN580 1TB',
      brand: 'WD', price: 79.99, stock: 35,
      categoryId: cat('Almacenamiento'), image: IMG.ssd,
      rating: 4.6, reviews: 198,
      description: 'SSD NVMe económico con PCIe 4.0. La mejor relación precio/rendimiento para uso general.',
      specs: ['1TB', 'PCIe 4.0', '4,150 MB/s', 'NVMe M.2'],
    },
    {
      name: 'Kingston KC3000 4TB',
      brand: 'Kingston', price: 299.99, stock: 8,
      categoryId: cat('Almacenamiento'), image: IMG.ssd,
      rating: 4.5, reviews: 32,
      description: 'SSD NVMe de 4TB con PCIe 4.0 para máxima capacidad en un solo slot M.2.',
      specs: ['4TB', 'PCIe 4.0', '7,000 MB/s', 'NVMe M.2'],
    },
    {
      name: 'Seagate FireCuda 530 1TB',
      brand: 'Seagate', price: 109.99, stock: 20,
      categoryId: cat('Almacenamiento'), image: IMG.ssd,
      rating: 4.7, reviews: 145,
      description: 'SSD gaming PCIe 4.0 optimizado para PS5 y PC. Con heatsink opcional.',
      specs: ['1TB', 'PCIe 4.0', '7,300 MB/s', 'NVMe M.2'],
    },
    {
      name: 'Crucial MX500 2TB SATA',
      brand: 'Crucial', price: 89.99, stock: 30,
      categoryId: cat('Almacenamiento'), image: IMG.ssd,
      rating: 4.7, reviews: 412,
      description: 'SSD SATA confiable de 2TB para almacenamiento secundario o upgrade de laptop.',
      specs: ['2TB', 'SATA 6Gb/s', '560 MB/s', 'SSD 2.5"'],
    },
    {
      name: 'WD Red Plus 6TB NAS HDD',
      brand: 'WD', price: 149.99, stock: 12,
      categoryId: cat('Almacenamiento'), image: IMG.ssd,
      rating: 4.5, reviews: 89,
      description: 'HDD NAS de 6TB optimizado para sistemas de almacenamiento en red 24/7.',
      specs: ['6TB', 'SATA 6Gb/s', '190 MB/s', '5400 RPM'],
    },
    {
      name: 'Toshiba N300 8TB NAS',
      brand: 'Toshiba', price: 189.99, stock: 8,
      categoryId: cat('Almacenamiento'), image: IMG.ssd,
      rating: 4.4, reviews: 56,
      description: 'HDD NAS de 8TB para servidores domésticos y NAS con hasta 24 bahías.',
      specs: ['8TB', 'SATA 6Gb/s', '272 MB/s', '7200 RPM'],
    },

    // ══════════════════════════════════════════════════════════════════════
    // PLACAS MADRE (6)
    // ══════════════════════════════════════════════════════════════════════
    {
      name: 'MSI MAG B650 Tomahawk WiFi',
      brand: 'MSI', price: 219.99, stock: 14,
      categoryId: cat('Placas Madre'), image: IMG.mobo,
      rating: 4.7, reviews: 108,
      description: 'Placa AM5 con WiFi 6E y soporte DDR5. Excelente opción mid-range para Ryzen 7000.',
      specs: ['Socket AM5', 'DDR5', 'PCIe 5.0', 'ATX'],
    },
    {
      name: 'ASUS Prime B760-Plus D4',
      brand: 'ASUS', price: 149.99, stock: 20,
      categoryId: cat('Placas Madre'), image: IMG.mobo,
      rating: 4.4, reviews: 67,
      description: 'Placa LGA1700 con soporte DDR4 para builds económicas con Intel 12/13/14 gen.',
      specs: ['Socket LGA1700', 'DDR4', 'PCIe 4.0', 'ATX'],
    },
    {
      name: 'Gigabyte Z790 Aorus Master',
      brand: 'Gigabyte', price: 499.99, stock: 6,
      categoryId: cat('Placas Madre'), image: IMG.mobo,
      rating: 4.8, reviews: 45, badge: 'TOP', badgeColor: 'bg-amber-500',
      description: 'Placa Z790 de gama alta con PCIe 5.0 en M.2 y USB4. Para builds de alto rendimiento Intel.',
      specs: ['Socket LGA1700', 'DDR5', 'PCIe 5.0', 'E-ATX'],
    },
    {
      name: 'ASRock B550 Phantom Gaming 4',
      brand: 'ASRock', price: 99.99, oldPrice: 129.99, stock: 25,
      categoryId: cat('Placas Madre'), image: IMG.mobo,
      rating: 4.4, reviews: 134, badge: '-23%', badgeColor: 'bg-red-500',
      description: 'Placa AM4 económica con PCIe 4.0. Compatible con Ryzen 3000/5000.',
      specs: ['Socket AM4', 'DDR4', 'PCIe 4.0', 'ATX'],
    },
    {
      name: 'ASUS ROG Crosshair X670E Hero',
      brand: 'ASUS', price: 599.99, stock: 4,
      categoryId: cat('Placas Madre'), image: IMG.mobo,
      rating: 4.9, reviews: 28,
      description: 'Placa ROG flagship para AM5 con capacidades overclock extremas y conectividad completa.',
      specs: ['Socket AM5', 'DDR5', 'PCIe 5.0', 'ATX'],
    },
    {
      name: 'MSI B450 Tomahawk Max II',
      brand: 'MSI', price: 119.99, stock: 18,
      categoryId: cat('Placas Madre'), image: IMG.mobo,
      rating: 4.6, reviews: 256,
      description: 'La placa AM4 más popular del mercado. Excelente VRM y soporte completo para Ryzen 5000.',
      specs: ['Socket AM4', 'DDR4', 'PCIe 3.0', 'ATX'],
    },

    // ══════════════════════════════════════════════════════════════════════
    // GABINETES (6)
    // ══════════════════════════════════════════════════════════════════════
    {
      name: 'Corsair 4000D Airflow',
      brand: 'Corsair', price: 104.99, stock: 15,
      categoryId: cat('Gabinetes'), image: IMG.case_,
      rating: 4.8, reviews: 378,
      description: 'Gabinete Mid-Tower con panel frontal tipo malla para máximo airflow. El más popular de Corsair.',
      specs: ['Mid-Tower', 'Malla frontal', '360mm rad max', 'USB-C'],
    },
    {
      name: 'be quiet! Pure Base 500DX',
      brand: 'be quiet!', price: 114.99, stock: 10,
      categoryId: cat('Gabinetes'), image: IMG.case_,
      rating: 4.7, reviews: 145,
      description: 'Gabinete silencioso con ventilación inteligente y paneles insonorizados. Ideal para builds silenciosas.',
      specs: ['Mid-Tower', 'Insonorizado', '360mm rad max', 'ARGB'],
    },
    {
      name: 'Phanteks Eclipse P400A',
      brand: 'Phanteks', price: 89.99, stock: 20,
      categoryId: cat('Gabinetes'), image: IMG.case_,
      rating: 4.6, reviews: 234,
      description: 'Gabinete de alto airflow con panel frontal de malla y excelente gestión de cables.',
      specs: ['Mid-Tower', 'Malla frontal', '420mm GPU max', 'ARGB'],
    },
    {
      name: 'Cooler Master HAF 700 EVO',
      brand: 'Cooler Master', price: 329.99, stock: 4,
      categoryId: cat('Gabinetes'), image: IMG.case_,
      rating: 4.5, reviews: 32,
      description: 'Full-Tower premium con pantalla LCD frontal, ventiladores de 200mm y soporte para builds extremas.',
      specs: ['Full-Tower', 'LCD frontal', '450mm GPU max', 'ARGB'],
    },
    {
      name: 'Thermaltake S100 TG Snow',
      brand: 'Thermaltake', price: 69.99, stock: 22,
      categoryId: cat('Gabinetes'), image: IMG.case_,
      rating: 4.3, reviews: 87,
      description: 'Gabinete compacto Micro-ATX con panel de vidrio templado. La opción budget más elegante.',
      specs: ['Micro-ATX', 'Vidrio templado', '320mm GPU max', 'USB 3.0'],
    },
    {
      name: 'Fractal Design Pop Air RGB',
      brand: 'Fractal', price: 99.99, stock: 13,
      categoryId: cat('Gabinetes'), image: IMG.case_,
      rating: 4.5, reviews: 76,
      description: 'Gabinete con diseño moderno y tres ventiladores ARGB incluidos. Gran relación calidad/precio.',
      specs: ['Mid-Tower', 'Malla frontal', '431mm GPU max', '3×ARGB incluidos'],
    },

    // ══════════════════════════════════════════════════════════════════════
    // FUENTES DE PODER (5)
    // ══════════════════════════════════════════════════════════════════════
    {
      name: 'be quiet! Dark Power 13 1000W',
      brand: 'be quiet!', price: 249.99, stock: 6,
      categoryId: cat('Fuentes de Poder'), image: IMG.psu,
      rating: 4.9, reviews: 34, badge: 'TOP', badgeColor: 'bg-amber-500',
      description: 'Fuente 80 Plus Titanium ultra silenciosa. El estándar de calidad premium en fuentes de poder.',
      specs: ['1000W', '80+ Titanium', 'Full Modular', 'ATX 3.0'],
    },
    {
      name: 'Corsair HX1200 Platinum',
      brand: 'Corsair', price: 219.99, stock: 8,
      categoryId: cat('Fuentes de Poder'), image: IMG.psu,
      rating: 4.8, reviews: 67,
      description: 'Fuente 1200W 80 Plus Platinum full modular para builds con múltiples GPUs o overclocking extremo.',
      specs: ['1200W', '80+ Platinum', 'Full Modular', 'ATX'],
    },
    {
      name: 'NZXT C750 Gold',
      brand: 'NZXT', price: 119.99, stock: 16,
      categoryId: cat('Fuentes de Poder'), image: IMG.psu,
      rating: 4.6, reviews: 89,
      description: 'Fuente 750W 80 Plus Gold full modular con cables tipo cable sleeved. Diseño limpio.',
      specs: ['750W', '80+ Gold', 'Full Modular', 'ATX 3.0'],
    },
    {
      name: 'Fractal Design Ion+ 2 Platinum 860W',
      brand: 'Fractal', price: 159.99, stock: 10,
      categoryId: cat('Fuentes de Poder'), image: IMG.psu,
      rating: 4.7, reviews: 45,
      description: 'Fuente Platinum silenciosa con ventilador adaptativo. Modo pasivo para operación silenciosa.',
      specs: ['860W', '80+ Platinum', 'Full Modular', 'ATX'],
    },
    {
      name: 'Thermaltake Toughpower GF3 750W',
      brand: 'Thermaltake', price: 99.99, stock: 20,
      categoryId: cat('Fuentes de Poder'), image: IMG.psu,
      rating: 4.4, reviews: 56,
      description: 'Fuente 750W Gold con soporte PCIe 5.0 nativo y cable 16-pin incluido.',
      specs: ['750W', '80+ Gold', 'Semi Modular', 'ATX 3.0'],
    },

    // ══════════════════════════════════════════════════════════════════════
    // ENFRIAMIENTO (5)
    // ══════════════════════════════════════════════════════════════════════
    {
      name: 'Arctic Liquid Freezer II 360',
      brand: 'Arctic', price: 89.99, stock: 14,
      categoryId: cat('Enfriamiento'), image: IMG.cooling,
      rating: 4.8, reviews: 267,
      description: 'El AIO 360mm con mejor relación calidad/precio del mercado. Rendimiento que compite con AIOs del doble de precio.',
      specs: ['360mm AIO', '3×120mm', 'Intel + AMD', 'Bomba integrada VRM'],
    },
    {
      name: 'Thermalright Peerless Assassin 120 SE',
      brand: 'Thermalright', price: 44.99, stock: 30,
      categoryId: cat('Enfriamiento'), image: IMG.cooling,
      rating: 4.9, reviews: 512,
      description: 'El disipador de aire budget más recomendado. Rinde como disipadores 3× más caros.',
      specs: ['Dual Torre', '2×120mm', 'Intel + AMD', 'Sin RGB'],
    },
    {
      name: 'Lian Li Galahad II Trinity 360',
      brand: 'Lian Li', price: 159.99, stock: 8,
      categoryId: cat('Enfriamiento'), image: IMG.cooling,
      rating: 4.7, reviews: 43,
      description: 'AIO 360mm con tres ventiladores ARGB personalizables y bloque de bomba iluminado.',
      specs: ['360mm AIO', '3×120mm ARGB', 'Intel + AMD', 'LCD Display'],
    },
    {
      name: 'Scythe Fuma 3',
      brand: 'Scythe', price: 64.99, stock: 16,
      categoryId: cat('Enfriamiento'), image: IMG.cooling,
      rating: 4.7, reviews: 78,
      description: 'Disipador asimétrico japonés con excelente compatibilidad con RAM y gran rendimiento térmico.',
      specs: ['Dual Torre', '2×120mm', 'Intel + AMD', 'Sin RGB'],
    },
    {
      name: 'EKWB EK-AIO Elite 360 D-RGB',
      brand: 'EKWB', price: 179.99, stock: 6,
      categoryId: cat('Enfriamiento'), image: IMG.cooling,
      rating: 4.6, reviews: 34,
      description: 'AIO premium de EKWB con tecnología de refrigeración líquida de alta gama para overclockers.',
      specs: ['360mm AIO', '3×120mm D-RGB', 'Intel + AMD', 'Bloque cobre puro'],
    },

    // ══════════════════════════════════════════════════════════════════════
    // PERIFÉRICOS (8)
    // ══════════════════════════════════════════════════════════════════════
    {
      name: 'Razer DeathAdder V3 Pro',
      brand: 'Razer', price: 149.99, stock: 18,
      categoryId: cat('Periféricos'), image: IMG.peri,
      rating: 4.7, reviews: 234,
      description: 'Ratón ergonómico inalámbrico con sensor Focus Pro 30K. El favorito de los gamers FPS profesionales.',
      specs: ['30,000 DPI', 'Inalámbrico HyperSpeed', '63g', 'Focus Pro 30K'],
    },
    {
      name: 'SteelSeries Apex Pro TKL',
      brand: 'SteelSeries', price: 179.99, stock: 12,
      categoryId: cat('Periféricos'), image: IMG.peri,
      rating: 4.6, reviews: 156,
      description: 'Teclado TKL con switches OmniPoint ajustables. El primer teclado con actuación por tecla personalizable.',
      specs: ['TKL', 'Switches OmniPoint', 'OLED Display', 'RGB'],
    },
    {
      name: 'HyperX Cloud Alpha Wireless',
      brand: 'HyperX', price: 199.99, stock: 15,
      categoryId: cat('Periféricos'), image: IMG.peri,
      rating: 4.8, reviews: 189,
      description: 'Auricular gaming inalámbrico con hasta 300 horas de batería. El headset inalámbrico con más autonomía.',
      specs: ['Inalámbrico 2.4GHz', '300h batería', '53mm drivers', 'Micrófono desmontable'],
    },
    {
      name: 'Corsair K70 RGB MK.2',
      brand: 'Corsair', price: 109.99, oldPrice: 159.99, stock: 20,
      categoryId: cat('Periféricos'), image: IMG.peri,
      rating: 4.7, reviews: 412, badge: '-31%', badgeColor: 'bg-red-500',
      description: 'Teclado mecánico full-size con reposamuñecas magnético y switches Cherry MX.',
      specs: ['Full-Size', 'Cherry MX Red', 'Aluminio', 'RGB por tecla'],
    },
    {
      name: 'Logitech G502 X Plus',
      brand: 'Logitech', price: 159.99, stock: 22,
      categoryId: cat('Periféricos'), image: IMG.peri,
      rating: 4.6, reviews: 143,
      description: 'El G502 inalámbrico con LIGHTFORCE switches ópticos y sensor HERO 25K.',
      specs: ['25,600 DPI', 'Inalámbrico', '106g', 'LIGHTFORCE Switches'],
    },
    {
      name: 'ASUS ROG Harpe Ace Aim Lab Edition',
      brand: 'ASUS', price: 109.99, stock: 17,
      categoryId: cat('Periféricos'), image: IMG.peri,
      rating: 4.5, reviews: 67,
      description: 'Ratón ultra ligero de 54g con sensor ROG AimPoint 36K y integración con Aim Lab.',
      specs: ['36,000 DPI', 'Inalámbrico', '54g', 'AimPoint 36K'],
    },
    {
      name: 'Razer BlackShark V2 Pro 2023',
      brand: 'Razer', price: 179.99, stock: 13,
      categoryId: cat('Periféricos'), image: IMG.peri,
      rating: 4.7, reviews: 98,
      description: 'Auricular gaming inalámbrico con audio THX Spatial y micrófono con cancelación de ruido IA.',
      specs: ['Inalámbrico 2.4GHz', '70h batería', 'THX Spatial', 'Micro HyperClear'],
    },
    {
      name: 'Keychron Q1 Pro',
      brand: 'Keychron', price: 199.99, stock: 9,
      categoryId: cat('Periféricos'), image: IMG.peri,
      rating: 4.8, reviews: 76,
      description: 'Teclado mecánico 75% inalámbrico con junta gasket, switches Gateron y construcción de aluminio CNC.',
      specs: ['75%', 'Inalámbrico BT/2.4G', 'Aluminio CNC', 'Gasket Mount'],
    },
  ]

  // Insertar en lotes para no sobrecargar la BD
  const BATCH = 10
  let total = 0
  for (let i = 0; i < newProducts.length; i += BATCH) {
    const batch = newProducts.slice(i, i + BATCH)
    const result = await prisma.product.createMany({ data: batch })
    total += result.count
    console.log(`  ✓ Lote ${Math.floor(i / BATCH) + 1}: ${result.count} productos insertados`)
  }

  console.log(`\n🎉 Seed adicional completado: ${total} productos nuevos agregados.`)
  console.log(`📊 Total esperado en catálogo: ${total + 32} productos.`)
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
