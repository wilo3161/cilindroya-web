/*
 * brand/cy-imbabura.js — Zonas de la provincia de Imbabura para CilindroYa (03/11/2026).
 *
 * Solo datos (la interfaz está en brand/cy-zonas.js). Para agregar un barrio o cambiar la cobertura se edita
 * SOLO este archivo.
 *
 * cobertura: "si" = zona piloto (se atiende hoy) · "pronto" = entra después de la zona piloto.
 * barrios: { "Parroquia": [barrios] } — barrios de esa parroquia (urbana o rural).
 * barriosCiudad: barrios de la ciudad cuando la fuente no dice a qué parroquia urbana pertenecen (Otavalo).
 * Si una parroquia no tiene lista, el cliente escribe su barrio o comunidad.
 *
 * Fuentes (consultadas el 03/11/2026):
 * - Parroquias: GAD municipales e INEC (Antonio Ante: antonioante.gob.ec; Otavalo: otavalo.gob.ec) y tesis UTN.
 * - Ibarra (barrios por parroquia urbana): es.wikipedia.org/wiki/Ibarra_(Ecuador).
 * - Otavalo: otavalo.gob.ec (asambleas de planificación barrial 2019 y comités de seguridad barrial).
 * - Antonio Ante: antonioante.gob.ec/AntonioAnte/parroquias (San Roque) y es.wikipedia.org (Chaltura).
 * - Cotacachi: es.wikipedia.org/wiki/Cantón_Cotacachi.
 * - Pimampiro: es.wikipedia.org/wiki/Pimampiro_(parroquia).
 * - Urcuquí y Tumbabiro: parroqui.blogspot.com (2012; la fuente más antigua, conviene confirmarla).
 */
