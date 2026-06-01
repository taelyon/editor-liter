import { Router } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@vercel/kv';

function getRedisClient() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return createClient({ url, token });
  }
  return null;
}

const router = Router();
function getAiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface CacheData {
  movies?: { timestamp: number; data: any[] };
  books?: { timestamp: number; data: any[] };
}

const fallbackMovies = [
  {
    id: 1,
    title: '시민 케인 (Citizen Kane)',
    director: '오슨 웰스',
    genre: '드라마/미스터리',
    description: '언론 재벌 찰스 포스터 케인의 죽음과 그가 남긴 마지막 단어 "로즈버드"의 의미를 추적하며 그의 파란만장한 생애를 조명하는 작품입니다. 1941년 개봉 당시 혁신적인 딥 포커스 촬영 기법과 비선형적 서사 구조, 정교한 조명과 편집을 선보이며 현대 영화 문법의 토대를 마련했습니다. 수십 년간 수많은 비평가들에 의해 영화사상 가장 위대한 명작 1위로 꼽히며, 끊임없는 찬사를 받고 있는 기념비적인 영화입니다.',
    year: '1941'
  },
  {
    id: 2,
    title: '2001 스페이스 오디세이 (2001: A Space Odyssey)',
    director: '스탠리 큐브릭',
    genre: 'SF/어드벤처',
    description: '인류의 기원부터 기술의 극악한 발전, 그리고 미지의 우주적 진화에 이르기까지 철학적이고 심오한 주제를 시각적으로 탐구한 SF 장르의 마스터피스입니다. 인공지능 HAL 9000의 반란과 특수효과의 선구적인 활용은 당시 시대를 아득히 초월한 성취를 보여주었습니다. 우주 공간의 경외감과 공포를 클래식 음악과 결합하여 극단적인 예술성으로 승화시킨 스탠리 큐브릭 감독의 평생의 역작으로 평가받습니다.',
    year: '1968'
  },
  {
    id: 3,
    title: '대부 (The Godfather)',
    director: '프란시스 포드 코폴라',
    genre: '범죄/드라마',
    description: '마피아 코를레오네 가문의 권력 승계와 범죄 세계의 잔혹한 생리를 그려낸 현대 마피아 영화의 교과서입니다. 마피아라는 소재를 넘어서서 미국 자본주의 사회의 어두운 이면과 가족의 비극적 굴레를 묵직하게 담아냈습니다. 말론 브란도, 알 파치노 등 전설적인 배우들의 압도적인 연기와 니노 로타의 잊을 수 없는 테마곡이 결합되어, 대중성과 예술성을 동시에 거머쥔 불멸의 고전으로 영원히 기억되고 있습니다.',
    year: '1972'
  },
  {
    id: 4,
    title: '7인의 사무라이 (Seven Samurai)',
    director: '구로사와 아키라',
    genre: '액션/드라마',
    description: '산적들의 약탈에 신음하던 가난한 농민들이 마을을 지키기 위해 고용한 7명의 사무라이들이 벌이는 치열한 전투를 그린 작품입니다. 개성 넘치는 캐릭터들의 역동적인 상호작용, 철저한 고증, 그리고 다중 카메라를 활용한 생동감 넘치는 액션 시퀀스는 이후 수많은 할리우드 서부극과 액션 영화에 지대한 영향을 미쳤습니다. 인간성과 계급, 희생이라는 주제 의식을 스펙터클하게 풀어낸 아시아 영화의 최고봉입니다.',
    year: '1954'
  },
  {
    id: 5,
    title: '현기증 (Vertigo)',
    director: '알프레드 히치콕',
    genre: '스릴러/로맨스',
    description: '고소공포증을 앓는 전직 경찰 스카티가 친구의 아내 마들렌을 미행하며 미궁에 빠지고, 사랑과 집착의 소용돌이에 휩싸이는 심리 스릴러입니다. 줌-트랙 아웃(현기증 숏) 촬영 기법을 통해 주인공의 불안한 내면을 시각화하였으며, 남성의 파괴적인 시선과 강박관념을 날카롭게 해부합니다. 개봉 당시에는 큰 빛을 보지 못했으나, 시간이 흐를수록 영화 언어의 예술적 극치로 재평가되며 최고의 영화로 추앙받고 있습니다.',
    year: '1958'
  }
];

