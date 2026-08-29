# Cultura Perto

<p align="center">
  <strong>Plataforma colaborativa para descoberta de eventos culturais nas comunidades</strong><br>
  <em>Desafio dos Dados 2026 — Tema 2: Ampliação do Acesso à Cultura</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange" alt="Status">
  <img src="https://img.shields.io/badge/React-19-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.8-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Firebase-Firestore-orange" alt="Firebase">
  <img src="https://img.shields.io/badge/Licença-MIT-green" alt="Licença">
</p>

---

## Sobre o projeto

O **Cultura Perto** é uma plataforma web gratuita que conecta pessoas a eventos culturais que acontecem perto de onde moram. O projeto nasceu da realidade de Montezuma (MG) — cidade com pouco mais de 8 mil habitantes — onde a divulgação cultural ainda acontece por boca em boca, cartazes e grupos de WhatsApp, sem um lugar único para consulta.

A plataforma permite que qualquer pessoa cadastre e descubra eventos com filtros por cidade, estado, categoria, preço, data e acessibilidade, usando geolocalização do navegador e dados abertos.

**Diferenciais:**
- Geolocalização automática com Nominatim (OpenStreetMap) — sem API paga
- Painel de indicadores com gráficos por categoria, cidade e mês
- **Mapa do Vazio Cultural** — identifica bairros sem eventos cadastrados
- Exportação em CSV para análises externas
- Funciona em celulares e conexões lentas, com fallback local

O projeto dialoga com os **ODS 4 (Educação de Qualidade), 10 (Redução das Desigualdades) e 11 (Cidades e Comunidades Sustentáveis)** da ONU.

---

## Funcionalidades

- Listagem de eventos com busca e filtros combinados
- Cadastro de eventos em 5 etapas (imagem, informações, localização, acessibilidade, contato)
- Página de detalhes com mapa, compartilhamento via WhatsApp e cópia de link
- Painel de indicadores com visualizações (Recharts)
- Geolocalização automática + seleção manual de cidade/estado
- Armazenamento em Firebase Firestore com fallback em localStorage

---

## Tecnologias

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Banco de dados:** Firebase Firestore
- **Geolocalização:** OpenStreetMap Nominatim
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **Hospedagem:** Vercel

---

## Como rodar localmente

**Pré-requisitos:** Node.js 18+

```bash
# 1. Clone o repositório
git clone https://github.com/williandevbr/cultura-perto.git
cd cultura-perto

# 2. Instale as dependências
npm install

# 3. Configure o Firebase
# Crie um projeto em console.firebase.google.com e copie as chaves para firebase-applet-config.json
# Veja o exemplo em firebase-applet-config.json

# 4. Rode o app
npm run dev
```

Acesse `http://localhost:3000`

**Build de produção:**
```bash
npm run build
```

---

## Estrutura do projeto

```
cultura-perto/
├── src/
│   ├── components/    # Navbar, LocationModal
│   ├── pages/         # Home, EventList, EventDetails, CreateEvent, Indicators, About
│   ├── lib/           # firebase, events, seed, utils
│   └── context/       # LocationContext
├── public/
├── firebase-applet-config.json
├── firestore.rules
└── vercel.json
```

---

## Equipe

**Squad: Insight Makers**

- Willian Jonatan de Oliveira Barbosa
- Danilo Dantas Santana
- Erick Melo dos Santos

**Orientador:** Prof. Rodolfo Pablo Fernandes  
**Instituição:** Escola Estadual Edson Alves Pereira — Montezuma, MG

---

## Documentação

- **Projeto escrito (PDF):** `cultura_perto_projeto.pdf` (18 páginas, ABNT)
- **Apresentação transmídia:** vídeo + carrossel Instagram + infográfico

---

## Licença

Este projeto é de código aberto sob a licença MIT.

---

<p align="center">
  Feito com dedicação pela equipe Insight Makers para o Desafio dos Dados 2026
</p>