window.CY_IMBABURA = [
  {
    canton: 'Ibarra', cobertura: 'si',
    urbanas: ['El Sagrario', 'San Francisco', 'Caranqui', 'Alpachaca', 'La Dolorosa del Priorato'],
    rurales: ['La Esperanza', 'San Antonio', 'Angochagua', 'Ambuquí', 'Salinas', 'La Carolina', 'Lita'],
    barrios: {
      'El Sagrario': ['Centro', 'El Olivo', 'La Quinta del Olivo', 'Mirador del Olivo', 'Huertos Familiares Centro',
        'Huertos Familiares Norte', 'Pugacho Bajo', 'San Andrés', 'Yahuarcocha', 'El Milagro', 'Ajaví Grande',
        'Ajaví Chiquito', 'Simón Bolívar de Ajaví', 'El Empedrado de Fátima', 'Santa Marianita del Empedrado',
        'Ciudadela del Chofer', 'Colinas del Sur', 'Zoila Galárraga', '2 de Septiembre', 'José Tabango',
        'Flota Imbabura', 'Emelnorte', 'La Quinta', 'Nuevo Hogar', 'Ciudad de Ibarra', 'Auxilios Mutuos',
        'San Miguel de Ibarra', 'Los Laureles del Sagrario', 'El Obrero', 'Mayor Galo Larrea', 'San Miguel Arcángel',
        'José Miguel Leoro', 'Almeida Galárraga', 'El Jardín', 'Avenida Centro', 'La Ferroviaria', 'Cabezas Borja',
        'Eloy Alfaro', 'La Merced', 'Victoriano Proaño', 'Consejo Provincial', 'Santo Domingo',
        'Bajada de Los Molinos', 'Avenida Carchi', 'San Martín', 'Tahuando', 'San Agustín', 'El Libertador',
        'Monseñor Leonidas Proaño'],
      'San Francisco': ['San Francisco Centro', 'Los Ceibos', 'La Victoria Centro', 'La Victoria I Etapa',
        'La Victoria III Etapa', 'La Victoria-Universidades', 'Yacucalle', 'Yacucalle I Etapa', 'Pilanquí', 'El Ejido',
        'Bola Amarilla', 'La Florida', 'Pugacho Alto', 'Terminal', 'El Obelisco', 'La Dolorosa', 'Don Bosco',
        'Teodoro Gómez', 'Ajaví', 'San José de Chorlaví', 'San José de Yuyucocha', 'Mariano Acosta',
        'Jardines de Odila', 'La Floresta', 'Nuevo Amanecer', 'Pradera de los Sauces', 'Velasco', 'El Águila',
        'Barcelona El Carmen', 'San Juan Calle', 'José Domingo Albuja', 'Fausto Endara', 'El Bosque', 'Los Girasoles',
        'La Primavera', 'La Campiña', 'Los Laureles'],
      'Caranqui': ['Central', 'Ejido de Caranqui', 'Guayaquil de Caranqui', 'Yuyucocha', 'San Francisco de Chorlaví',
        'La Candelaria', 'El Retorno', 'Santa Lucía del Retorno', 'Cuatro Esquinas', '19 de Enero', 'El Chamanal',
        '20 de Octubre', 'Unión y Progreso', '10 de Agosto', 'Naranjal', 'Vista Hermosa', 'Bellavista',
        'Simón Bolívar'],
      'Alpachaca': ['Alpachaca Centro', 'Mirador de Alpachaca', 'Azaya Centro', 'Azaya Norte', 'Mirador de Azaya',
        'Lomas de Azaya', 'Parque Industrial', 'Las Palmas', 'Miravalle', 'Balcón Ibarreño', 'Vista El Lago',
        'Los Pinos', 'Santa Teresita', 'La Primavera de Alpachaca', 'La Floresta de Alpachaca', 'Panecillo',
        'Imbabura', 'Bloque 9', '16 de Abril', '15 de Diciembre', '16 de Febrero', '1 de Enero', '28 de Septiembre'],
      'La Dolorosa del Priorato': ['San José del Priorato', 'Floresta del Priorato', 'Santa Rosa', 'La Delicia',
        'Santa Marianita', 'Sagrado Corazón', 'Mirador de la Aduana', 'Panecillo de la Laguna', 'Flor del Valle',
        'Puruhanta', 'Cuatro Esquinas de la Laguna', 'Socapamba']
    }
  },
  {
    canton: 'Antonio Ante', cobertura: 'si',
    urbanas: ['Atuntaqui', 'Andrade Marín'],
    rurales: ['San Roque', 'San José de Chaltura', 'San Francisco de Natabuela', 'Imbaya'],
    barrios: {
      'San Roque': ['Centro', 'San Agustín', 'Santa Rosa', 'San Alfonso', 'Sagrado Corazón de Jesús', 'La Cantarilla',
        'La Merced', 'San Miguel', 'La Delicia', 'Pucará', 'Cerotal', 'La Esperanza', 'Agualongo de Paredes'],
      'San José de Chaltura': ['Central', 'Loma de Paz', 'San Vicente', 'El Rosario', 'El Incario', 'El Carmen',
        'La Merced de Cobuendo', 'La Pradera']
    }
  },
  {
    canton: 'Otavalo', cobertura: 'si',
    urbanas: ['El Jordán', 'San Luis'],
    rurales: ['San Pablo del Lago', 'González Suárez', 'Eugenio Espejo', 'San Rafael', 'San Juan de Ilumán',
              'Dr. Miguel Egas Cabezas (Peguche)', 'San José de Quichinche', 'Selva Alegre', 'Pataquí'],
    barrios: {},
    barriosCiudad: ['Centro', 'Punyaro', 'Copacabana', 'Monserrath Alto', 'Monserrath Bajo', 'Rey Loma', 'La Joya',
      'Cardón Bajo', 'La Florida', 'Machángara', 'Buenos Aires', 'Santa Anita', 'Mirador del Colibrí',
      'Balcón Otavaleño', 'San Blas', 'San Vicente de Cotama']
  },
  {
    canton: 'Cotacachi', cobertura: 'si',
    urbanas: ['El Sagrario', 'San Francisco'],
    rurales: ['Quiroga', 'Imantag', 'Apuela', 'García Moreno', 'Peñaherrera', 'Plaza Gutiérrez', 'Vacas Galindo',
              'Seis de Julio de Cuellaje'],
    barrios: {
      'El Sagrario': ['Central', 'Centro Histórico', 'La Bolívar', 'La Sucre', 'Modesto Peñaherrera', 'Diablo Calle',
        'Oriental', 'Dispensario IESS', 'Cachipugro', 'La Riofrío', 'El INNFA', '24 de Mayo', 'San José', 'La Banda',
        'Pilchibuela'],
      'San Francisco': ['San Teodoro', 'El Ejido', 'Húmedo', '10 de Agosto', 'Parque Olmedo', 'Cuerpo de Bomberos',
        'Hospital Asdrúbal de la Torre', 'Caliente', 'El Coco']
    }
  },
  {
    canton: 'Pimampiro', cobertura: 'pronto',
    urbanas: ['Pimampiro'],
    rurales: ['Chugá', 'Mariano Acosta', 'San Francisco de Sigsipamba'],
    barrios: {
      'Pimampiro': ['El Mirador', 'San Vicente', 'San Pedro', 'Monserrat', 'Santa Clara', 'El Rosal', 'Santa Cecilia',
        'Santa Lucía', 'San Isidro']
    }
  },
  {
    canton: 'San Miguel de Urcuquí', cobertura: 'pronto',
    urbanas: ['Urcuquí'],
    rurales: ['Tumbabiro', 'Pablo Arenas', 'Cahuasquí', 'San Blas', 'La Merced de Buenos Aires'],
    barrios: {
      'Urcuquí': ['El Centro', 'San Nicolás', 'Las Cuatro Esquinas', 'La Recoleta', 'Santa Rosa', 'San Ignacio',
        'La Plaza Vieja', 'San Antonio', 'La Merced', 'San José', 'Garzón Fonseca', 'San Pedro', 'La Virgen',
        'El Sucre', 'Yachay'],
      'Tumbabiro': ['La Cruz', 'San Francisco', 'Calle Sucre', '10 de Agosto', 'García Moreno', 'González Suárez']
    }
  }
];