const fallbackBooks = [
  {
    id: 1,
    title: '카라마조프 가의 형제들 (The Brothers Karamazov)',
    author: '표도르 도스토옙스키',
    genre: '고전/철학',
    description: '탐욕스럽고 방탕한 아버지 표도르 카라마조프의 피살 사건을 둘러싸고, 성격이 판이하게 다른 세 형제와 사생아가 얽히며 벌어지는 비극을 다룬 대하소설입니다. 인간의 자유 의지와 구원, 신과 신앙, 그리고 도덕성에 대한 심원한 철학적 논쟁이 소설 전반에 거대한 물결처럼 흐릅니다. 톨스토이 등 당대 최고의 문호들이 찬사를 보냈으며, 서양 근대 문학의 정점으로 꼽히는 도스토옙스키 최후의 대작입니다.',
    year: '1880'
  },
  {
    id: 2,
    title: '백년의 고독 (One Hundred Years of Solitude)',
    author: '가브리엘 가르시아 마르케스',
    genre: '마술적 리얼리즘',
    description: '가상의 마을 마콘도를 세운 부엔디아 가문의 7대에 걸친 기상천외하고도 비극적인 100년의 역사를 서술한 작품입니다. 마술적 리얼리즘의 완벽한 구현체로 평가받으며, 현실과 환상, 신화와 역사가 경계 없이 환상적으로 뒤섞여 라틴아메리카의 파란만장한 현대사를 절묘하게 은유합니다. 20세기 세계 문학에 가장 커다란 충격과 혁신을 안겨주며 저자에게 노벨문학상을 안긴 불멸의 소설입니다.',
    year: '1967'
  },
  {
    id: 3,
    title: '위대한 개츠비 (The Great Gatsby)',
    author: 'F. 스콧 피츠제럴드',
    genre: '고전/로맨스',
    description: '1920년대 재즈 호황기를 맞은 화려한 뉴욕을 배경으로, 옛 연인 데이지를 되찾기 위해 수단과 방법을 가리지 않고 부를 축적한 미스터리한 부호 제이 개츠비의 비극적인 생애를 관찰자 닉의 시선으로 쫓아갑니다. 물질주의적 공허함 속에서도 순수한 사랑과 희망을 좇았던 개츠비의 맹목적인 열망은 깊은 여운을 남깁니다. 아메리칸드림의 허상과 타락을 세밀하고 우아한 문체로 해부한 영미 문학의 대표작입니다.',
    year: '1925'
  },
  {
    id: 4,
    title: '돈 키호테 (Don Quixote)',
    genre: '고전/풍자',
    author: '미겔 데 세르반테스',
    description: '기사도 소설에 너무 심취한 나머지 스스로를 편력기사라 착각하고, 늙은 말 로시난테와 충직한 종사 산초 판사와 함께 허무맹랑한 모험을 떠나는 시골 귀족 돈 키호테의 이야기입니다. 당시 유행하던 서사극의 허구를 통쾌하게 조롱함과 동시에, 현실의 장벽 앞에서도 이상을 잃지 않는 인간의 고귀한 어리석음을 슬프고도 해학적으로 그려냅니다. 현대 소설의 효시이자 인류 역사상 가장 위대한 문학 작품 중 하나로 칭송받습니다.',
    year: '1605'
  },
  {
    id: 5,
    title: '마담 보바리 (Madame Bovary)',
    genre: '사실주의/드라마',
    author: '귀스타브 플로베르',
    description: '시골 의사와 결혼하여 평범한 삶을 살던 엠마 보바리가 낭만주의 연애 소설이 주입한 헛된 환상에 빠져 불륜과 사치, 걷잡을 수 없는 타락의 길로 추락하는 과정을 냉철하게 묘사합니다. 플로베르는 감정의 과잉을 배제하고 극단적인 객관적 시선인 일명 \'일물일어설(一物一語說)\'의 완벽을 기하며, 당시 프랑스 부르주아 사회의 위선과 권태를 적나라하게 해부하였습니다. 근대 사실주의 소설의 포문을 연 위대한 마스터피스입니다.',
    year: '1856'
  }
];

