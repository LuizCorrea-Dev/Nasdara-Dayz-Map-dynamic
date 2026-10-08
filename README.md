# 🗺️ Nasdara DayZ — Mapa Interativo & Guia de Sobrevivência

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Styled Components](https://img.shields.io/badge/Styled--Components-6-DB7093?logo=styledcomponents&logoColor=white)](https://styled-components.com/)
[![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-yellow.svg)](LICENSE)

> **Mapa interativo dinâmico e guia tático de sobrevivência completo para a Província de Nasdara (DayZ)**.  
> Desenvolvido com foco **Mobile-First**, suporte nativo a **Tema Claro (Light Mode)** e **Tema Escuro (Dark Mode)**, e dados reais de posicionamento em escala 1:1.

---

## 🧭 Visão Geral

O projeto **Nasdara DayZ** foi concebido para fornecer aos sobreviventes de DayZ uma experiência de cartografia fluida, ágil e completa diretamente no navegador de celulares, tablets ou desktops.

Com um mapa de **16.384m × 16.384m** nativo e mais de **5.000 pontos de interesse catalogados**, a aplicação permite planejar rotas de loot, calcular necessidades de hidratação no calor desértico e localizar recursos vitais sem poluir a visão do jogador.

---

## ✨ Funcionalidades Principais

### 🗺️ 1. Cartografia de Alta Resolução (Leaflet)
- **Escala 1:1 Nativa:** Grade de coordenadas de 0 a 16.384 metros convertida perfeitamente para o motor Leaflet (`CRS.Simple`).
- **Tiles em Alta Definição:** Carregamento dinâmico em múltiplos níveis de zoom com renderização instantânea de relevo, estradas e construções.
- **Ferramenta de Medição de Distância:** Cálculo de distâncias em tempo real entre pontos no mapa.

### 🎯 2. Sistema Avançado de Filtros e Categorias
- **Categorização Visual com Cores e Ícones:**
  - 🔴 **Militar:** Bases, quartéis, postos avançados e bunkers.
  - 🟢 **Médico:** Hospitais, clínicas e tendas de socorro.
  - 🔵 **Cidades & Vilarejos:** Centros urbanos principais e povoados rurais.
  - 💧 **Água Potável:** Poços artesianos e bombas d'água manuais.
  - 🚔 **Delegacias:** Postos policiais e delegacias municipais.
  - 🏎️ **Veículos & Motos:** Pontos de spawn de automóveis, motocicletas e peças mecânicas (Atualização 1.30).
  - 🏗️ **Construção & Industrial:** Galpões, fábricas e canteiros de obras.
  - 🌾 **Rural:** Fazendas, celeiros e torres de caça.
- **Alternância com Ícone de Olho (`Eye` / `EyeOff`):** Ative ou oculte marcadores individualmente por categoria com um único toque.
- **Preset Padrão Inteligente:** Por padrão, exibe apenas os elementos essenciais de sobrevivência (cidades principais, vilarejos, motos, delegacias e poços de água), mantendo a navegação limpa e objetiva.

### 📌 3. Marcadores Personalizados do Jogador
- Criação e fixação de marcadores customizados pelo usuário.
- Edição e remoção de pontos com anotações e ícones customizados.
- **Persistência Local (`LocalStorage`):** Suas anotações, esconderijos de loot e bases salvas persistem entre sessões sem necessidade de cadastro.

### 📻 4. Guia Oficial de Sobrevivência de Nasdara
- **História & Lore:** Contextualização geográfica da província desértica e táticas para as zonas de calor extremo.
- **Transmissor de Rádio & Morse Interativo:**
  - Sintetizador de áudio real via Web Audio API (`AudioContext`).
  - Transmissões militares gravadas (Torre Alfa, Bunker K-7, etc.) com áudio em código Morse audível.
  - Controle de parada instantânea (`Stop`) e alternância sem sobreposição de áudio.
- **Calculadora de Hidratação:**
  - Estima o consumo de água por quilômetro percorrido considerando distância, temperatura ambiente (°C) e peso do inventário transportado (kg).
- **Aba de Créditos & Fonte de Dados:**
  - Reconhecimento completo e link direto para a comunidade [TheDayZ.ru](https://thedayz.ru/).

### 📱 5. Arquitetura Mobile-First & Design System
- **Thumb Zone Ergonomics:** Doca inferior com controles rápidos posicionados na área de alcance natural do polegar em smartphones.
- **Multiplataforma Agnóstica:** Construído em `styled-components` sem estilos fixos redundantes, fluido para qualquer resolução.
- **Temas Claro e Escuro (Light / Dark Mode):** Paletas com contraste calibrado (WCAG 4.5:1+) e troca suave de tema em um toque.
- **Modais e Drawers Responsivos:** Guia oficial com visualização 80% em telas amplas e 95% em dispositivos móveis.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Descrição |
|---|---|
| **React 19** | Biblioteca declarativa para construção de interfaces SPA modernas |
| **TypeScript** | Tipagem estática rigorosa para estabilidade e produtividade |
| **Vite** | Bundler e ambiente de desenvolvimento ultrarrápido |
| **Leaflet** | Biblioteca líder para renderização de mapas interativos |
| **Styled Components** | CSS-in-JS modular com suporte nativo a theming dinâmico |
| **Lucide React** | Conjunto moderno e limpo de ícones SVG vetorizados |
| **Web Audio API** | Síntese de frequências e tons em código Morse em tempo real |

---

## 📂 Estrutura do Projeto

```text
nasdara-dayz/
├── src/
│   ├── components/
│   │   ├── guide/
│   │   │   └── NasdaraSurvivalGuide.tsx   # Modal com abas de Lore, Rádio Morse, Calculadora e Créditos
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                 # Barra superior com busca, temas e atalhos
│   │   │   ├── MobileThumbDock.tsx        # Doca inferior ergonômica para smartphones
│   │   │   ├── SidebarFilterDrawer.tsx    # Gaveta lateral de filtros (Desktop)
│   │   │   └── Footer.tsx                 # Rodapé com autoria e status
│   │   ├── map/
│   │   │   ├── NasdaraLeafletMap.tsx      # Core do Leaflet com projeção 16.384m e tiles
│   │   │   ├── CategoryFilterBar.tsx      # Barra de categorias com cores e botões de visibilidade
│   │   │   ├── MobileFilterDrawer.tsx     # Gaveta de filtros para dispositivos móveis
│   │   │   ├── LocationDetailSheet.tsx    # Ficha de detalhes do ponto selecionado
│   │   │   ├── AddMarkerDialog.tsx        # Criação de marcador personalizado
│   │   │   └── EditMarkerDialog.tsx       # Edição de marcador personalizado
│   │   └── ui/
│   │       ├── Button.tsx                 # Botão com variantes, estados e acessibilidade
│   │       ├── IconButton.tsx             # Botões de ícone com touch targets mínimos de 48px
│   │       ├── Card.tsx                   # Superfícies e cards temáticos
│   │       ├── Badge.tsx                  # Etiquetas e chips de status
│   │       ├── Input.tsx                  # Campos de formulário estilizados
│   │       └── BottomSheet.tsx            # Modais deslizantes para mobile e desktop
│   ├── data/
│   │   ├── dayzFilterSchema.ts            # Esquema de cores, ícones e hierarquia de filtros
│   │   ├── nasdaraData.ts                 # Transmissões de rádio, lore e dados de calor
│   │   ├── nasdaraRealMarkers.json        # Base tratada de +5.000 POIs reais do DayZ
│   │   └── nasdaraTypes.ts                # Definições de tipos TypeScript do mapa
│   ├── theme/
│   │   ├── ThemeContext.tsx               # Contexto React para alternância Claro/Escuro
│   │   ├── lightTheme.ts                  # Paleta Light Mode (alto contraste, limpo)
│   │   ├── darkTheme.ts                   # Paleta Dark Mode (cinza escuro e ardósia)
│   │   └── theme.types.ts                 # Tipagem estrita de cores e espaçamentos
│   ├── App.tsx                            # Componente raiz da aplicação
│   └── main.tsx                           # Ponto de entrada Vite
├── metadata.json                          # Metadados da aplicação no ambiente
├── package.json                           # Dependências e scripts
└── README.md                              # Documentação do projeto
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior recomendada)
- **npm** ou **pnpm** / **yarn**

### 1. Clonar o repositório
```bash
git clone https://github.com/Rootszera/nasdara-dayz.git
cd nasdara-dayz
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### 4. Compilar para produção
```bash
npm run build
```

---

## 🤝 Créditos & Agradecimentos

- **Idealização & Desenvolvimento:** Criado por **Rootszera**.
- **Cartografia & Tiles de Terreno:** Fatias do mapa de satélite e dados de base cortesia da comunidade [TheDayZ.ru](https://thedayz.ru/).
- **DayZ & Bohemia Interactive:** DayZ e os assets do universo do jogo são marcas registradas da Bohemia Interactive.

---

## 📄 Licença

Este projeto é disponibilizado sob a licença [MIT](LICENSE). Sinta-se livre para usar, colaborar e aprimorar para a comunidade de DayZ.
