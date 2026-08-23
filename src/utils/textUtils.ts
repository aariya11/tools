export interface TextStatistics {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export function calculateTextStats(text: string): TextStatistics {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  
  // Word count: split on whitespace and filter empty
  const wordsArray = text.trim().split(/\s+/).filter(w => w.length > 0);
  const words = text.trim() === '' ? 0 : wordsArray.length;
  
  // Sentences: match ending punctuation (. ! ?)
  const sentencesArray = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentences = text.trim() === '' ? 0 : Math.max(1, sentencesArray.length);
  
  // Paragraphs: split on newlines
  const paragraphsArray = text.split(/\n+/).filter(p => p.trim().length > 0);
  const paragraphs = text.trim() === '' ? 0 : paragraphsArray.length;
  
  // Estimated Reading Time: ~200 words per minute
  const readingTimeMinutes = parseFloat((words / 200).toFixed(1));
  
  // Estimated Speaking Time: ~130 words per minute
  const speakingTimeMinutes = parseFloat((words / 130).toFixed(1));
  
  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes,
    speakingTimeMinutes,
  };
}

export interface KeywordDensity {
  word: string;
  count: number;
  percentage: number;
}

export function calculateKeywordDensity(text: string, topN: number = 8): KeywordDensity[] {
  if (!text.trim()) return [];
  
  // Stop words to filter out for meaningful keywords
  const stopWords = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
    'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
    'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
    'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
    'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
    'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
    'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
    'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
    'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
    'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
    'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
    'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
    'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
  ]);

  const cleanWords = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  const totalFiltered = cleanWords.length;
  if (totalFiltered === 0) return [];

  const counts: Record<string, number> = {};
  cleanWords.forEach(w => {
    counts[w] = (counts[w] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([word, count]) => ({
      word,
      count,
      percentage: parseFloat(((count / totalFiltered) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

// Case Conversion Functions
export const CaseConverters = {
  uppercase: (text: string) => text.toUpperCase(),
  lowercase: (text: string) => text.toLowerCase(),
  
  titleCase: (text: string) => {
    const minorWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'with']);
    return text.toLowerCase().split(/(\s+)/).map((segment, idx) => {
      if (/^\s+$/.test(segment)) return segment;
      const clean = segment.replace(/[^\w]/g, '');
      if (idx === 0 || !minorWords.has(clean)) {
        return segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      return segment;
    }).join('');
  },
  
  sentenceCase: (text: string) => {
    return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, match => match.toUpperCase());
  },
  
  capitalizedCase: (text: string) => {
    return text.toLowerCase().replace(/\b\w/g, match => match.toUpperCase());
  },
  
  camelCase: (text: string) => {
    const words = text.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ');
    if (!words[0]) return '';
    return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  },
  
  pascalCase: (text: string) => {
    const words = text.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ');
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  },
  
  snakeCase: (text: string) => {
    return text
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .toLowerCase()
      .replace(/^_+|_+$/g, '');
  },
  
  kebabCase: (text: string) => {
    return text
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .toLowerCase()
      .replace(/^-+|-+$/g, '');
  },
  
  constantCase: (text: string) => {
    return text
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .toUpperCase()
      .replace(/^_+|_+$/g, '');
  },
  
  dotCase: (text: string) => {
    return text
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[^a-zA-Z0-9]+/g, '.')
      .toLowerCase()
      .replace(/^\.+|\.+$/g, '');
  },
  
  alternatingCase: (text: string) => {
    let flip = true;
    return text.split('').map(char => {
      if (/[a-zA-Z]/.test(char)) {
        const res = flip ? char.toLowerCase() : char.toUpperCase();
        flip = !flip;
        return res;
      }
      return char;
    }).join('');
  },
  
  inverseCase: (text: string) => {
    return text.split('').map(char => {
      if (char === char.toUpperCase()) return char.toLowerCase();
      return char.toUpperCase();
    }).join('');
  }
};
