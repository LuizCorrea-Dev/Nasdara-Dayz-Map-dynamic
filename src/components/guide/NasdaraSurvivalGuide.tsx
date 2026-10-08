import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import {
  Compass,
  Droplet,
  Radio,
  Flame,
  Volume2,
  Lock,
  Wrench,
  Shield,
  Activity,
  Calculator,
  Play,
  Square,
  BookOpen,
  ExternalLink,
  Globe,
  Database,
} from 'lucide-react';
import { RADIO_SIGNALS, RadioMorseSignal } from '../../data/nasdaraData';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface NasdaraSurvivalGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCoordinate?: (x: number, y: number) => void;
}

type GuideTab = 'overview' | 'wells' | 'motorcycles' | 'buildings' | 'morse' | 'calculator' | 'credits';

const TabsHeader = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
  overflow-x: auto;
  padding-bottom: ${props => props.theme.spacing.sm};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  min-height: 44px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid
    ${props =>
      props.$active ? props.theme.colors.primary : 'transparent'};
  background-color: ${props =>
    props.$active
      ? props.theme.colors.surfaceVariant
      : 'transparent'};
  color: ${props =>
    props.$active ? props.theme.colors.text : props.theme.colors.textSecondary};

  &:hover {
    background-color: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.text};
  }
`;

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.md};
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const Paragraph = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textSecondary};
`;

const SignalCard = styled(Card)`
  gap: ${props => props.theme.spacing.sm};
  border-left: 4px solid ${props => props.theme.colors.radio};
`;

const MorseText = styled.pre`
  background-color: ${props => props.theme.colors.surfaceVariant};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-family: monospace;
  font-size: 13px;
  margin: 0;
  color: ${props => props.theme.colors.primary};
  overflow-x: auto;
`;

const CalculatorBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.surfaceVariant};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
`;

const SliderGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const RangeInput = styled.input`
  width: 100%;
  accent-color: ${props => props.theme.colors.primary};
  height: 6px;
  cursor: pointer;
`;

const CreditGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: ${props => props.theme.spacing.sm};
`;

const CreditHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CreditIconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
`;

const CreditBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

export const NasdaraSurvivalGuide: React.FC<NasdaraSurvivalGuideProps> = ({
  isOpen,
  onClose,
  onSelectCoordinate,
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('overview');
  const [playingSignal, setPlayingSignal] = useState<string | null>(null);

  // Calculator state
  const [calcDistance, setCalcDistance] = useState<number>(5); // km
  const [calcTemp, setCalcTemp] = useState<number>(38); // Celsius
  const [calcWeight, setCalcWeight] = useState<number>(25); // kg load

  // References to active Web Audio context and completion timer
  const audioContextRef = useRef<AudioContext | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Stop any ongoing audio immediately
  const stopMorseAudio = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      } catch {
        // AudioContext closing fallback
      }
      audioContextRef.current = null;
    }
    setPlayingSignal(null);
  };

  // Play or immediately stop Morse transmission
  const toggleMorseAudio = (morse: string, sigId: string) => {
    // If the clicked signal is already playing, stop immediately!
    if (playingSignal === sigId) {
      stopMorseAudio();
      return;
    }

    // If another signal is playing, stop it first before starting
    stopMorseAudio();

    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      const audioCtx = new AudioCtxClass();
      audioContextRef.current = audioCtx;
      setPlayingSignal(sigId);

      const dotTime = 0.08; // 80ms for a dot
      let currentTime = audioCtx.currentTime + 0.05;

      for (const char of morse) {
        if (char === '.') {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.value = 750;
          gain.gain.setValueAtTime(0.12, currentTime);
          gain.gain.setValueAtTime(0, currentTime + dotTime);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(currentTime);
          osc.stop(currentTime + dotTime);
          currentTime += dotTime * 2;
        } else if (char === '-') {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.value = 750;
          gain.gain.setValueAtTime(0.12, currentTime);
          gain.gain.setValueAtTime(0, currentTime + dotTime * 3);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(currentTime);
          osc.stop(currentTime + dotTime * 3);
          currentTime += dotTime * 4;
        } else if (char === ' ') {
          currentTime += dotTime * 3;
        } else if (char === '/') {
          currentTime += dotTime * 7;
        }
      }

      const totalDuration = Math.max(0, (currentTime - audioCtx.currentTime) * 1000);
      timeoutRef.current = window.setTimeout(() => {
        stopMorseAudio();
      }, totalDuration);
    } catch {
      stopMorseAudio();
    }
  };

  // Stop audio whenever modal closes or tab changes or component unmounts
  useEffect(() => {
    if (!isOpen) {
      stopMorseAudio();
    }
    return () => {
      stopMorseAudio();
    };
  }, [isOpen]);

  useEffect(() => {
    stopMorseAudio();
  }, [activeTab]);

  // Water Calculation formulas in desert heat
  const baseWaterPerHour = 0.6; // liters/h
  const tempMultiplier = calcTemp > 30 ? 1 + (calcTemp - 30) * 0.08 : 1;
  const weightMultiplier = 1 + (calcWeight / 50) * 0.5;
  const travelTimeHours = calcDistance / 5; // walking at 5 km/h
  const totalWaterNeeded = (
    baseWaterPerHour *
    tempMultiplier *
    weightMultiplier *
    travelTimeHours
  ).toFixed(2);
  const canteensNeeded = Math.ceil(Number(totalWaterNeeded) / 1.0); // 1L per canteen

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Guia Oficial da Província de Nasdara (DayZ Badlands)"
      subtitle="Manual Completo de Sobrevivência e Mecânicas da DLC 1.30 em Português BR"
      maxHeight="90vh"
      width="80vw"
      mobileWidth="95vw"
      maxWidth="80vw"
      zIndex={2500}
    >
      <TabsHeader>
        <TabButton
          $active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        >
          <BookOpen size={16} /> Visão Geral
        </TabButton>
        <TabButton
          $active={activeTab === 'wells'}
          onClick={() => setActiveTab('wells')}
        >
          <Droplet size={16} /> Poços 1.30
        </TabButton>
        <TabButton
          $active={activeTab === 'motorcycles'}
          onClick={() => setActiveTab('motorcycles')}
        >
          <Compass size={16} /> Motos 1.30
        </TabButton>
        <TabButton
          $active={activeTab === 'buildings'}
          onClick={() => setActiveTab('buildings')}
        >
          <Wrench size={16} /> 5.000 Edifícios
        </TabButton>
        <TabButton
          $active={activeTab === 'morse'}
          onClick={() => setActiveTab('morse')}
        >
          <Radio size={16} /> Sinais de Rádio Morse
        </TabButton>
        <TabButton
          $active={activeTab === 'calculator'}
          onClick={() => setActiveTab('calculator')}
        >
          <Calculator size={16} /> Calculadora de Água
        </TabButton>
        <TabButton
          $active={activeTab === 'credits'}
          onClick={() => setActiveTab('credits')}
        >
          <Globe size={16} /> Créditos (TheDayZ.ru)
        </TabButton>
      </TabsHeader>

      <TabContent>
        {activeTab === 'overview' && (
          <>
            <SectionTitle>A Província Árida de Nasdara (267 km²)</SectionTitle>
            <Paragraph>
              Nasdara é o maior mapa oficial já criado para o DayZ, abrangendo 267 km² de terreno
              árido a oeste de Chernarus e fazendo fronteira com Takistan. Marcada por guerras
              anteriores por procuração, a província combina cidades com arquitetura
              médio-oriental, antigas instalações soviéticas, refinarias petrolíferas abandonadas e
              dunas infinitas.
            </Paragraph>
            <Paragraph>
              <strong>Principais Desafios de Sobrevivência:</strong>
              <br />• <em>Calor Escaldante e Insolação:</em> Correr durante o meio-dia causa
              hipertermia rápida e multiplica o consumo de água.
              <br />• <em>Tempestades de Areia Dinâmicas:</em> Reduzem a visibilidade a menos de 10
              metros e causam tosse e asfixia sem máscaras ou bandanas de proteção.
              <br />• <em>Infectados Mutantes do Deserto:</em> Adaptados ao clima, correm mais rápido
              e possuem camuflagem natural entre a poeira.
            </Paragraph>
          </>
        )}

        {activeTab === 'wells' && (
          <>
            <SectionTitle>Mecânica de Poços de Água Reparáveis (Atualização 1.30)</SectionTitle>
            <Paragraph>
              Ao contrário de Chernarus e Livonia onde todas as fontes d'água fluem livremente, em
              Nasdara mais de 70% dos poços foram sabotados ou estão desgastados pela areia e ferrugem.
            </Paragraph>
            <Card variant="surfaceVariant" padding="md">
              <strong>Como consertar um poço danificado:</strong>
              <ol style={{ margin: '8px 0 0 16px', padding: 0, fontSize: '13px' }}>
                <li>Encontre uma Chave Inglesa (Wrench) ou Alicate de Pressão.</li>
                <li>Obtenha um Tubo Metálico ou Vedação de Borracha em áreas industriais.</li>
                <li>Aproxime-se da bomba manual e execute a ação "Reparar Poço de Água".</li>
                <li>O poço funcionará por um período e fornecerá até 200 litros de água limpa!</li>
              </ol>
            </Card>
            <Paragraph>
              <strong>Atenção:</strong> Águas paradas em leitos de rio seco (Wadi) exigem fervura na
              fogueira ou Pastilhas de Cloro (Water Purification Tablets) para evitar infecção por
              Cólera.
            </Paragraph>
          </>
        )}

        {activeTab === 'motorcycles' && (
          <>
            <SectionTitle>Novas Motocicletas 1.30: Moto Enduro e Ciclomotor (Moped)</SectionTitle>
            <Paragraph>
              A atualização 1.30 traz veículos de duas rodas com um novo motor físico de inclinação,
              estabilidade e consumo de combustível:
            </Paragraph>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Card variant="surfaceVariant" padding="sm">
                <Badge variant="vehicle">MOTO ENDURO 250cc</Badge>
                <Paragraph style={{ fontSize: '12px', marginTop: '6px' }}>
                  Projetada para saltar dunas e subir encostas rochosas íngremes. Velocidade máxima
                  de 90 km/h, suspensão de longo curso e espaço traseiro para amarrar uma mochila ou
                  galão de combustível.
                </Paragraph>
              </Card>
              <Card variant="surfaceVariant" padding="sm">
                <Badge variant="vehicle">CICLOMOTOR (MOPED) 50cc</Badge>
                <Paragraph style={{ fontSize: '12px', marginTop: '6px' }}>
                  Motor de baixa rotação quase inaudível para zumbis. Consome pouquíssima gasolina e
                  precisa apenas de uma vela de ignição e pneu básico para rodar.
                </Paragraph>
              </Card>
            </div>
            <Paragraph>
              <strong>Dica de Pilotagem:</strong> Use capacete de motociclista. Quedas em alta
              velocidade nas pedras de Nasdara resultam em fratura exposta imediata de fêmur!
            </Paragraph>
          </>
        )}

        {activeTab === 'buildings' && (
          <>
            <SectionTitle>Reconstrução de 5.000 Edifícios Destruídos</SectionTitle>
            <Paragraph>
              Pela primeira vez em DayZ, os sobreviventes podem transformar construções arruinadas
              da guerra em abrigos fortificados e bases permanentes.
            </Paragraph>
            <Card variant="surfaceVariant" padding="md">
              <strong>Passo a passo da Reconstrução:</strong>
              <Paragraph style={{ fontSize: '13px', marginTop: '4px' }}>
                1. Limpe os escombros da porta ou janela com uma Pá ou Picareta.
                <br />
                2. Use Tábuas de Madeira e Pregos com Martelo para tampar fendas.
                <br />
                3. Instale a nova <strong>Fechadura com Código (Code Lock 1.30)</strong> diretamente
                nas portas de madeira ou metal para proteger seus pertences de invasores.
              </Paragraph>
            </Card>
          </>
        )}

        {activeTab === 'morse' && (
          <>
            <SectionTitle>Decodificador de Rádio Morse & Segredos do Bunker K-7</SectionTitle>
            <Paragraph>
              Sintonize receptores de rádio portáteis nas frequências militares para interceptar
              mensagens automáticas transmitidas pelas torres de rádio de Nasdara.
            </Paragraph>

            {RADIO_SIGNALS.map(sig => {
              const isPlaying = playingSignal === sig.frequency;
              return (
                <SignalCard key={sig.frequency} variant="surface">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{sig.signalName}</strong>
                      <div style={{ fontSize: '12px', color: '#888' }}>Frequência: {sig.frequency}</div>
                    </div>
                    <Button
                      size="sm"
                      variant={isPlaying ? 'danger' : 'outline'}
                      leftIcon={isPlaying ? <Square size={14} /> : <Play size={14} />}
                      onClick={() => toggleMorseAudio(sig.morseCode, sig.frequency)}
                      title={isPlaying ? 'Parar transmissão imediatamente' : 'Ouvir transmissão de rádio'}
                    >
                      {isPlaying ? 'Parar Áudio' : 'Ouvir Sinal'}
                    </Button>
                  </div>

                  <MorseText>{sig.morseCode}</MorseText>

                  <div style={{ fontSize: '13px' }}>
                    <strong>Mensagem Traduzida:</strong> {sig.messageDecoded}
                  </div>

                  <div style={{ fontSize: '12px', opacity: 0.85 }}>
                    <em>Dica tática:</em> {sig.secretHint}
                  </div>
                </SignalCard>
              );
            })}
          </>
        )}

        {activeTab === 'calculator' && (
          <>
            <SectionTitle>Calculadora de Hidratação do Deserto</SectionTitle>
            <Paragraph>
              Estime quanto de água você precisará para cruzar as dunas sem morrer de sede.
            </Paragraph>

            <CalculatorBox>
              <SliderGroup>
                <SliderLabel>
                  <span>Distância da Marcha</span>
                  <span>{calcDistance} km</span>
                </SliderLabel>
                <RangeInput
                  type="range"
                  min="1"
                  max="16"
                  step="0.5"
                  value={calcDistance}
                  onChange={e => setCalcDistance(Number(e.target.value))}
                />
              </SliderGroup>

              <SliderGroup>
                <SliderLabel>
                  <span>Temperatura Ambiente</span>
                  <span>{calcTemp}°C</span>
                </SliderLabel>
                <RangeInput
                  type="range"
                  min="20"
                  max="48"
                  step="1"
                  value={calcTemp}
                  onChange={e => setCalcTemp(Number(e.target.value))}
                />
              </SliderGroup>

              <SliderGroup>
                <SliderLabel>
                  <span>Peso da Carga / Mochila</span>
                  <span>{calcWeight} kg</span>
                </SliderLabel>
                <RangeInput
                  type="range"
                  min="5"
                  max="45"
                  step="1"
                  value={calcWeight}
                  onChange={e => setCalcWeight(Number(e.target.value))}
                />
              </SliderGroup>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginTop: '8px',
                }}
              >
                <Card variant="surface" padding="sm">
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.7 }}>
                    Consumo Estimado
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {totalWaterNeeded} L
                  </div>
                </Card>
                <Card variant="surface" padding="sm">
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.7 }}>
                    Cantis Recomendados
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {canteensNeeded} cantis cheios
                  </div>
                </Card>
              </div>
            </CalculatorBox>
          </>
        )}

        {activeTab === 'credits' && (
          <>
            <SectionTitle>Créditos & Reconhecimento de Dados</SectionTitle>
            <Paragraph>
              A infraestrutura cartográfica e as coordenadas geoespaciais deste mapa interativo
              são derivadas da base de dados aberta mantida pela plataforma <strong>TheDayZ.ru</strong>.
            </Paragraph>

            <Card variant="surface" padding="md">
              <CreditHeader>
                <CreditIconWrapper>
                  <Globe size={24} />
                </CreditIconWrapper>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>TheDayZ.ru</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    Portal de Cartografia e Recursos Comunitários para DayZ
                  </div>
                </div>
              </CreditHeader>

              <Paragraph style={{ marginBottom: '12px' }}>
                O <strong>TheDayZ.ru</strong> é um dos principais portais de mapeamento e inteligência tática
                para a comunidade de DayZ. A plataforma fornece fatias de mapas (tiles) em altíssima resolução,
                além de compilar coordenadas exatas de spawns, estruturas, fontes de água e pontos de interesse
                extraídos diretamente dos arquivos dos mapas do jogo.
              </Paragraph>

              <CreditBadgeRow>
                <Badge variant="primary">Tiles em 16.384m</Badge>
                <Badge variant="water">Poços & Fontes</Badge>
                <Badge variant="military">Instalações Militares</Badge>
                <Badge variant="vehicle">Spawns de Veículos</Badge>
                <Badge variant="default">Cidades & Vilarejos</Badge>
              </CreditBadgeRow>

              <a
                href="https://thedayz.ru/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant="primary"
                  leftIcon={<ExternalLink size={16} />}
                  fullWidth
                >
                  Visitar TheDayZ.ru Oficial (https://thedayz.ru/)
                </Button>
              </a>
            </Card>

            <SectionTitle style={{ fontSize: '15px' }}>Detalhamento dos Recursos Utilizados</SectionTitle>

            <CreditGrid>
              <Card variant="surfaceVariant" padding="sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Database size={16} color="#EA580C" />
                  <strong>Camada de Terreno (Tiles)</strong>
                </div>
                <div style={{ fontSize: '12px', opacity: 0.85, lineHeight: 1.5 }}>
                  O mapa base de satélite e relevo com zoom contínuo é carregado a partir do serviço de tiles
                  de Nasdara hospedado pela infraestrutura do TheDayZ.ru.
                </div>
              </Card>

              <Card variant="surfaceVariant" padding="sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Shield size={16} color="#3B82F6" />
                  <strong>Coordenadas e Marcadores</strong>
                </div>
                <div style={{ fontSize: '12px', opacity: 0.85, lineHeight: 1.5 }}>
                  Os mais de 5.000 pontos de interesse (vilas, ruínas, delegacias, oficinas, poços e postos médicos)
                  usam a geometria matemática oficial de Nasdara.
                </div>
              </Card>
            </CreditGrid>

            <Paragraph style={{ fontSize: '12px', opacity: 0.75 }}>
              Nossos sinceros agradecimentos à equipe e aos desenvolvedores do <strong>TheDayZ.ru</strong> por
              disponibilizarem e apoiarem a comunidade de jogadores e criadores com mapas de alta qualidade!
            </Paragraph>
          </>
        )}
      </TabContent>
    </BottomSheet>
  );
};
