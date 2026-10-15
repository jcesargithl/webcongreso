export type AuthorityMessage = {
  id: string;
  name: string;
  heading: string;
  greeting?: string;
  role: string;
  secondaryRole?: string;
  institution: string;
  image: string;
  portraitScale: number;
  paragraphs: readonly string[];
  emphasizedParagraphs?: readonly number[];
};

export const authorities: readonly AuthorityMessage[] = [
  {
    id: "efrain-yupanqui",
    name: "Dr. Efraín Humberto Yupanqui Pino",
    heading: "Mensaje del Decano de la FCEDUC",
    greeting: "Estimados colegas y estudiantes,",
    role: "Decano FCEDUC",
    institution: "Universidad Nacional del Altiplano",
    image: "/autoridades/efrain_yupanqui.jpg",
    portraitScale: 1,
    paragraphs: [
      "Al asumir este rol como Decano de la Facultad, me emociona extenderles una cordial invitación para unirse a nosotros en el IV Congreso Internacional de Investigación e Innovación, que tendrá lugar en noviembre de 2026. Este extraordinario evento es un testimonio de nuestra pasión colectiva por avanzar en la comprensión de la educación y su profundo impacto en el desarrollo de la sociedad.",
      "Nuestro congreso siempre ha sido un faro de colaboración e innovación, reuniendo a una diversa comunidad de investigadores, educadores y profesionales de cada rincón de la región. Este año, estamos comprometidos a crear una experiencia aún más inclusiva y dinámica. Nuestro programa contará con un rico tapiz de presentaciones, talleres y discusiones, mostrando los últimos avances en la investigación educativa y sus aplicaciones prácticas.",
      "Este evento es más que una simple conferencia académica; es una celebración de nuestra pasión compartida por el descubrimiento y nuestro compromiso de mejorar la educación a través de la ciencia. ¡Espero darles la bienvenida a cada uno de ustedes para conectar, colaborar y forjar juntos el futuro de la investigación!",
    ],
  },
  {
    id: "henry-vilca",
    name: "Dr. Henry Mark Vilca Apaza",
    heading: "Mensaje de Dirección",
    role: "Director del Programa de Estudios de Educación Primaria",
    institution: "Universidad Nacional del Altiplano de Puno - Perú",
    image: "/autoridades/henry_mark_vilca_apaza.jpg",
    portraitScale: 1.8,
    paragraphs: [
      "Nos complace invitar a la comunidad académica, científica y al público en general a participar en el IV CONGRESO INTERNACIONAL DE INVESTIGACIÓN E INNOVACIÓN, un espacio diseñado para promover el intercambio de conocimientos, el debate científico y el desarrollo de ideas vanguardistas que están transformando nuestro entorno.",
      "Este magno evento académico reunirá a destacados investigadores, docentes, estudiantes, egresados y profesionales de diversas latitudes del mundo con el firme propósito de abordar las tendencias emergentes y soluciones disruptivas a los desafíos globales actuales, propiciando un ambiente de colaboración institucional que enriquecerá significativamente el desarrollo profesional y académico.",
      "Sé parte de este evento, un espacio donde las ideas se encontrarán, un espacio preparado con mucho cariño para compartir, aprender e inspirarnos juntos.",
    ],
  },
  {
    id: "ruth-cruz",
    name: "Dra. Ruth Mery Cruz Huisa",
    heading: "Mensaje de la Presidenta del Comité Organizador",
    role: "Presidenta del Comité Organizador",
    secondaryRole: "Subdirectora de Investigación de la Escuela Profesional de Educación Primaria",
    institution: "Universidad Nacional del Altiplano – Puno",
    image: "/autoridades/ruth_mery_cruz_huisa.png",
    portraitScale: 1.8,
    emphasizedParagraphs: [4],
    paragraphs: [
      "Es un honor dirigirme a la comunidad académica, científica y educativa para expresarles nuestro cordial saludo e invitarlos a participar en el IV Congreso Internacional de Investigación Científica, bajo el lema “Transformando la educación: investigación, innovación e inteligencia artificial para los desafíos del siglo XXI”, que se desarrollará los días 25, 26 y 27 de noviembre de 2026.",
      "Desde la Escuela Profesional de Educación Primaria de la Universidad Nacional del Altiplano, reafirmamos nuestro compromiso con el fortalecimiento de la investigación científica, la innovación educativa y la generación de conocimientos que contribuyan a transformar nuestra sociedad.",
      "En un mundo marcado por los avances tecnológicos y la inteligencia artificial, la educación enfrenta nuevos desafíos que demandan respuestas innovadoras, pensamiento crítico y un firme compromiso con la calidad educativa. En este contexto, nuestro congreso constituye un espacio de encuentro, reflexión e intercambio de experiencias entre investigadores, docentes, estudiantes y profesionales comprometidos con el desarrollo científico y educativo.",
      "Como presidenta del Comité Organizador, expreso mi reconocimiento a quienes hacen posible este importante evento académico e invito a la comunidad científica nacional e internacional a participar activamente, compartir sus investigaciones y fortalecer los vínculos de cooperación académica.",
      "Estamos convencidos de que la investigación genera conocimiento, la innovación transforma realidades y la educación construye un futuro mejor.",
      "¡Sean todos cordialmente bienvenidos al IV Congreso Internacional de Investigación Científica!",
    ],
  },
];