async function getCacheData(): Promise<CacheData> {
  try {
    const redis = getRedisClient();
    if (redis) {
      const data = await redis.get<CacheData>('recommendations_cache');
      return data || {};
    }
  } catch (e) {
    console.error('Error reading cache from Redis:', e);
  }
  return {};
}

async function saveCacheData(data: CacheData) {
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.set('recommendations_cache', data);
    }
  } catch (e) {
    console.error('Error writing cache to Redis:', e);
  }
}

router.get('/movies', async (req, res) => {
  try {
    const cache = await getCacheData();
    const now = Date.now();
    if (cache.movies && cache.movies.data && (now - cache.movies.timestamp < ONE_WEEK_MS)) {
      return res.json(cache.movies.data);
    }

    const ai = getAiClient();
    if (!ai) {
      console.log('No GEMINI_API_KEY found, using fallback movies');
      return res.json(fallbackMovies);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "추천 영화 5편을 추천해줘. 단순한 흥행작이나 인기순위보다, 영화사에 길이 남을 명작이나 고전처럼 깊은 여운을 주고 예술적으로 높은 평가를 받는 마스터피스 위주로 선정해줘. JSON 배열 형태로 제목(title), 감독(director), 장르(genre), 상세하고 깊이 있는 설명(description), 개봉년도(year)를 포함해줘.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              title: { type: Type.STRING },
              director: { type: Type.STRING },
              genre: { type: Type.STRING },
              description: { type: Type.STRING },
              year: { type: Type.STRING }
            },
            required: ["id", "title", "director", "genre", "description", "year"]
          }
        }
      }
    });

    let newMovies = [];
    try {
      newMovies = JSON.parse(response.text?.trim() || "[]");
    } catch (e) {
      console.error('Error parsing gemini response', e);
    }

    if (newMovies.length > 0) {
      cache.movies = { timestamp: now, data: newMovies };
      await saveCacheData(cache);
      return res.json(newMovies);
    } else {
      console.error('Failed to generate recommendations, using fallback');
      return res.json(fallbackMovies);
    }
  } catch (err: any) {
    if (err?.status === 400 || err?.message?.includes('API key')) {
      console.log('API key issue, using fallback movies');
    } else {
      console.error('Movie recommendation error:', err);
    }
    return res.json(fallbackMovies);
  }
});

router.post('/movies/refresh', async (req, res) => {
  try {
    const cache = await getCacheData();
    const now = Date.now();
    
    const ai = getAiClient();
    if (!ai) {
      console.log('No GEMINI_API_KEY found, using fallback movies');
      return res.json(fallbackMovies);
    }

    // Force generation
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "추천 영화 5편을 추천해줘. 단순한 흥행작이나 인기순위보다, 영화사에 길이 남을 명작이나 고전처럼 깊은 여운을 주고 예술적으로 높은 평가를 받는 마스터피스 위주로 선정해줘. 이전에 추천했던 것과 다른 영화들을 포함해줘. JSON 배열 형태로 제목(title), 감독(director), 장르(genre), 상세하고 깊이 있는 설명(description), 개봉년도(year)를 포함해줘.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              title: { type: Type.STRING },
              director: { type: Type.STRING },
              genre: { type: Type.STRING },
              description: { type: Type.STRING },
              year: { type: Type.STRING }
            },
            required: ["id", "title", "director", "genre", "description", "year"]
          }
        }
      }
    });

    let newMovies = [];
    try {
      newMovies = JSON.parse(response.text?.trim() || "[]");
    } catch (e) {
      console.error('Error parsing gemini response', e);
    }

    if (newMovies.length > 0) {
      cache.movies = { timestamp: now, data: newMovies };
      await saveCacheData(cache);
      return res.json(newMovies);
    } else {
      console.error('Failed to generate recommendations, using fallback');
      return res.json(fallbackMovies);
    }
  } catch (err: any) {
    if (err?.status === 400 || err?.message?.includes('API key')) {
      console.log('API key issue, using fallback movies');
    } else {
      console.error('Movie recommendation error:', err);
    }
    return res.json(fallbackMovies);
  }
});

