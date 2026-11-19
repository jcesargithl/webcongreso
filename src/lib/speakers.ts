export type Speaker = {
  slug: string;
  name: string;
  type: "Conferencista Nacional" | "Conferencista Internacional";
  country: string;
  role: string;
  institution: string;
  desc: string;
  img: string;
  topic: string;
};

export const speakers: Speaker[] = [
  {
    slug: "dr-jose-supo",
    name: "Dr. José Supo",
    type: "Conferencista Internacional",
    country: "Perú / Internacional",
    institution: "Sociedad Hispana de Investigadores Científicos",
    role: "Especialista en Metodología de la Investigación y Estadística Aplicada a la Educación.",
    desc: "Reconocido bioestadístico, metodólogo y conferencista internacional de amplia trayectoria en Iberoamérica. Especialista en diseño de investigaciones cuantitativas, análisis de datos y bioestadística aplicada a las ciencias sociales y la educación.",
    img: "/speakers/dr-jose-supo.jpg",
    topic: "Metodología de la Investigación y Estadística Aplicada a la Innovación Educativa"
  },
  {
    slug: "mtra-marycruz-presas-rodriguez",
    name: "Mtra. Marycruz Presas Rodríguez",
    type: "Conferencista Internacional",
    country: "México",
    institution: "Investigadora en Educación Superior (México)",
    role: "Docente investigadora en educación especial, la inclusión educativa y los procesos de evaluación de la educación superior.",
    desc: "Investigadora mexicana especializada en modelos inclusivos de aprendizaje, atención a la diversidad curricular y procesos contemporáneos de evaluación y acreditación de la calidad en la educación superior.",
    img: "/speakers/mtra-marycruz-presas-rodriguez.jpg",
    topic: "Inclusión Educativa, Educación Especial y Procesos de Evaluación en la Educación Superior"
  },
  {
    slug: "phd-piter-henry-escobar-callejas",
    name: "PhD Piter Henry Escobar Callejas",
    type: "Conferencista Internacional",
    country: "Bolivia",
    institution: "Universidad Pública de El Alto (UPEA), Bolivia",
    role: "Docente investigador de la Universidad Pública de El Alto, Bolivia.",
    desc: "Doctor e investigador boliviano con destacada labor en innovación curricular, integración de tecnologías digitales en la docencia universitaria e impacto de la inteligencia artificial en la formación docente.",
    img: "/speakers/phd-piter-henry-escobar-callejas.jpg",
    topic: "Transformación Educativa, Inteligencia Artificial y Desafíos del Siglo XXI"
  },
  {
    slug: "yor-yimer-diaz-mendez",
    name: "Yor Yimer Díaz Méndez",
    type: "Conferencista Internacional",
    country: "Colombia",
    institution: "Universidad Autónoma de Bucaramanga (UNAB), Colombia",
    role: "Docente universitario en el área de matemática de la Universidad Autónoma de Bucaramanga (UNAB), Colombia.",
    desc: "Docente e investigador universitario colombiano de la Universidad Autónoma de Bucaramanga (UNAB), especialista en educación matemática, pedagogía cuantitativa y desarrollo de competencias lógico-matemáticas en la educación superior.",
    img: "/speakers/yor-yimer-diaz-mendez.jpg",
    topic: "Didáctica de la Matemática y Estrategias Pedagógicas Innovadoras en la Educación Superior"
  },
  {
    slug: "jesus-wiliam-huanca-arohuanca",
    name: "Jesús Wiliam Huanca-Arohuanca",
    type: "Conferencista Nacional",
    country: "Perú",
    institution: "Universidad Nacional Amazónica de Madre de Dios",
    role: "Docente-Investigador RENACYT de la Universidad Nacional Amazónica de Madre de Dios, Perú.",
    desc: "Investigador calificado en RENACYT - CONCYTEC, especialista en epistemología de las ciencias sociales, producción científica indexada y metodologías de investigación en contextos amazónicos y andinos.",
    img: "/speakers/jesus-wiliam-huanca-arohuanca.jpg",
    topic: "Epistemología y Producción Científica en la Investigación Educativa"
  },
  {
    slug: "dr-vidnay-noel-valero-ancco",
    name: "Dr. Vidnay Noel Valero Ancco",
    type: "Conferencista Nacional",
    country: "Perú",
    institution: "Universidad Nacional del Altiplano (UNA Puno)",
    role: "Docente Investigador RENACYT de la Universidad Nacional del Altiplano.",
    desc: "Catedrático e investigador RENACYT de la Universidad Nacional del Altiplano. Miembro del Comité Científico evaluador del IV Congreso Internacional, especialista en educación superior, calidad académica y formación investigativa.",
    img: "/speakers/dr-vidnay-noel-valero-ancco.jpg",
    topic: "Investigación Científica y Desafíos de la Educación Superior en la Región Andina"
  },
  {
    slug: "franklin-americo-canaza-choque",
    name: "Franklin Américo Canaza-Choque",
    type: "Conferencista Nacional",
    country: "Perú",
    institution: "Investigador RENACYT - CONCYTEC",
    role: "Docente investigador RENACYT, investigador social y académico peruano reconocido por su labor educativa y su producción científica en ciencias sociales, derecho y educación.",
    desc: "Prolífico investigador peruano calificado en RENACYT, autor de numerosas publicaciones indexadas a nivel internacional, centrado en el estudio sociológico de la educación, derechos educativos y políticas formativas del siglo XXI.",
    img: "/speakers/franklin-americo-canaza-choque.jpg",
    topic: "Políticas Educativas, Sociedad y Producción Científica en el Perú"
  }
];
