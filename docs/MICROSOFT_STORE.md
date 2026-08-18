# Publicar Tidly na Microsoft Store — custo zero

O Tidly já é um PWA instalável. A Microsoft Store aceita PWAs empacotados
pelo PWABuilder gratuitamente (só a conta de dev tem custo one-time).

## Passo a passo

1. Publique o site (já está em `https://amandaflorida.com`).
2. Abra <https://www.pwabuilder.com>.
3. Cole a URL e clique **Start**. O audit deve passar (manifest, ícones,
   HTTPS, service worker opcional).
4. Clique **Package for Stores → Windows**.
5. Baixe o pacote (`.msixbundle` + `.classic.appxbundle` + `.sid` file).
6. Crie uma conta de desenvolvedor Microsoft (Partner Center):
   - Individual: **$19 (pagamento único, vitalício)**.
   - <https://partner.microsoft.com/dashboard/registration>
7. Em Partner Center → **Apps and games → New product → MSIX or PWA app**.
8. Reserve o nome "Tidly".
9. Faça upload do `.msixbundle`. Preencha:
   - Categoria: **Lifestyle**
   - Idade: **3+**
   - Descrição: use o texto de `/about` + `/services`
   - Screenshots: capture 3 telas em 1366×768 ou 1920×1080 (desktop)
   - Ícone Store: `public/icon-512.png`
   - Privacy policy URL: `https://amandaflorida.com/privacy`
10. Submeta. Aprovação típica: **24-72 h**.

## Atualizações

Como `capacitor.config.ts` e o PWA apontam para o site publicado, qualquer
mudança de conteúdo/preço/UI aparece automaticamente no app da Store — sem
resubmissão. Só re-envie um novo `.msixbundle` se mudar `manifest.webmanifest`,
ícones, ou permissões nativas.

## Custo total

| Item                                        | Custo         |
| ------------------------------------------- | ------------- |
| Conta Microsoft Partner Center (individual) | **$19 único** |
| PWABuilder                                  | Grátis        |
| Hospedagem PWA (Lovable)                    | Já pago       |
| Renovação anual                             | **$0**        |

Comparação: Apple $99/ano, Google Play $25 único.
