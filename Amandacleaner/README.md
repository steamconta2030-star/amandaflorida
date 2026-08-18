# Amanda Cleaning Co. — Landing Page

Landing page em página única (HTML/CSS/JS, sem dependências de build) para captação de clientes do serviço de limpeza da Amanda em Tampa, FL.

## Estrutura

```
.
├── index.html   # página completa (HTML + CSS + JS embutidos)
├── README.md
└── .gitignore
```

## Antes de publicar — trocar os dados de contato

No arquivo `index.html`, procure e substitua:

| O que trocar | Onde procurar |
|---|---|
| Telefone | `(813) 555-0123` (aparece 2x: `tel:` e texto) |
| WhatsApp | `https://wa.me/18135550123` (troque pelo número real, só dígitos, com código do país) |
| E-mail | `amanda@amandacleaningco.com` (aparece 2x: contato e formulário) |
| Bairros atendidos | seção `.zone-tags`, perto de `<!-- área -->` |

O formulário de orçamento é 100% front-end: ao enviar, ele abre o app de e-mail do visitante com os dados preenchidos (via `mailto:`). Não precisa de backend nem servidor.

## Como subir para o GitHub

1. Crie um repositório novo no GitHub (ex: `amanda-cleaning-site`), sem inicializar com README (para não dar conflito).
2. No terminal, dentro desta pasta:

```bash
git init
git add .
git commit -m "primeira versão da landing page"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/amanda-cleaning-site.git
git push -u origin main
```

## Como publicar de graça com GitHub Pages

1. No repositório, vá em **Settings → Pages**.
2. Em **Source**, selecione a branch `main` e a pasta `/ (root)`.
3. Salve. Em alguns minutos o site fica no ar em:
   `https://SEU-USUARIO.github.io/amanda-cleaning-site/`

### Domínio próprio (opcional)
Se a Amanda comprar um domínio (ex: `amandacleaningco.com`), crie um arquivo `CNAME` na raiz do repositório contendo só o domínio, e configure o DNS do domínio apontando para o GitHub Pages.

## Tecnologias

- HTML5 + CSS puro (variáveis CSS, grid/flexbox)
- JavaScript puro (sem frameworks)
- Fontes: Fraunces + Inter + IBM Plex Mono (Google Fonts, via CDN)

Nenhuma etapa de build é necessária — é só abrir o `index.html` no navegador ou publicar direto.
