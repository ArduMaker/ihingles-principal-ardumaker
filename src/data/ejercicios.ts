import { Exercise, MultipleChoiceExercise, ListeningExercise, ReadingExercise, DictationExercise, SpeakingExercise, SentenceAnalysisExercise } from '@/types/ejercicio';

// Mock exercise data
const mockExercises: Record<string, Exercise> = {
  '1': {
    id: '1',
    type: 'multiple-choice',
    title: 'Conocimientos Elementales',
    heroImage: '/ejercicio/principal1.png',
    totalExercises: 12,
    currentExercise: 2,
    category: 'Gramar',
    categoryProgress: '2/6',
    instructions: 'Selecciona qué tipo de palabra (morfología) es cada una de las palabras que ponemos a continuación',
    options: [
      {
        id: 'a',
        label: 'a)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: true
      },
      {
        id: 'b',
        label: 'b)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: false
      },
      {
        id: 'c',
        label: 'c)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: true
      },
      {
        id: 'd',
        label: 'd)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: true
      },
      {
        id: 'e',
        label: 'e)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: false
      },
      {
        id: 'f',
        label: 'f)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: true
      },
      {
        id: 'g',
        label: 'g)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: false
      },
      {
        id: 'h',
        label: 'h)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: true
      },
      {
        id: 'i',
        label: 'i)',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        isCorrect: true
      }
    ]
  } as MultipleChoiceExercise,
  '2': {
    id: '2',
    type: 'listening',
    title: 'Listening 2: Multiple Choice',
    heroImage: '/ejercicio/principal2.png',
    totalExercises: 23,
    currentExercise: 2,
    category: 'Listening',
    categoryProgress: '2/23',
    instructions: 'Escucha el audio y escoge la respuesta de entre las alternativas ofrecidas en cada apartado.',
    audioUrl: '/audio/sample.mp3',
    audioImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    audioDuration: '0:14',
    attachedFile: {
      name: 'Resumen Situaciones Laborales PPT - Unidad 4',
      url: '/files/resumen.pdf'
    },
    adviceText: 'Intenta hacer una primera vez cada listening. Si cometes fallos, lee el script e intenta entender todo lo que está escrito en él. Vuelve a hacer el listening sin mirar el script. Usa esta metodología hasta que tu capacidad de entender sea casi total en cada listening',
    pronunciationTitle: 'Pronunciación',
    questions: [
      {
        id: 'q1',
        questionNumber: 1,
        text: "What is the boy's name?",
        options: ['John', 'James', 'Jack', 'Jake'],
        correctOptionIndex: 1
      },
      {
        id: 'q2',
        questionNumber: 2,
        text: 'Where does he come from?',
        options: ['London', 'Manchester', 'Liverpool', 'Birmingham'],
        correctOptionIndex: 0
      },
      {
        id: 'q3',
        questionNumber: 3,
        text: 'How about the girl? What is her name?',
        options: ['Sarah', 'Sophie', 'Susan', 'Samantha'],
        correctOptionIndex: 2
      },
      {
        id: 'q4',
        questionNumber: 4,
        text: 'Where does she come from?',
        options: ['Paris', 'Lyon', 'Marseille', 'Nice'],
        correctOptionIndex: 1
      },
      {
        id: 'q5',
        questionNumber: 5,
        text: 'Which course are they both doing?',
        options: ['Business', 'Engineering', 'Medicine', 'Law'],
        correctOptionIndex: 0
      },
      {
        id: 'q6',
        questionNumber: 6,
        text: 'Whose class is Alfred in?',
        options: ['Dr. Smith', 'Prof. Johnson', 'Mr. Brown', 'Ms. Davis'],
        correctOptionIndex: 3
      },
      {
        id: 'q7',
        questionNumber: 7,
        text: 'Whose class is Janet in?',
        options: ['Dr. Smith', 'Prof. Johnson', 'Mr. Brown', 'Ms. Davis'],
        correctOptionIndex: 0
      },
      {
        id: 'q8',
        questionNumber: 8,
        text: "What time does Alfredo's class finish?",
        options: ['3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'],
        correctOptionIndex: 2
      }
    ]
  } as ListeningExercise,
  '3': {
    id: '3',
    type: 'reading',
    title: 'Missing Person',
    heroImage: '/ejercicio/principal3.png',
    totalExercises: 23,
    currentExercise: 2,
    category: 'Reading',
    categoryProgress: '2/23',
    instructions: 'Answer by selecting the correct option from the different options offered',
    contentImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
    questions: [
      {
        id: 'q1',
        questionNumber: 1,
        text: 'John Smith is 30 years old',
        correctAnswer: true
      },
      {
        id: 'q2',
        questionNumber: 2,
        text: 'John has green eyes',
        correctAnswer: false
      },
      {
        id: 'q3',
        questionNumber: 3,
        text: 'He was last seen at a shopping mall.',
        correctAnswer: false
      },
      {
        id: 'q4',
        questionNumber: 4,
        text: 'John is wearing a blue jacket',
        correctAnswer: true
      },
      {
        id: 'q5',
        questionNumber: 5,
        text: 'He is 170 cm tall',
        correctAnswer: false
      },
      {
        id: 'q6',
        questionNumber: 6,
        text: 'John has brown hair.',
        correctAnswer: true
      },
      {
        id: 'q7',
        questionNumber: 7,
        text: 'He was last seen at a restaurant',
        correctAnswer: false
      }
    ]
  } as ReadingExercise,
  '4': {
    id: '4',
    type: 'dictation',
    title: 'Ejercicio de pronunciación',
    heroImage: '/ejercicio/principal4.png',
    totalExercises: 23,
    currentExercise: 2,
    category: 'Pronunciation',
    categoryProgress: '2/23',
    instructions: 'Escucha con atención el dictado de palabras. Luego, escríbelas en orden en los campos inferiores.',
    audioUrl: '/audio/dictation.mp3',
    audioImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    audioDuration: '0:14',
    adviceText: 'Intenta hacer una primera vez cada listening. Si cometes fallos, lee el script e intenta entender todo lo que está escrito en él.',
    questions: [
      { id: 'd1', questionNumber: 1, correctAnswer: 'hello' },
      { id: 'd2', questionNumber: 2, correctAnswer: 'world' },
      { id: 'd3', questionNumber: 3, correctAnswer: 'beautiful' },
      { id: 'd4', questionNumber: 4, correctAnswer: 'morning' },
      { id: 'd5', questionNumber: 5, correctAnswer: 'sunshine' },
      { id: 'd6', questionNumber: 6, correctAnswer: 'happy' },
      { id: 'd7', questionNumber: 7, correctAnswer: 'learning' },
      { id: 'd8', questionNumber: 8, correctAnswer: 'english' },
      { id: 'd9', questionNumber: 9, correctAnswer: 'practice' },
      { id: 'd10', questionNumber: 10, correctAnswer: 'student' },
      { id: 'd11', questionNumber: 11, correctAnswer: 'exercise' },
      { id: 'd12', questionNumber: 12, correctAnswer: 'complete' }
    ]
  } as DictationExercise,
  '5': {
    id: '5',
    type: 'speaking',
    title: 'Pronunciation Exercise 3: Speaking',
    heroImage: '/ejercicio/principal5.png',
    totalExercises: 23,
    currentExercise: 2,
    category: 'Speaking',
    categoryProgress: '2/23',
    instructions: 'Presiona el micrófono y repite cada frase con claridad. El sistema evaluará tu pronunciación.',
    phrases: [
      { id: 'sp1', phraseNumber: 1, text: 'Hi, I am looking for a shirt' },
      { id: 'sp2', phraseNumber: 2, text: 'Sure, I can help you with that' },
      { id: 'sp3', phraseNumber: 3, text: 'What kind of shirt are you looking for?' },
      { id: 'sp4', phraseNumber: 4, text: 'Do you have a colour in mind?' },
      { id: 'sp5', phraseNumber: 5, text: 'I am looking for something casual' },
      { id: 'sp6', phraseNumber: 6, text: 'Here are a few that you might like' },
      { id: 'sp7', phraseNumber: 7, text: 'This shirt looks very nice on you' }
    ]
  } as SpeakingExercise,
  '6': {
    id: '6',
    type: 'sentence-analysis',
    title: 'Conocimientos Elementales: función de cada parte de una oración',
    heroImage: '/ejercicio/principal6.png',
    totalExercises: 23,
    currentExercise: 2,
    category: 'Gramar',
    categoryProgress: '2/23',
    instructions: 'Indicar qué función hace cada parte marcada en la oración',
    sentence: 'El perro ha dado un mordisco al niño en el parque esta mañana.',
    syntacticOptions: ['GRUPO SINTÁCTICO', 'Sujeto', 'Predicado', 'Complemento Directo', 'Complemento Indirecto'],
    functionOptions: ['FUNCIÓN en la ORACIÓN', 'Núcleo del sujeto', 'Núcleo del predicado', 'Objeto directo', 'Objeto indirecto', 'Complemento circunstancial'],
    parts: [
      {
        id: 'p1',
        text: 'El perro',
        syntacticGroup: 'Sujeto',
        sentenceFunction: 'Núcleo del sujeto'
      },
      {
        id: 'p2',
        text: 'ha dado',
        syntacticGroup: 'Predicado',
        sentenceFunction: 'Núcleo del predicado'
      },
      {
        id: 'p3',
        text: 'un mordisco',
        syntacticGroup: 'Complemento Directo',
        sentenceFunction: 'Objeto directo'
      },
      {
        id: 'p4',
        text: 'al niño',
        syntacticGroup: 'Complemento Indirecto',
        sentenceFunction: 'Objeto indirecto'
      },
      {
        id: 'p5',
        text: 'en el parque',
        syntacticGroup: 'Complemento Directo',
        sentenceFunction: 'Complemento circunstancial'
      },
      {
        id: 'p6',
        text: 'esta mañana',
        syntacticGroup: 'Complemento Directo',
        sentenceFunction: 'Complemento circunstancial'
      }
    ]
  } as SentenceAnalysisExercise
};
