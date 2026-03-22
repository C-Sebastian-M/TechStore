/**
 * SEED — Pobla la base de datos con datos iniciales
 * Ejecutar: npm run db:seed
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ── 1. Limpiar tablas (en orden para respetar FK) ─────────────────────────
  await prisma.favorite.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()
  console.log('🗑  Tablas limpiadas')

  // ── 2. Categorías ─────────────────────────────────────────────────────────
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Tarjetas de Video', slug: 'tarjetas-de-video' },
      { name: 'Procesadores',      slug: 'procesadores'      },
      { name: 'Memorias RAM',      slug: 'memorias-ram'      },
      { name: 'Almacenamiento',    slug: 'almacenamiento'    },
      { name: 'Periféricos',       slug: 'perifericos'       },
      { name: 'Placas Madre',      slug: 'placas-madre'      },
      { name: 'Gabinetes',         slug: 'gabinetes'         },
      { name: 'Fuentes de Poder',  slug: 'fuentes-de-poder'  },
      { name: 'Enfriamiento',      slug: 'enfriamiento'      },
    ]
  })
  console.log(`✅ ${categories.count} categorías creadas`)

  // Obtener IDs de categorías para usarlos en productos
  const cats = await prisma.category.findMany()
  const cat = (name) => cats.find(c => c.name === name)?.id

  // ── 3. Productos del catálogo principal ──────────────────────────────────
  const products = await prisma.product.createMany({
    data: [
      {
        name:        'Logitech G Pro X Superlight Wireless',
        brand:       'Logitech',
        description: 'El ratón gaming inalámbrico más ligero de Logitech. Diseñado para esports profesionales con sensor HERO 25K y hasta 70 horas de batería.',
        price:       127.49,
        oldPrice:    149.99,
        stock:       25,
        badge:       '-15%',
        badgeColor:  'bg-red-500',
        rating:      4.8,
        reviews:     120,
        specs:       ['25,600 DPI', 'Inalámbrico', '61g', 'HERO 25K'],
        image:       'https://lh3.googleusercontent.com/aida-public/AB6AXuAeuaghldg-UAbRlGLc3Gdt77dhXMKENdIm5kpSh5q3xrFaWeq3fhVe2A9af_Ynm3mfLjaQ2Q8dIkccby2Ej4PiOK4fbJAQaRZqBcrBNeMeyVerEJUzR6ides8zoT8_qZjCUX6USH7RQO80VPMZar030zsgwXOyMTaIXHFWmi9D79b6AN7ipvvUM-peQDKuKxpizqow5FPBfs9TBspT72clSODAy5EdgvOWxxwaLaWuxMrFoFRWtGfJLAw9DNaAHAa96pB2xGpIRCk',
        categoryId:  cat('Periféricos'),
      },
      {
        name:        'ASUS ROG Strix GeForce RTX 4080',
        brand:       'ASUS',
        description: 'La RTX 4080 más potente del mercado con diseño ROG Strix triple ventilador, overclocking de fábrica y RGB Aura Sync.',
        price:       1199.99,
        stock:       8,
        badge:       'NEW',
        badgeColor:  'bg-primary',
        rating:      5.0,
        reviews:     42,
        specs:       ['16GB GDDR6X', 'PCIe 4.0', 'Triple Fan', 'ROG Boost'],
        image:       'https://lh3.googleusercontent.com/aida-public/AB6AXuDez2cTH504ZbedIP89OX4kvSjiKG0j8CvP5mWF4lveEHDNs9FpMyDVDG6yz29EFDDysAvKNPPy5M_aSz7D2Q9wqYH4x3ixPlP2LFMEXwg3Zl6PCNBCOkmWbbWrtqbvE_PWJi4Kni1FHbQA0yCqYLahsBJ2MVe2OuJhwiUOiitnpnEmBM9H4jzVv23N0K96KvnPzztUt8APu-FkKMcNtBEtRu_O5ZO60SQJmPVsdkGOSDJY0nPHV48yG40DTbEpWyChUq8NNM',
        categoryId:  cat('Tarjetas de Video'),
      },
      {
        name:        'AMD Ryzen 9 7900X Procesador',
        brand:       'AMD',
        description: 'Procesador de alto rendimiento con arquitectura Zen 4, ideal para gaming y creación de contenido.',
        price:       449.99,
        oldPrice:    549.99,
        stock:       15,
        badge:       '-18%',
        badgeColor:  'bg-red-500',
        rating:      4.7,
        reviews:     89,
        specs:       ['12 Núcleos', '24 Hilos', '5.6GHz Boost', 'Socket AM5'],
        image:       'https://lh3.googleusercontent.com/aida-public/AB6AXuCfpPqUS-VWtNeLj-pHqEcY627y8fGKamQLzObjM4nss6W37692bIeT7ykVR5n39B8p8QY1b1wdqDxbpkYZxBa6_DJBGAHcb9aGbNrfqEv5waB25xTXfXNiQjpyTqifr1R-XQjOTB50lwiaTKnbIXp98JerqmzrSaKaZLLHrpAz1Wn_L7B06ZtGBlVVIXD8JK1v1pVVs4Bzk12SKebpuwL55F5MBEAIv5C544Ce3v-2ygPfzPMk8W6j9RrgrckhsEXi9WDr4bayf2A',
        categoryId:  cat('Procesadores'),
      },
      {
        name:        'Corsair Vengeance RGB 32GB DDR5',
        brand:       'Corsair',
        description: 'Kit de memorias DDR5 de alta velocidad con iluminación RGB personalizable y perfil XMP 3.0.',
        price:       129.99,
        stock:       30,
        rating:      4.6,
        reviews:     203,
        specs:       ['32GB (2x16)', 'DDR5-6000', 'CL36', 'RGB'],
        image:       'https://lh3.googleusercontent.com/aida-public/AB6AXuAkgMHofGtDL-ftPuQvkkcjrRrYUPW_Ly7I2b4-2CYMiEVIpU1RR13X-3O_F1HaxFptl913a84xxs2j747KW9HhK-OS6h0kHpbBN5D5OWZO7ixKXwDRnpiSUbcgoo7ExaSpreoFKxl0F2qmUVvit6VVYNpP15WF4DdD21OFU5vRH54BuFQCu-RJNXxU8uY1553QAIWDzyyUlwe508htqWcN5P4NsTTBlJ6MkMPRYl5_8XEQ-JQ8G-Pslh6AvlvbfLLh5vi7XdMw034',
        categoryId:  cat('Memorias RAM'),
      },
      {
        name:        'Samsung 990 PRO PCIe 4.0 NVMe SSD 2TB',
        brand:       'Samsung',
        description: 'SSD NVMe de última generación con velocidades de lectura de hasta 7,450 MB/s. Perfecto para gaming y productividad.',
        price:       169.99,
        stock:       20,
        rating:      5.0,
        reviews:     312,
        specs:       ['2TB', 'PCIe 4.0', '7,450 MB/s', 'NVMe M.2'],
        image:       'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoRqE_md72jxMheVEObylFGVhckaq7UAKWCoGeOO0GyWLjsZ_QgIg9XftvbQRaB-3S84HE1eHvlvYiXH3A7zHNsk3jTeHSJUdifbBJa8x4cacGzXOAdeZ9OJv7jSAw1x4EHEdEdTVdTyXYND4E1mv4OiUWoywHAEnKTod6c7IL1IcsV7s0Kb5k7XwV3vTGmkHnaFMqT3rh3ayMR6sS6NmYBZBCw8EV1kyKChd1ktefM5agFe0jBZVpGTwCOcPLtpO-rTKZWMwZB8',
        categoryId:  cat('Almacenamiento'),
      },
      {
        name:        'NVIDIA GeForce RTX 4090 Gaming X Trio 24GB',
        brand:       'MSI',
        description: 'La GPU más potente del mercado con 24GB GDDR6X. Rendimiento extremo para gaming 4K, ray tracing y creación de contenido.',
        price:       1699.00,
        oldPrice:    1899.00,
        stock:       5,
        badge:       'HOT',
        badgeColor:  'bg-orange-500',
        rating:      4.9,
        reviews:     178,
        specs:       ['24GB VRAM', 'PCIe 4.0', 'Triple Fan', 'Ada Lovelace'],
        image:       'https://lh3.googleusercontent.com/aida-public/AB6AXuBZNISJLM71aWLgsGizZRcVTh5jpc2hgqTz54IbFpSulljY6-dHs9R1Q4Inv-dqJqQ6nXygnuN0pN83PLw9L3nB_uQgp8YtHhFXedrTZD0hY_YTqqbVIFLox6rjij5-dDZvIZDZbiRzENAVa7uDoGbnem-yOOsLskpuhIoSIa-vb-C0DXuPSApUK4E_pGU-cSkBBgMeyu4e-mLsQs4odDBk0IwKllHzDhCxsHzNweSL5ANHbmSGaj3VNfjxRNI4t2FfXGXRhD3Smrw',
        categoryId:  cat('Tarjetas de Video'),
      },
    ]
  })
  console.log(`✅ ${products.count} productos del cat\u00e1logo creados`)

  // ── 4. Componentes del configurador ─────────────────────────────────────
  // Bug 15 — estos 25 productos estaban en configurator.js pero NO en la BD.
  // Ahora se insertan con sus IDs ficticios como slug/sku para referencia,
  // y el stock se marca como 0 (disponible solo en configurador).
  const configuratorProducts = await prisma.product.createMany({
    data: [
      // CPU
      { name: 'Intel Core i9-14900K',              brand: 'Intel',    price: 589.00, stock: 10, categoryId: cat('Procesadores'),    specs: ['24 N\u00facleos (8P+16E)', '6.0 GHz Boost', 'LGA1700', '125W TDP'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArQDiOIUSoxoDpfJBVRDnXuRGsNGJEd-7H8wTz_paPVRZYbSJUA7PNdQcCcI2TZHmrxddxITt4P4OCcvT13DFLFs_gvvH3V8BcETyy1bSJOY6H3qK-C5-ddZOiGL65ydenkzqi6CH1ZCYNWNB8f9_siOgUAjDHk6j-bUeklvKfR4nIuv9skkw-90OSHNkBMJHvwxn72VbSXe6ZFMmdlLCXSM4IuFVLymXofMnUkx3ZY942OT4sigb5Lez_wZlEfOOo225_nrEuvHs', badge: 'TOP',  badgeColor: 'bg-amber-500', description: 'Procesador Intel de 24 n\u00facleos con hasta 6.0 GHz de boost. Ideal para gaming extremo y workstation.' },
      { name: 'AMD Ryzen 9 7950X3D',                brand: 'AMD',     price: 699.00, stock: 8,  categoryId: cat('Procesadores'),    specs: ['16 N\u00facleos / 32 Hilos', '5.7 GHz Boost', 'AM5', '120W TDP'],   image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfpPqUS-VWtNeLj-pHqEcY627y8fGKamQLzObjM4nss6W37692bIeT7ykVR5n39B8p8QY1b1wdqDxbpkYZxBa6_DJBGAHcb9aGbNrfqEv5waB25xTXfXNiQjpyTqifr1R-XQjOTB50lwiaTKnbIXp98JerqmzrSaKaZLLHrpAz1Wn_L7B06ZtGBlVVIXD8JK1v1pVVs4Bzk12SKebpuwL55F5MBEAIv5C544Ce3v-2ygPfzPMk8W6j9RrgrckhsEXi9WDr4bayf2A', badge: 'BEST', badgeColor: 'bg-green-500', description: 'El mejor procesador gaming del mercado con tecnolog\u00eda 3D V-Cache.' },
      { name: 'Intel Core i5-14600K',               brand: 'Intel',   price: 319.00, stock: 20, categoryId: cat('Procesadores'),    specs: ['14 N\u00facleos (6P+8E)', '5.3 GHz Boost', 'LGA1700', '125W TDP'],  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArQDiOIUSoxoDpfJBVRDnXuRGsNGJEd-7H8wTz_paPVRZYbSJUA7PNdQcCcI2TZHmrxddxITt4P4OCcvT13DFLFs_gvvH3V8BcETyy1bSJOY6H3qK-C5-ddZOiGL65ydenkzqi6CH1ZCYNWNB8f9_siOgUAjDHk6j-bUeklvKfR4nIuv9skkw-90OSHNkBMJHvwxn72VbSXe6ZFMmdlLCXSM4IuFVLymXofMnUkx3ZY942OT4sigb5Lez_wZlEfOOo225_nrEuvHs', description: 'Procesador mid-range con excelente relaci\u00f3n precio/rendimiento.' },
      { name: 'AMD Ryzen 5 7600X',                  brand: 'AMD',     price: 249.00, stock: 25, categoryId: cat('Procesadores'),    specs: ['6 N\u00facleos / 12 Hilos', '5.3 GHz Boost', 'AM5', '105W TDP'],    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfpPqUS-VWtNeLj-pHqEcY627y8fGKamQLzObjM4nss6W37692bIeT7ykVR5n39B8p8QY1b1wdqDxbpkYZxBa6_DJBGAHcb9aGbNrfqEv5waB25xTXfXNiQjpyTqifr1R-XQjOTB50lwiaTKnbIXp98JerqmzrSaKaZLLHrpAz1Wn_L7B06ZtGBlVVIXD8JK1v1pVVs4Bzk12SKebpuwL55F5MBEAIv5C544Ce3v-2ygPfzPMk8W6j9RrgrckhsEXi9WDr4bayf2A', description: 'CPU AM5 accesible con excelente rendimiento en gaming.' },
      // Placas Madre
      { name: 'ASUS ROG Maximus Z790 Hero',         brand: 'ASUS',    price: 629.99, stock: 5,  categoryId: cat('Placas Madre'),    specs: ['Socket LGA1700', 'DDR5', 'PCIe 5.0', 'ATX'],   image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr9nLtS3NaylNrqxHCCU2Bj9cXq7_jDTYnMaftRF-9_R6BG2s325xiUdNL_qauDMYrsp7MvQ8jRHFM8dDqL1mOAvdim1Z37J6OMbGQhljL7gf5RzFslhHseRXHn21_TQE2DMZPH6625uhD2-mXdgkjpxT9vBG18Tkp0tlK-b5cOvICtVWqt65NlqC-HiO2_W7jnCCc760okea9UJTuQ4SVdVbb7zApt8fYHBaHMrTfynQIxhPnsFmr7Nf9su5VeCMxnLvK2t12j4I', badge: 'TOP', badgeColor: 'bg-amber-500', description: 'Placa madre ROG de alto rendimiento para socket LGA1700 con soporte DDR5.' },
      { name: 'MSI MEG X670E ACE',                  brand: 'MSI',     price: 549.99, stock: 7,  categoryId: cat('Placas Madre'),    specs: ['Socket AM5', 'DDR5', 'PCIe 5.0', 'ATX'],       image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr9nLtS3NaylNrqxHCCU2Bj9cXq7_jDTYnMaftRF-9_R6BG2s325xiUdNL_qauDMYrsp7MvQ8jRHFM8dDqL1mOAvdim1Z37J6OMbGQhljL7gf5RzFslhHseRXHn21_TQE2DMZPH6625uhD2-mXdgkjpxT9vBG18Tkp0tlK-b5cOvICtVWqt65NlqC-HiO2_W7jnCCc760okea9UJTuQ4SVdVbb7zApt8fYHBaHMrTfynQIxhPnsFmr7Nf9su5VeCMxnLvK2t12j4I', description: 'Placa AM5 de gama alta para Ryzen 7000 con PCIe 5.0.' },
      { name: 'Gigabyte B760M DS3H',                brand: 'Gigabyte',price: 129.99, stock: 30, categoryId: cat('Placas Madre'),    specs: ['Socket LGA1700', 'DDR5', 'PCIe 4.0', 'mATX'],  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr9nLtS3NaylNrqxHCCU2Bj9cXq7_jDTYnMaftRF-9_R6BG2s325xiUdNL_qauDMYrsp7MvQ8jRHFM8dDqL1mOAvdim1Z37J6OMbGQhljL7gf5RzFslhHseRXHn21_TQE2DMZPH6625uhD2-mXdgkjpxT9vBG18Tkp0tlK-b5cOvICtVWqt65NlqC-HiO2_W7jnCCc760okea9UJTuQ4SVdVbb7zApt8fYHBaHMrTfynQIxhPnsFmr7Nf9su5VeCMxnLvK2t12j4I', description: 'Placa madre mATX econ\u00f3mica para Intel 12th/13th/14th gen.' },
      // RAM
      { name: 'Corsair Dominator Platinum 64GB DDR5',brand: 'Corsair', price: 289.99, stock: 10, categoryId: cat('Memorias RAM'),    specs: ['64GB (2\u00d732)', 'DDR5-6000', 'CL30', 'RGB'],  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkgMHofGtDL-ftPuQvkkcjrRrYUPW_Ly7I2b4-2CYMiEVIpU1RR13X-3O_F1HaxFptl913a84xxs2j747KW9HhK-OS6h0kHpbBN5D5OWZO7ixKXwDRnpiSUbcgoo7ExaSpreoFKxl0F2qmUVvit6VVYNpP15WF4DdD21OFU5vRH54BuFQCu-RJNXxU8uY1553QAIWDzyyUlwe508htqWcN5P4NsTTBlJ6MkMPRYl5_8XEQ-JQ8G-Pslh6AvlvbfLLh5vi7XdMw034', badge: 'TOP', badgeColor: 'bg-amber-500', description: 'Kit DDR5 de 64GB para workstations y entusiastas.' },
      { name: 'G.Skill Trident Z5 32GB DDR5',        brand: 'G.Skill', price: 159.99, stock: 15, categoryId: cat('Memorias RAM'),    specs: ['32GB (2\u00d716)', 'DDR5-6400', 'CL32', 'RGB'],  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkgMHofGtDL-ftPuQvkkcjrRrYUPW_Ly7I2b4-2CYMiEVIpU1RR13X-3O_F1HaxFptl913a84xxs2j747KW9HhK-OS6h0kHpbBN5D5OWZO7ixKXwDRnpiSUbcgoo7ExaSpreoFKxl0F2qmUVvit6VVYNpP15WF4DdD21OFU5vRH54BuFQCu-RJNXxU8uY1553QAIWDzyyUlwe508htqWcN5P4NsTTBlJ6MkMPRYl5_8XEQ-JQ8G-Pslh6AvlvbfLLh5vi7XdMw034', description: 'Memoria DDR5 de alta velocidad para gaming y creaci\u00f3n de contenido.' },
      { name: 'Kingston Fury Beast 16GB DDR4',        brand: 'Kingston',price: 59.99,  stock: 40, categoryId: cat('Memorias RAM'),    specs: ['16GB (2\u00d78)', 'DDR4-3200', 'CL16', 'Sin RGB'],image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkgMHofGtDL-ftPuQvkkcjrRrYUPW_Ly7I2b4-2CYMiEVIpU1RR13X-3O_F1HaxFptl913a84xxs2j747KW9HhK-OS6h0kHpbBN5D5OWZO7ixKXwDRnpiSUbcgoo7ExaSpreoFKxl0F2qmUVvit6VVYNpP15WF4DdD21OFU5vRH54BuFQCu-RJNXxU8uY1553QAIWDzyyUlwe508htqWcN5P4NsTTBlJ6MkMPRYl5_8XEQ-JQ8G-Pslh6AvlvbfLLh5vi7XdMw034', description: 'RAM DDR4 accesible con buen rendimiento para builds de presupuesto.' },
      // GPU
      { name: 'ASUS ROG Strix RTX 4090 24GB',       brand: 'ASUS',    price: 1999.99,stock: 3,  categoryId: cat('Tarjetas de Video'),specs: ['24GB GDDR6X', 'Ada Lovelace', 'PCIe 4.0', '450W TDP'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZNISJLM71aWLgsGizZRcVTh5jpc2hgqTz54IbFpSulljY6-dHs9R1Q4Inv-dqJqQ6nXygnuN0pN83PLw9L3nB_uQgp8YtHhFXedrTZD0hY_YTqqbVIFLox6rjij5-dDZvIZDZbiRzENAVa7uDoGbnem-yOOsLskpuhIoSIa-vb-C0DXuPSApUK4E_pGU-cSkBBgMeyu4e-mLsQs4odDBk0IwKllHzDhCxsHzNweSL5ANHbmSGaj3VNfjxRNI4t2FfXGXRhD3Smrw', badge: 'BEST', badgeColor: 'bg-green-500', description: 'La GPU m\u00e1s potente del mercado para 4K y ray tracing extremo.' },
      { name: 'MSI Gaming RTX 4080 Super 16GB',      brand: 'MSI',     price: 1099.99,stock: 6,  categoryId: cat('Tarjetas de Video'),specs: ['16GB GDDR6X', 'Ada Lovelace', 'PCIe 4.0', '320W TDP'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDez2cTH504ZbedIP89OX4kvSjiKG0j8CvP5mWF4lveEHDNs9FpMyDVDG6yz29EFDDysAvKNPPy5M_aSz7D2Q9wqYH4x3ixPlP2LFMEXwg3Zl6PCNBCOkmWbbWrtqbvE_PWJi4Kni1FHbQA0yCqYLahsBJ2MVe2OuJhwiUOiitnpnEmBM9H4jzVv23N0K96KvnPzztUt8APu-FkKMcNtBEtRu_O5ZO60SQJmPVsdkGOSDJY0nPHV48yG40DTbEpWyChUq8NNM', description: 'RTX 4080 Super con 16GB GDDR6X para gaming 4K fluido.' },
      { name: 'Sapphire Pulse RX 7800 XT 16GB',      brand: 'Sapphire',price: 499.99, stock: 12, categoryId: cat('Tarjetas de Video'),specs: ['16GB GDDR6', 'RDNA 3', 'PCIe 4.0', '263W TDP'],      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDez2cTH504ZbedIP89OX4kvSjiKG0j8CvP5mWF4lveEHDNs9FpMyDVDG6yz29EFDDysAvKNPPy5M_aSz7D2Q9wqYH4x3ixPlP2LFMEXwg3Zl6PCNBCOkmWbbWrtqbvE_PWJi4Kni1FHbQA0yCqYLahsBJ2MVe2OuJhwiUOiitnpnEmBM9H4jzVv23N0K96KvnPzztUt8APu-FkKMcNtBEtRu_O5ZO60SQJmPVsdkGOSDJY0nPHV48yG40DTbEpWyChUq8NNM', description: 'GPU AMD RDNA3 con excelente relaci\u00f3n calidad/precio para 1440p.' },
      { name: 'Gigabyte RTX 4070 Ti Super 16GB',     brand: 'Gigabyte',price: 799.99, stock: 9,  categoryId: cat('Tarjetas de Video'),specs: ['16GB GDDR6X', 'Ada Lovelace', 'PCIe 4.0', '285W TDP'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDez2cTH504ZbedIP89OX4kvSjiKG0j8CvP5mWF4lveEHDNs9FpMyDVDG6yz29EFDDysAvKNPPy5M_aSz7D2Q9wqYH4x3ixPlP2LFMEXwg3Zl6PCNBCOkmWbbWrtqbvE_PWJi4Kni1FHbQA0yCqYLahsBJ2MVe2OuJhwiUOiitnpnEmBM9H4jzVv23N0K96KvnPzztUt8APu-FkKMcNtBEtRu_O5ZO60SQJmPVsdkGOSDJY0nPHV48yG40DTbEpWyChUq8NNM', description: 'RTX 4070 Ti Super con 16GB para gaming de alto rendimiento.' },
      // Storage
      { name: 'Samsung 990 Pro 2TB NVMe',             brand: 'Samsung',  price: 169.99, stock: 15, categoryId: cat('Almacenamiento'),  specs: ['2TB', 'PCIe 4.0', '7,450 MB/s', 'NVMe M.2'],          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoRqE_md72jxMheVEObylFGVhckaq7UAKWCoGeOO0GyWLjsZ_QgIg9XftvbQRaB-3S84HE1eHvlvYiXH3A7zHNsk3jTeHSJUdifbBJa8x4cacGzXOAdeZ9OJv7jSAw1x4EHEdEdTVdTyXYND4E1mv4OiUWoywHAEnKTod6c7IL1IcsV7s0Kb5k7XwV3vTGmkHnaFMqT3rh3ayMR6sS6NmYBZBCw8EV1kyKChd1ktefM5agFe0jBZVpGTwCOcPLtpO-rTKZWMwZB8', badge: 'TOP', badgeColor: 'bg-amber-500', description: 'SSD NVMe de última generación con velocidades de hasta 7,450 MB/s. El favorito para builds gaming.' },
      { name: 'WD Black SN850X 1TB',                brand: 'WD',      price: 109.99, stock: 20, categoryId: cat('Almacenamiento'),  specs: ['1TB', 'PCIe 4.0', '7,300 MB/s', 'NVMe M.2'],          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoRqE_md72jxMheVEObylFGVhckaq7UAKWCoGeOO0GyWLjsZ_QgIg9XftvbQRaB-3S84HE1eHvlvYiXH3A7zHNsk3jTeHSJUdifbBJa8x4cacGzXOAdeZ9OJv7jSAw1x4EHEdEdTVdTyXYND4E1mv4OiUWoywHAEnKTod6c7IL1IcsV7s0Kb5k7XwV3vTGmkHnaFMqT3rh3ayMR6sS6NmYBZBCw8EV1kyKChd1ktefM5agFe0jBZVpGTwCOcPLtpO-rTKZWMwZB8', description: 'SSD NVMe 1TB de alto rendimiento para gaming.' },
      { name: 'Seagate Barracuda 4TB HDD',           brand: 'Seagate', price: 79.99,  stock: 25, categoryId: cat('Almacenamiento'),  specs: ['4TB', 'SATA 6Gb/s', '210 MB/s', '7200 RPM'],           image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoRqE_md72jxMheVEObylFGVhckaq7UAKWCoGeOO0GyWLjsZ_QgIg9XftvbQRaB-3S84HE1eHvlvYiXH3A7zHNsk3jTeHSJUdifbBJa8x4cacGzXOAdeZ9OJv7jSAw1x4EHEdEdTVdTyXYND4E1mv4OiUWoywHAEnKTod6c7IL1IcsV7s0Kb5k7XwV3vTGmkHnaFMqT3rh3ayMR6sS6NmYBZBCw8EV1kyKChd1ktefM5agFe0jBZVpGTwCOcPLtpO-rTKZWMwZB8', description: 'Disco duro de 4TB ideal como almacenamiento secundario.' },
      // PSU
      { name: 'Corsair RM1000x 1000W 80+ Gold',      brand: 'Corsair', price: 189.99, stock: 10, categoryId: cat('Fuentes de Poder'),specs: ['1000W', '80+ Gold', 'Full Modular', 'ATX 3.0'],        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZNISJLM71aWLgsGizZRcVTh5jpc2hgqTz54IbFpSulljY6-dHs9R1Q4Inv-dqJqQ6nXygnuN0pN83PLw9L3nB_uQgp8YtHhFXedrTZD0hY_YTqqbVIFLox6rjij5-dDZvIZDZbiRzENAVa7uDoGbnem-yOOsLskpuhIoSIa-vb-C0DXuPSApUK4E_pGU-cSkBBgMeyu4e-mLsQs4odDBk0IwKllHzDhCxsHzNweSL5ANHbmSGaj3VNfjxRNI4t2FfXGXRhD3Smrw', description: 'Fuente modular de 1000W 80 Plus Gold para builds de alto consumo.' },
      { name: 'EVGA SuperNOVA 850W 80+ Platinum',    brand: 'EVGA',    price: 149.99, stock: 12, categoryId: cat('Fuentes de Poder'),specs: ['850W', '80+ Platinum', 'Semi Modular', 'ATX'],          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZNISJLM71aWLgsGizZRcVTh5jpc2hgqTz54IbFpSulljY6-dHs9R1Q4Inv-dqJqQ6nXygnuN0pN83PLw9L3nB_uQgp8YtHhFXedrTZD0hY_YTqqbVIFLox6rjij5-dDZvIZDZbiRzENAVa7uDoGbnem-yOOsLskpuhIoSIa-vb-C0DXuPSApUK4E_pGU-cSkBBgMeyu4e-mLsQs4odDBk0IwKllHzDhCxsHzNweSL5ANHbmSGaj3VNfjxRNI4t2FfXGXRhD3Smrw', description: 'Fuente 850W Platinum semi modular con protecci\u00f3n avanzada.' },
      { name: 'Seasonic Focus GX 650W 80+ Gold',     brand: 'Seasonic',price: 109.99, stock: 18, categoryId: cat('Fuentes de Poder'),specs: ['650W', '80+ Gold', 'Full Modular', 'ATX'],             image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZNISJLM71aWLgsGizZRcVTh5jpc2hgqTz54IbFpSulljY6-dHs9R1Q4Inv-dqJqQ6nXygnuN0pN83PLw9L3nB_uQgp8YtHhFXedrTZD0hY_YTqqbVIFLox6rjij5-dDZvIZDZbiRzENAVa7uDoGbnem-yOOsLskpuhIoSIa-vb-C0DXuPSApUK4E_pGU-cSkBBgMeyu4e-mLsQs4odDBk0IwKllHzDhCxsHzNweSL5ANHbmSGaj3VNfjxRNI4t2FfXGXRhD3Smrw', description: 'Fuente Gold full modular confiable para builds de 600-900W.' },
      // Cases
      { name: 'Lian Li PC-O11 Dynamic EVO',         brand: 'Lian Li', price: 169.99, stock: 8,  categoryId: cat('Gabinetes'),       specs: ['Mid-Tower', 'Vidrio templado', '420mm GPU max', 'USB-C'],image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOFIBxBfcr3WFoBoGgnXKpu5QR5JkzCRRbNjD4evj1oW4Jly6zlLbeZtUPqWSApW3CDUu1-dIRBRVBgp8-anE47qnfaQ_6V65eXL2zzC_JHvJIGC9ZYcvjr9cGks40D6YSz0owimxRmfFAP-KliWHNO6Xdj6icg-0yrWwtADUY4AtalKZ-GrqWcXpKw9s9CeUlJ0tG23iqdcwkAOKIZ9F_-W_bPMYrhIpsARxG5BUpGO8yS4E5A52Adca-srpDJ5VfHthGr2idxvA', badge: 'TOP', badgeColor: 'bg-amber-500', description: 'Gabinete Mid-Tower icónico con doble vidrio templado y gran gestión de cables.' },
      { name: 'Fractal Design Meshify 2',            brand: 'Fractal', price: 139.99, stock: 10, categoryId: cat('Gabinetes'),       specs: ['Mid-Tower', 'Malla frontal', '461mm GPU max', 'Excelente airflow'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOFIBxBfcr3WFoBoGgnXKpu5QR5JkzCRRbNjD4evj1oW4Jly6zlLbeZtUPqWSApW3CDUu1-dIRBRVBgp8-anE47qnfaQ_6V65eXL2zzC_JHvJIGC9ZYcvjr9cGks40D6YSz0owimxRmfFAP-KliWHNO6Xdj6icg-0yrWwtADUY4AtalKZ-GrqWcXpKw9s9CeUlJ0tG23iqdcwkAOKIZ9F_-W_bPMYrhIpsARxG5BUpGO8yS4E5A52Adca-srpDJ5VfHthGr2idxvA', description: 'Gabinete con malla frontal y excelente flujo de aire para cooling.' },
      { name: 'NZXT H9 Flow',                       brand: 'NZXT',    price: 149.99, stock: 7,  categoryId: cat('Gabinetes'),       specs: ['Mid-Tower', 'Doble c\u00e1mara', '420mm GPU max', 'USB-C'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOFIBxBfcr3WFoBoGgnXKpu5QR5JkzCRRbNjD4evj1oW4Jly6zlLbeZtUPqWSApW3CDUu1-dIRBRVBgp8-anE47qnfaQ_6V65eXL2zzC_JHvJIGC9ZYcvjr9cGks40D6YSz0owimxRmfFAP-KliWHNO6Xdj6icg-0yrWwtADUY4AtalKZ-GrqWcXpKw9s9CeUlJ0tG23iqdcwkAOKIZ9F_-W_bPMYrhIpsARxG5BUpGO8yS4E5A52Adca-srpDJ5VfHthGr2idxvA', description: 'Gabinete doble c\u00e1mara con vista de cristal y buena ventilaci\u00f3n.' },
      // Cooling
      { name: 'Corsair iCUE H150i Elite 360mm AIO',  brand: 'Corsair', price: 199.99, stock: 8,  categoryId: cat('Enfriamiento'),    specs: ['360mm AIO', 'RGB', 'Intel + AMD', 'Bomba Magna'],       image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZNISJLM71aWLgsGizZRcVTh5jpc2hgqTz54IbFpSulljY6-dHs9R1Q4Inv-dqJqQ6nXygnuN0pN83PLw9L3nB_uQgp8YtHhFXedrTZD0hY_YTqqbVIFLox6rjij5-dDZvIZDZbiRzENAVa7uDoGbnem-yOOsLskpuhIoSIa-vb-C0DXuPSApUK4E_pGU-cSkBBgMeyu4e-mLsQs4odDBk0IwKllHzDhCxsHzNweSL5ANHbmSGaj3VNfjxRNI4t2FfXGXRhD3Smrw', badge: 'TOP', badgeColor: 'bg-amber-500', description: 'AIO 360mm premium con bomba Magna para enfriamiento extremo.' },
      { name: 'Noctua NH-D15 Chromax',               brand: 'Noctua',  price: 109.99, stock: 12, categoryId: cat('Enfriamiento'),    specs: ['Dual Torre', '2x 140mm', 'Intel + AMD', 'Sin RGB'],     image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZNISJLM71aWLgsGizZRcVTh5jpc2hgqTz54IbFpSulljY6-dHs9R1Q4Inv-dqJqQ6nXygnuN0pN83PLw9L3nB_uQgp8YtHhFXedrTZD0hY_YTqqbVIFLox6rjij5-dDZvIZDZbiRzENAVa7uDoGbnem-yOOsLskpuhIoSIa-vb-C0DXuPSApUK4E_pGU-cSkBBgMeyu4e-mLsQs4odDBk0IwKllHzDhCxsHzNweSL5ANHbmSGaj3VNfjxRNI4t2FfXGXRhD3Smrw', description: 'El mejor disipador de aire del mercado, sin compromiso de rendimiento.' },
      { name: 'DeepCool AK620 Dual Tower',          brand: 'DeepCool',price: 64.99,  stock: 20, categoryId: cat('Enfriamiento'),    specs: ['Dual Torre', '2x 120mm', 'Intel + AMD', 'Excelente valor'], image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZNISJLM71aWLgsGizZRcVTh5jpc2hgqTz54IbFpSulljY6-dHs9R1Q4Inv-dqJqQ6nXygnuN0pN83PLw9L3nB_uQgp8YtHhFXedrTZD0hY_YTqqbVIFLox6rjij5-dDZvIZDZbiRzENAVa7uDoGbnem-yOOsLskpuhIoSIa-vb-C0DXuPSApUK4E_pGU-cSkBBgMeyu4e-mLsQs4odDBk0IwKllHzDhCxsHzNweSL5ANHbmSGaj3VNfjxRNI4t2FfXGXRhD3Smrw', description: 'Disipador dual tower econ\u00f3mico con gran rendimiento t\u00e9rmico.' },
    ]
  })
  console.log(`✅ ${configuratorProducts.count} componentes del configurador creados (esperado: 26)`)

  // ── 5. Usuario administrador ──────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email:    'admin@techstore.com',
      password: adminPassword,
      name:     'Admin TechStore',
      role:     'ADMIN',
    }
  })
  console.log(`✅ Admin creado: ${admin.email}`)

  // ── 6. Usuario de prueba ──────────────────────────────────────────────────
  const userPassword = await bcrypt.hash('user123', 10)
  const testUser = await prisma.user.create({
    data: {
      email:    'alex@techstore.com',
      password: userPassword,
      name:     'Alex Rodriguez',
      phone:    '+57 300 123 4567',
      role:     'CUSTOMER',
      addresses: {
        create: {
          label:     'Casa',
          fullName:  'Alex Rodriguez',
          address:   'Calle 72 # 10-34 Apto 501',
          city:      'Bogotá',
          country:   'Colombia',
          isDefault: true,
        }
      }
    }
  })
  console.log(`✅ Usuario de prueba creado: ${testUser.email}`)

  // ── 7. Pedido de ejemplo ──────────────────────────────────────────────────
  const [prod1, prod2] = await prisma.product.findMany({ take: 2 })

  await prisma.order.create({
    data: {
      orderNumber:       'TS-EJEMPLO1',
      userId:            testUser.id,
      status:            'DELIVERED',
      paymentMethod:     'card',
      subtotal:          prod1.price,
      discount:          0,
      tax:               Number(prod1.price) * 0.19,
      shipping:          24.99,
      total:             Number(prod1.price) * 1.19 + 24.99,
      shippingName:      'Alex Rodriguez',
      shippingAddress:   'Calle 72 # 10-34 Apto 501',
      shippingCity:      'Bogotá',
      shippingCountry:   'Colombia',
      items: {
        create: {
          productId: prod1.id,
          qty:       1,
          unitPrice: prod1.price,
        }
      }
    }
  })
  console.log('✅ Pedido de ejemplo creado')

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('─────────────────────────────────')
  console.log('Admin:  admin@techstore.com / admin123')
  console.log('User:   alex@techstore.com  / user123')
}

main()
  .catch(e => { console.error('❌ Error en seed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