router.get('/books', async (req, res) => {
  try {
    const cache = await getCacheData();
    const now = Date.now();
    if (cache.books && cache.books.data && (now - cache.books.timestamp < ONE_WEEK_MS)) {
      return res.json(cache.books.data);
    }

    const ai = getAiClient();
    if (!ai) {
      console.log('No GEMINI_API_KEY found, using fallback books');
      return res.json(fallbackBooks);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "추천 도서 5권을 추천해줘. 단순한 베스트셀러보다, 인류의 지성과 감성을 일깨운 영원한 고전이나 문학적 성취가 뛰어난 마스터피스 도서 위주로 선정해줘. JSON 배열 형태로 제목(title), 저자(author), 장르(genre), 이 작품이 왜 역사적/문학적으로 중요한지, 독자에게 어떤 통찰을 주는지를 포함한 매우 상세하고 깊이 있는 설명(description), 출판년도(year)를 포함해줘.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              genre: { type: Type.STRING },
              description: { type: Type.STRING },
              year: { type: Type.STRING }
            },
            required: ["id", "title", "author", "genre", "description", "year"]
          }
        }
      }
    });

    let newBooks = [];
    try {
      newBooks = JSON.parse(response.text?.trim() || "[]");
    } catch (e) {
      console.error('Error parsing gemini response', e);
    }

    if (newBooks.length > 0) {
      cache.books = { timestamp: now, data: newBooks };
      await saveCacheData(cache);
      return res.json(newBooks);
    } else {
      console.error('Failed to generate recommendations, using fallback');
      return res.json(fallbackBooks);
    }
  } catch (err: any) {
    if (err?.status === 400 || err?.message?.includes('API key')) {
      console.log('API key issue, using fallback books');
    } else {
      console.error('Book recommendation error:', err);
    }
    return res.json(fallbackBooks);
  }
});

router.post('/books/refresh', async (req, res) => {
  try {
    const cache = await getCacheData();
    const now = Date.now();

    const ai = getAiClient();
    if (!ai) {
      console.log('No GEMINI_API_KEY found, using fallback books');
      return res.json(fallbackBooks);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "추천 도서 5권을 추천해줘. 단순한 베스트셀러보다, 인류의 지성과 감성을 일깨운 영원한 고전이나 문학적 성취가 뛰어난 마스터피스 도서 위주로 선정해줘. 이전에 추천했던 것과 다른 도서들을 포함해줘. JSON 배열 형태로 제목(title), 저자(author), 장르(genre), 이 작품이 왜 역사적/문학적으로 중요한지, 독자에게 어떤 통찰을 주는지를 포함한 매우 상세하고 깊이 있는 설명(description), 출판년도(year)를 포함해줘.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.NUMBER },
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              genre: { type: Type.STRING },
              description: { type: Type.STRING },
              year: { type: Type.STRING }
            },
            required: ["id", "title", "author", "genre", "description", "year"]
          }
        }
      }
    });

    let newBooks = [];
    try {
      newBooks = JSON.parse(response.text?.trim() || "[]");
    } catch (e) {
      console.error('Error parsing gemini response', e);
    }

    if (newBooks.length > 0) {
      cache.books = { timestamp: now, data: newBooks };
      await saveCacheData(cache);
      return res.json(newBooks);
    } else {
      console.error('Failed to generate recommendations, using fallback');
      return res.json(fallbackBooks);
    }
  } catch (err: any) {
    if (err?.status === 400 || err?.message?.includes('API key')) {
      console.log('API key issue, using fallback books');
    } else {
      console.error('Book recommendation error:', err);
    }
    return res.json(fallbackBooks);
  }
});

export default router;
